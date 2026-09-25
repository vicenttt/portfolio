import type { ChunkType } from '../data/schema.ts';
export type { ChunkType };

export interface KnowledgeChunk {
  id: string; type: ChunkType; label: string; text: string;
}
export interface IndexedChunk extends KnowledgeChunk { embedding: number[]; }
export interface RagIndex { model: string; builtAt: string; chunks: IndexedChunk[]; }
export interface RetrievedChunk {
  chunk: IndexedChunk; rawScore: number; finalScore: number;
}
export interface AnswerSource { id: string; type: ChunkType; label: string; }
export interface PortfolioAnswer {
  answer: string; sources: AnswerSource[]; relatedIds: string[];
  confidence: 'high' | 'medium' | 'low';
}
