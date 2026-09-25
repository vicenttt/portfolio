import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const key = env.GOOGLE_API_KEY;
const model = env.GOOGLE_ANSWER_MODEL || 'gemini-2.5-flash';

console.log('Model:', model);
console.log('URL:', `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=KEY`);
console.log('---');

// Test 1: minimal body, no systemInstruction
console.log('TEST 1: minimal body (no system)');
const body1 = {
  contents: [{ role: 'user', parts: [{ text: 'Say "ok".' }] }],
};
const res1 = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body1),
  },
);
console.log('  Status:', res1.status);
console.log('  Response:', (await res1.text()).slice(0, 800));
console.log('---');

// Test 2: with systemInstruction
console.log('TEST 2: with systemInstruction');
const body2 = {
  contents: [{ role: 'user', parts: [{ text: 'Say "ok".' }] }],
  systemInstruction: { parts: [{ text: 'You are a helpful assistant.' }] },
  generationConfig: { temperature: 0.2 },
};
const res2 = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body2),
  },
);
console.log('  Status:', res2.status);
console.log('  Response:', (await res2.text()).slice(0, 800));
