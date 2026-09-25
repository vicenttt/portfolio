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
