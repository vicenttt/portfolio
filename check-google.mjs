import { readFileSync } from 'node:fs';

// Load .env manually
const env = {};
try {
  const raw = readFileSync('.env', 'utf8');
  for (const line of raw.split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) {
  console.error('Cannot read .env:', e.message);
  process.exit(1);
}

const key = env.GOOGLE_API_KEY;
const model = env.GOOGLE_EMBEDDING_MODEL || 'gemini-embedding-001';

console.log('Key length:', key ? key.length : 0);
console.log('Key prefix:', key ? key.slice(0, 8) + '...' : '(missing)');
console.log('Model:', model);
console.log('---');

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`;
const body = {
  model: `models/${model}`,
  content: { parts: [{ text: 'hello world' }] },
};

console.log('POST', url.replace(key, 'KEY'));
console.log('Body:', JSON.stringify(body));
console.log('---');

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

console.log('Status:', res.status);
const text = await res.text();
console.log('Response:');
console.log(text);
