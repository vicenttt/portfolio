import type { Profile, Experience } from '../data/schema.ts';
import type { KnowledgeChunk } from './types.ts';

/**
 * P97 topic chunks — derived from the existing P97 responsibilities.
 * See AI.md §6. These chunks are more focused than the platform-level
 * chunks, so questions like "How did you use Playwright?" land directly.
 */
const P97_TOPICS: Array<{ id: string; label: string; keywords: RegExp }> = [
  {
    id: 'p97-playwright',
    label: 'P97 — Playwright & Test Automation',
    keywords:
      /playwright|page object|business component|shared utilit|automation|end-to-end|e2e|cucumber|gherkin|bdd|test scenario|test step|refactor/i,
  },
  {
    id: 'p97-api',
    label: 'P97 — API & Integration Testing',
    keywords:
      /\bapi\b|postman|swagger|mockoon|\brest\b|\bjson\b|authentication|\bhttp\b|integration|downstream|connected system/i,
  },
  {
    id: 'p97-sql',
    label: 'P97 — SQL & Data Validation',
    keywords:
      /\bsql\b|database|backend data|data flow|data validation|data inconsist|consistency/i,
  },
  {
    id: 'p97-cicd',
    label: 'P97 — CI/CD & Engineering Workflow',
    keywords:
      /azure devops|ci\/cd|pipeline|pull request|pr validation|scheduled test|release verif|deployment/i,
  },
  {
    id: 'p97-ai',
    label: 'P97 — AI-Assisted Engineering & AI Feature Testing',
    keywords:
      /claude|copilot|\bai\b|ai-?assisted|ai-?powered|\bllm\b|invoice|chatbot|ai-generated|ai feature/i,
  },
];

function flattenResponsibilities(exp: Experience): string[] {
  return exp.subProjects.flatMap((sub) => sub.responsibilities);
}

function collectAll(items: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of items) {
    for (const item of group) {
      if (!seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    }
  }
  return out;
}

function buildP97TopicChunks(profile: Profile): KnowledgeChunk[] {
  const p97 = profile.experience.find((e) => /p97/i.test(e.company));
  if (!p97) return [];

  const allResponsibilities = flattenResponsibilities(p97);
  const allTechnology = collectAll(p97.subProjects.map((s) => s.technology));
  const allThemes = collectAll(p97.subProjects.map((s) => s.themes));

  const chunks: KnowledgeChunk[] = [];

  for (const topic of P97_TOPICS) {
    const matched = allResponsibilities.filter((r) => topic.keywords.test(r));
    if (matched.length === 0) continue;

    chunks.push({
      id: topic.id,
      type: 'experience',
      label: topic.label,
      text: [
        `${p97.company} — ${p97.role} (${p97.period})`,
        `Topic: ${topic.label.replace(/^P97 — /, '')}`,
        '',
        'Relevant responsibilities:',
        ...matched.map((r) => `- ${r}`),
        '',
        `Technology (P97 overall): ${allTechnology.join(', ')}`,
        `Focus areas (P97 overall): ${allThemes.join(', ')}`,
      ].join('\n'),
    });
  }

  return chunks;
}

export function buildChunks(profile: Profile): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  // --- summary -------------------------------------------------------------
  chunks.push({
    id: 'summary-profile',
    type: 'summary',
    label: 'Professional Summary',
    text: [
      `${profile.identity.name} — ${profile.identity.role}`,
      `Direction: ${profile.identity.direction}`,
      '',
      profile.positioning,
    ].join('\n'),
  });

  // --- experience (platform-level) -----------------------------------------
  for (const exp of profile.experience) {
    for (const sub of exp.subProjects) {
      chunks.push({
        id: sub.id,
        type: 'experience',
        label: `${exp.company} — ${sub.name}`,
        text: [
          `${exp.company} — ${exp.role} (${exp.period})`,
          `Platform: ${sub.name}`,
          '',
          'Responsibilities:',
          ...sub.responsibilities.map((r) => `- ${r}`),
          '',
          `Technology: ${sub.technology.join(', ')}`,
          `Focus areas: ${sub.themes.join(', ')}`,
        ].join('\n'),
      });
    }
  }

  // --- P97 topic chunks (derived) ------------------------------------------
  const topicChunks = buildP97TopicChunks(profile);
  chunks.push(...topicChunks);

  // --- academic projects ---------------------------------------------------
  for (const p of profile.academicProjects) {
    chunks.push({
      id: p.id,
      type: 'project',
      label: p.name,
      text: [
        `${p.name} — ${p.institution} (${p.year})`,
        '',
        p.overview,
        '',
        'Development:',
        ...p.development.map((d) => `- ${d}`),
        '',
        `Technology: ${p.technology.join(', ')}`,
        `Concepts: ${p.concepts.join(', ')}`,
      ].join('\n'),
    });
  }

  // --- AI practices --------------------------------------------------------
  for (const a of profile.aiPractices) {
    chunks.push({
      id: a.id,
      type: 'ai-practice',
      label: a.name,
      text: [
        a.name,
        '',
        a.description,
        a.bullets.length ? '\n' + a.bullets.map((b) => `- ${b}`).join('\n') : '',
        a.tools.length ? `\nTools: ${a.tools.join(', ')}` : '',
        a.usage.length ? '\nUsage:\n' + a.usage.map((u) => `- ${u}`).join('\n') : '',
        a.workflowSteps.length
          ? '\nWorkflow:\n' + a.workflowSteps.map((s) => `  ${s}`).join('\n')
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  // --- skills --------------------------------------------------------------
  for (const s of profile.skills) {
    chunks.push({
      id: s.id,
      type: 'skill',
      label: s.category,
      text: [`${s.category}:`, ...s.items.map((i) => `- ${i}`)].join('\n'),
    });
  }

  // --- capabilities --------------------------------------------------------
  for (const c of profile.capabilities) {
    chunks.push({
      id: c.id,
      type: 'capability',
      label: c.name,
      text: [
        c.name,
        c.context ?? '',
        '',
        'Flow:',
        ...c.steps.map((s) => `  ${s}`),
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  // --- guards --------------------------------------------------------------
  // Base is 20 chunks; P97 topics add 0–5 more.
  if (chunks.length < 20) {
    throw new Error(
      `[chunker] Expected at least 20 chunks, got ${chunks.length}. ` +
        `This means profile.ts no longer matches the chunking plan.`,
    );
  }

  const seen = new Set<string>();
  for (const c of chunks) {
    if (seen.has(c.id)) throw new Error(`[chunker] Duplicate chunk id: ${c.id}`);
    seen.add(c.id);
  }

  return chunks;
}