import type { RagIndex, IndexedChunk, RetrievedChunk, ChunkType } from './types.ts';
import { detectIntent, applyBoost } from './intent.ts';

export const RAW_THRESHOLD = 0.30;
export const INTENT_THRESHOLD = 0.17;
export const DEFAULT_TOP_K = 5;

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('[retrieve] Vector length mismatch');
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i]!, bv = b[i]!;
    dot += av * bv; na += av * av; nb += bv * bv;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export interface RetrieveOptions { topK?: number; debug?: boolean; }
export interface RetrieveResult { results: RetrievedChunk[]; intentRule: string | null; }

export function retrieveForQuery(
  query: string, queryEmbedding: number[], index: RagIndex,
  options: RetrieveOptions = {},
): RetrieveResult {
  const { topK = DEFAULT_TOP_K } = options;
  const intent = detectIntent(query);
  const scored: RetrievedChunk[] = index.chunks.map((chunk) => {
    const rawScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    const finalScore = applyBoost(rawScore, chunk.type, intent);
    return { chunk, rawScore, finalScore };
  });
  const boostedTypes = intent ? (Object.keys(intent.boosts) as ChunkType[]) : [];
  const passed = scored.filter((s) => {
    if (s.rawScore >= RAW_THRESHOLD) return true;
    if (boostedTypes.includes(s.chunk.type) && s.rawScore >= INTENT_THRESHOLD) return true;
    return false;
  });
  passed.sort((a, b) => b.finalScore - a.finalScore);
  return { results: passed.slice(0, topK), intentRule: intent?.rule ?? null };
}

export function toSources(results: RetrievedChunk[]) {
  return results.map((r) => ({ id: r.chunk.id, type: r.chunk.type, label: r.chunk.label }));
}

export function findChunk(index: RagIndex, id: string): IndexedChunk | undefined {
  return index.chunks.find((c) => c.id === id);
}
