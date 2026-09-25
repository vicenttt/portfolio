import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { profile } from '../src/data/profile.ts';
import { buildChunks } from '../src/rag/chunker.ts';
import { embed, getEmbeddingModelName } from '../src/rag/openai.ts';
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
  const model = getEmbeddingModelName();
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
