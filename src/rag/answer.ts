import type { PortfolioAnswer, RetrievedChunk, RagIndex } from './types.ts';
import { chat, type ChatMessage } from './openai.ts';
import { toSources, findChunk } from './retrieve.ts';

const SYSTEM_PROMPT = [
  "You are the assistant on Vincent Liu's QA engineering portfolio.",
  '',
  'Rules:',
  '- Answer ONLY using the CONTEXT provided below.',
  '- If the context does not contain the answer, say so plainly and suggest a related topic.',
  '- Never invent facts, metrics, employers, dates, or technologies.',
  '- Never claim Vincent has skills or experience that are not in the context.',
  '- Treat AI-assisted development as a practical engineering tool, not as AI/ML research.',
  '- Keep answers to 2-4 short sentences. Technical, clear, evidence-based.',
  '- Do not use marketing language or superlatives.',
  '',
  'CONTEXT:',
  '{{CONTEXT}}',
].join('\n');

function buildContext(results: RetrievedChunk[]): string {
  return results.map((r) => `[${r.chunk.id}] ${r.chunk.label}\n${r.chunk.text}`).join('\n\n---\n\n');
}

function gradeConfidence(results: RetrievedChunk[]): 'high' | 'medium' | 'low' {
  if (results.length === 0) return 'low';
  const top = results[0]!;
  if (top.rawScore >= 0.55 && results.length >= 2) return 'high';
  if (top.rawScore >= 0.38) return 'medium';
  return 'low';
}

export async function composeAnswer(
  query: string, results: RetrievedChunk[], index: RagIndex,
): Promise<PortfolioAnswer> {
  if (results.length === 0) {
    return {
      answer: "I don't have information about that in Vincent's portfolio. Try asking about his Playwright automation, API testing, or QA experience.",
      sources: [], relatedIds: [], confidence: 'low',
    };
  }
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT.replace('{{CONTEXT}}', buildContext(results)) },
    { role: 'user', content: query },
  ];
  const answer = await chat(messages);
  const sources = toSources(results);
  const relatedIds = sources.map((s) => s.id).filter((id) => findChunk(index, id) !== undefined);
  return { answer, sources, relatedIds, confidence: gradeConfidence(results) };
}
