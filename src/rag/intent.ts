import type { ChunkType } from './types.ts';

interface Rule {
  name: string;
  patterns: RegExp[];
  boosts: Partial<Record<ChunkType, number>>;
}

const RULES: Rule[] = [
  {
    name: 'experience-company',
    patterns: [/\b(company|companies|worked at|work at|role at|position at|employer)\b/i,
      /\bp97\b/i, /\bkevorld\b/i, /\bfleet\b/i, /\bmem\b/i],
    boosts: { experience: 1.18 },
  },
  {
    name: 'tools-stack',
    patterns: [/\b(tools?|stack|technology|technologies|use|using)\b/i,
      /\bplaywright\b/i, /\bsql\b/i, /\bpostman\b/i, /\bswagger\b/i, /\bazure\s+devops\b/i],
    boosts: { skill: 1.15, experience: 1.15 },
  },
  {
    name: 'ai-practice',
    patterns: [/\b(ai|a\.i\.|llm|llms)\b/i, /\b(copilot|claude)\b/i,
      /\bai-?assisted\b/i, /\bai-?powered\b/i],
    boosts: { 'ai-practice': 1.20 },
  },
  {
    name: 'debugging',
    patterns: [/\b(debug|debugging|investigate|investigation|root\s*cause|trace|tracing|diagnos)/i,
      /\b(failure|failures|broken|issue|issues)\b/i],
    boosts: { capability: 1.20 },
  },
  {
    name: 'projects-built',
    patterns: [/\b(built|build|developed|created|made|project|projects)\b/i,
      /\b(taxi|cinema|booking)\b/i],
    boosts: { project: 1.15, experience: 1.15 },
  },
  {
    name: 'education',
    patterns: [/\b(education|degree|university|school|study|studied|academic|aut)\b/i,
      /\b(bachelor|bsc|graduate|graduated)\b/i],
    boosts: { project: 1.18 },
  },
];

export interface IntentMatch {
  rule: string;
  boosts: Partial<Record<ChunkType, number>>;
}

export function detectIntent(query: string): IntentMatch | null {
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(query))) {
      return { rule: rule.name, boosts: rule.boosts };
    }
  }
  return null;
}

export function applyBoost(rawScore: number, type: ChunkType, intent: IntentMatch | null): number {
  if (!intent) return rawScore;
  const m = intent.boosts[type];
  return m ? rawScore * m : rawScore;
}
