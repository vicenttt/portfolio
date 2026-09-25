import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

console.log('Key prefix:', (env.GOOGLE_API_KEY ?? '').slice(0, 12));
console.log('---');

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GOOGLE_API_KEY}`,
);
const json = await res.json();

if (json.error) {
  console.error('ERROR:', JSON.stringify(json.error, null, 2));
  process.exit(1);
}

console.log('Models supporting generateContent:\n');
for (const m of json.models ?? []) {
  const methods = m.supportedGenerationMethods ?? [];
  if (methods.includes('generateContent')) {
    console.log('  ' + m.name.replace('models/', ''));
  }
}
