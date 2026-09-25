#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# --- scripts/lib/markdown.ts -----------------------------------------------
cat > scripts/lib/markdown.ts <<'TS'
export interface Node {
  level: number; title: string; content: string; children: Node[];
}

export function parseTree(md: string): Node[] {
  const root: Node = { level: 0, title: '', content: '', children: [] };
  const stack: Node[] = [root];
  let buffer: string[] = [];
  const flush = () => {
    const top = stack[stack.length - 1];
    if (top) top.content = buffer.join('\n').trim();
    buffer = [];
  };
  for (const line of md.split('\n')) {
    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      const level = m[1]!.length;
      const title = m[2]!.trim();
      const node: Node = { level, title, content: '', children: [] };
      while (stack.length > 1 && stack[stack.length - 1]!.level >= level) stack.pop();
      stack[stack.length - 1]!.children.push(node);
      stack.push(node);
    } else buffer.push(line);
  }
  flush();
  return root.children;
}

export function directChildren(node: Node): Node[] {
  return node.children.filter((c) => c.level === node.level + 1);
}

export function indexByTitle(nodes: Node[]): Record<string, Node> {
  const out: Record<string, Node> = {};
  for (const n of nodes) out[n.title] = n;
  return out;
}

export function listItems(content: string): string[] {
  return content.split('\n').filter((l) => /^\s*-\s+\S/.test(l))
    .map((l) => l.replace(/^\s*-\s+/, '').trim());
}

export function inlineCode(content: string): string[] {
  const out: string[] = [];
  for (const m of content.matchAll(/`([^`\n]+)`/g)) out.push(m[1]!.trim());
  return out;
}

export function codeBlock(content: string): string | undefined {
  const m = /```(?:[a-zA-Z]*)\n([\s\S]*?)```/.exec(content);
  return m ? m[1]!.trim() : undefined;
}

export function metadata(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const m = /^\*\*([^:*]+):\*\*\s*(.*?)\s*$/.exec(line);
    if (m) out[m[1]!.trim().toLowerCase()] = m[2]!.trim();
  }
  return out;
}

export function flowSteps(block: string): string[] {
  return block.split('\n').map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^[↓|]+$/.test(l));
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`[parse-content] ${msg}`);
}
TS

# --- scripts/parse-content.ts ----------------------------------------------
cat > scripts/parse-content.ts <<'TS'
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
TS

# --- scripts/build-rag-index.ts --------------------------------------------
cat > scripts/build-rag-index.ts <<'TS'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { profile } from '../src/data/profile.ts';
import { buildChunks } from '../src/rag/chunker.ts';
import { embed } from '../src/rag/openai.ts';
import type { RagIndex, IndexedChunk } from '../src/rag/types.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

function loadEnv(): void {
  try {
    const raw = readFileSync(resolve(ROOT, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (!m) continue;
      const [, key, value] = m;
      if (!process.env[key!]) process.env[key!] = value!.replace(/^["']|["']$/g, '');
    }
  } catch { /* optional */ }
}

async function main(): Promise<void> {
  loadEnv();
  const chunks = buildChunks(profile);
  console.log(`[rag:build] Built ${chunks.length} chunks`);
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';
  const vectors = await embed(chunks.map((c) => c.text), model);
  if (vectors.length !== chunks.length) throw new Error('embedding count mismatch');
  const indexed: IndexedChunk[] = chunks.map((c, i) => ({ ...c, embedding: vectors[i]! }));
  const index: RagIndex = { model, builtAt: new Date().toISOString(), chunks: indexed };
  const outPath = resolve(ROOT, 'generated/rag-index.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(index, null, 2), 'utf8');
  console.log(`[rag:build] Wrote ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
TS

# --- scripts/rag-test.ts ---------------------------------------------------
cat > scripts/rag-test.ts <<'TS'
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { embed } from '../src/rag/openai.ts';
import { retrieveForQuery } from '../src/rag/retrieve.ts';
import { composeAnswer } from '../src/rag/answer.ts';
import type { RagIndex } from '../src/rag/types.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

function loadEnv(): void {
  try {
    const raw = readFileSync(resolve(ROOT, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (!m) continue;
      const [, key, value] = m;
      if (!process.env[key!]) process.env[key!] = value!.replace(/^["']|["']$/g, '');
    }
  } catch { /* optional */ }
}

async function main(): Promise<void> {
  loadEnv();
  const args = process.argv.slice(2);
  const query = args.join(' ').trim();
  if (!query) { console.error('Usage: pnpm rag:test -- "question"'); process.exit(1); }
  const index = JSON.parse(readFileSync(resolve(ROOT, 'generated/rag-index.json'), 'utf8')) as RagIndex;
  console.log(`\n[rag:test] "${query}"\n`);
  const [emb] = await embed([query], index.model);
  if (!emb) throw new Error('empty embedding');
  const { results, intentRule } = retrieveForQuery(query, emb, index, { topK: 5 });
  console.log(`Retrieved (intent: ${intentRule ?? 'none'}):`);
  for (const r of results) {
    console.log(`  ${r.chunk.id.padEnd(48)} raw=${r.rawScore.toFixed(4)} final=${r.finalScore.toFixed(4)}`);
  }
  const answer = await composeAnswer(query, results, index);
  console.log('\n---');
  console.log(answer.answer);
  console.log('---');
  console.log(`confidence: ${answer.confidence}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
TS

# --- api/chat.ts -----------------------------------------------------------
cat > api/chat.ts <<'TS'
import index from '../generated/rag-index.json';
import { embed } from '../src/rag/openai.ts';
import { retrieveForQuery } from '../src/rag/retrieve.ts';
import { composeAnswer } from '../src/rag/answer.ts';
import type { RagIndex, PortfolioAnswer } from '../src/rag/types.ts';

export const config = { runtime: 'edge' };

const MAX_MESSAGE_LENGTH = 500;
const ragIndex = index as RagIndex;

function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !getAllowedOrigins().includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);

  let body: unknown;
  try { body = await req.json(); }
  catch { return json({ error: 'Malformed request body' }, 400, cors); }

  if (typeof body !== 'object' || body === null ||
      typeof (body as { message?: unknown }).message !== 'string') {
    return json({ error: 'Missing or invalid message field' }, 400, cors);
  }
  const message = (body as { message: string }).message.trim();
  if (message.length === 0) return json({ error: 'Message cannot be empty' }, 400, cors);
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters` }, 400, cors);
  }

  try {
    const [emb] = await embed([message], ragIndex.model);
    if (!emb) throw new Error('empty embedding');
    const { results } = retrieveForQuery(message, emb, ragIndex, { topK: 5 });
    const answer: PortfolioAnswer = await composeAnswer(message, results, ragIndex);
    return json(answer, 200, cors);
  } catch (err) {
    console.error('[api/chat]', err instanceof Error ? err.message : err);
    return json({ error: 'Unable to process your question right now' }, 500, cors);
  }
}
TS

# --- scripts/placeholder (so generated/ exists) ----------------------------
touch generated/.gitkeep

echo "✓ C-shell done"
ls -la scripts scripts/lib api