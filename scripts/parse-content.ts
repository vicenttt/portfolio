import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseTree, directChildren, indexByTitle, listItems, inlineCode,
  codeBlock, metadata, flowSteps, slug, assert, type Node,
} from './lib/markdown.ts';
import type {
  Profile, Experience, SubProject, AcademicProject, SkillGroup,
  Flow, AiPractice, Identity,
} from '../src/data/schema.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const CHAPTER_RE = /^(\d+)\.\s+(.+?)\s*$/;

function findChapter(tree: Node[], num: number): Node {
  const stack = [...tree];
  while (stack.length) {
    const n = stack.pop()!;
    const m = CHAPTER_RE.exec(n.title);
    if (m && parseInt(m[1]!, 10) === num) return n;
    stack.push(...n.children);
  }
  throw new Error(`[parse-content] CONTENT.md missing chapter ${num}`);
}

function buildIdentity(chapter: Node): Identity {
  const meta = metadata(chapter.content);
  const name = meta['name'], role = meta['primary role'], direction = meta['professional direction'];
  assert(name, '§1 missing **Name:**');
  assert(role, '§1 missing **Primary Role:**');
  assert(direction, '§1 missing **Professional Direction:**');
  return { name: name!, role: role!, direction: direction! };
}

function buildPositioning(chapter: Node): string {
  const fields = indexByTitle(directChildren(chapter));
  const positioning = fields['Positioning'];
  assert(positioning, '§1 missing "### Positioning"');
  return positioning!.content.trim();
}

function buildExperience(chapter: Node): Experience[] {
  return directChildren(chapter).map((companyNode) => {
    const headerMatch = /^(.+?)\s*[—–-]\s*(.+?)\s*\|\s*(.+?)\s*$/.exec(companyNode.title);
    assert(headerMatch, `Cannot parse "${companyNode.title}"`);
    const [, company, role, period] = headerMatch!;
    const subs = directChildren(companyNode);
    assert(subs.length > 0, `Company "${company}" has no ### sections`);
    const hasPlatformLayer = subs.some((n) => directChildren(n).length > 0);
    let subProjects: SubProject[];
    if (hasPlatformLayer) {
      subProjects = subs.map((platformNode) => {
        const fields = indexByTitle(directChildren(platformNode));
        assert(fields['Responsibilities'], `Platform "${platformNode.title}" missing Responsibilities`);
        return {
          id: `exp-${slug(company!)}-${slug(platformNode.title)}`,
          name: platformNode.title,
          responsibilities: listItems(fields['Responsibilities']!.content),
          technology: inlineCode(fields['Technology']?.content ?? ''),
          themes: inlineCode(fields['Key Themes']?.content ?? ''),
        };
      });
    } else {
      const fields = indexByTitle(subs);
      assert(fields['Responsibilities'], `Company "${company}" missing Responsibilities`);
      subProjects = [{
        id: `exp-${slug(company!)}-general`,
        name: 'General',
        responsibilities: listItems(fields['Responsibilities']!.content),
        technology: inlineCode(fields['Technology']?.content ?? ''),
        themes: inlineCode(fields['Key Themes']?.content ?? ''),
      }];
    }
    return { id: `exp-${slug(company!)}`, company: company!, role: role!, period: period!, subProjects };
  });
}

function buildAcademicProjects(chapter: Node): AcademicProject[] {
  return directChildren(chapter).map((projNode) => {
    const meta = metadata(projNode.content);
    const fields = indexByTitle(directChildren(projNode));
    const institution = meta['institution'], yearStr = meta['year'];
    assert(institution, `Project "${projNode.title}" missing Institution`);
    assert(yearStr, `Project "${projNode.title}" missing Year`);
    assert(fields['Overview'], `Project "${projNode.title}" missing Overview`);
    return {
      id: `proj-${slug(projNode.title)}`,
      name: projNode.title,
      institution: institution!,
      year: parseInt(yearStr!, 10),
      overview: fields['Overview']!.content.trim(),
      technology: inlineCode(fields['Technology']?.content ?? ''),
      development: listItems(fields['Development']?.content ?? ''),
      concepts: inlineCode(fields['Concepts']?.content ?? ''),
    };
  });
}

function buildSkills(chapter: Node): SkillGroup[] {
  return directChildren(chapter).map((n) => ({
    id: `skill-${slug(n.title)}`,
    category: n.title,
    items: inlineCode(n.content),
  }));
}

function buildCapabilities(chapter: Node): Flow[] {
  return directChildren(chapter).map((n) => {
    const items = listItems(n.content);
    const block = codeBlock(n.content);
    return {
      id: `cap-${slug(n.title)}`,
      name: n.title,
      steps: block ? flowSteps(block) : items,
      context: block && items.length ? items.join(' ') : undefined,
    };
  });
}

function buildAiPractices(chapter: Node): AiPractice[] {
  return directChildren(chapter).map((n) => {
    const fields = indexByTitle(directChildren(n));
    const workflowBlock = codeBlock(
      fields['Human Review Workflow']?.content ?? fields['AI Testing Model']?.content ?? '',
    );
    return {
      id: `ai-${slug(n.title)}`,
      name: n.title,
      description: n.content.trim(),
      bullets: listItems(n.content),
      tools: inlineCode(fields['Tools']?.content ?? ''),
      usage: listItems(fields['Usage']?.content ?? ''),
      workflowSteps: workflowBlock ? flowSteps(workflowBlock) : [],
    };
  });
}

function buildNarrative(chapter: Node): Flow {
  const block = codeBlock(chapter.content);
  const coreMessage = indexByTitle(directChildren(chapter))['Core Message'];
  return {
    id: 'narrative', name: 'Portfolio Narrative',
    steps: block ? flowSteps(block) : [],
    context: coreMessage?.content.trim(),
  };
}

function buildProfile(tree: Node[]): Profile {
  return {
    identity: buildIdentity(findChapter(tree, 1)),
    positioning: buildPositioning(findChapter(tree, 1)),
    experience: buildExperience(findChapter(tree, 2)),
    academicProjects: buildAcademicProjects(findChapter(tree, 3)),
    aiPractices: buildAiPractices(findChapter(tree, 4)),
    skills: buildSkills(findChapter(tree, 5)),
    capabilities: buildCapabilities(findChapter(tree, 6)),
    narrative: buildNarrative(findChapter(tree, 7)),
  };
}

function renderProfileModule(profile: Profile): string {
  return [
    '// AUTO-GENERATED by scripts/parse-content.ts',
    '// DO NOT EDIT MANUALLY.',
    "import type { Profile } from './schema.ts';",
    'export const profile: Profile = ' + JSON.stringify(profile, null, 2) + ';',
    '',
  ].join('\n');
}

function main(): void {
  const contentPath = resolve(ROOT, 'content/CONTENT.md');
  const outPath = resolve(ROOT, 'src/data/profile.ts');
  const md = readFileSync(contentPath, 'utf8');
  const tree = parseTree(md);
  const profile = buildProfile(tree);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderProfileModule(profile), 'utf8');
  console.log(`✓ Parsed  ${contentPath}`);
  console.log(`✓ Wrote   ${outPath}`);
  console.log(`  experience: ${profile.experience.length}`);
  console.log(`  projects:   ${profile.academicProjects.length}`);
  console.log(`  ai:         ${profile.aiPractices.length}`);
  console.log(`  skills:     ${profile.skills.length}`);
  console.log(`  caps:       ${profile.capabilities.length}`);
}

main();
