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
