#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# --- src/effects/particle-heading.ts ---------------------------------------
cat > src/effects/particle-heading.ts <<'TS'
const SPRING_K = 0.07;
const DAMPING = 0.82;
const MOUSE_RADIUS = 65;
const MOUSE_FORCE = 4;
const R2 = MOUSE_RADIUS * MOUSE_RADIUS;
const ASSEMBLE_DURATION = 1400;
const FALLBACK_TEXT = 'VINCENT LIU';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  tx: number; ty: number; sx: number; sy: number;
}

export function initParticleHeading(): void {
  const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement | null;
  const label = document.querySelector('.particle-heading-text') as HTMLElement | null;
  if (!canvas || !label) return;
  const text = label.textContent?.trim() || FALLBACK_TEXT;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawStatic(canvas, text);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const particles: Particle[] = [];
  let assembleStart = 0;
  let lastW = -1, lastH = -1;

  function computeTargets(): Array<{ x: number; y: number }> {
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.floor(W));
    off.height = Math.max(1, Math.floor(H));
    const octx = off.getContext('2d');
    if (!octx) return [];
    const fontSize = Math.min(H * 0.78, W / (text.length * 0.58));
    octx.fillStyle = '#fff';
    octx.font = `900 ${fontSize}px Kanit, sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(text, off.width / 2, off.height / 2);
    const data = octx.getImageData(0, 0, off.width, off.height).data;
    const gap = Math.max(2, Math.round(Math.min(W, H) / 60));
    const targets: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < off.height; y += gap) {
      for (let x = 0; x < off.width; x += gap) {
        if (data[(y * off.width + x) * 4 + 3]! > 128) targets.push({ x, y });
      }
    }
    return targets;
  }

  function buildParticles(): void {
    const targets = computeTargets();
    particles.length = 0;
    for (const t of targets) {
      const a = Math.random() * Math.PI * 2;
      const r = 200 + Math.random() * 300;
      particles.push({
        x: 0, y: 0, vx: 0, vy: 0,
        tx: t.x, ty: t.y,
        sx: W / 2 + Math.cos(a) * r,
        sy: H / 2 + Math.sin(a) * r,
      });
    }
    assembleStart = performance.now();
  }

  function retargetParticles(): void {
    const targets = computeTargets();
    const n = Math.min(particles.length, targets.length);
    for (let i = 0; i < n; i++) {
      particles[i]!.tx = targets[i]!.x;
      particles[i]!.ty = targets[i]!.y;
    }
    if (Math.abs(particles.length - targets.length) > 100) {
      particles.length = 0;
      for (const t of targets) {
        particles.push({ x: t.x, y: t.y, vx: 0, vy: 0, tx: t.x, ty: t.y, sx: t.x, sy: t.y });
      }
    }
  }

  function resize(): void {
    const rect = canvas!.getBoundingClientRect();
    const newW = Math.round(rect.width * DPR);
    const newH = Math.round(rect.height * DPR);
    if (newW === lastW && newH === lastH) return;
    lastW = newW; lastH = newH;
    W = canvas!.width = newW;
    H = canvas!.height = newH;
    if (particles.length === 0) buildParticles();
    else retargetParticles();
  }

  const mouse = { x: -9999, y: -9999, active: false };
  function updateMouse(e: PointerEvent): void {
    const rect = canvas!.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (W / rect.width);
    mouse.y = (e.clientY - rect.top) * (H / rect.height);
    mouse.active = true;
  }
  canvas.addEventListener('pointermove', updateMouse);
  canvas.addEventListener('pointerenter', updateMouse);
  canvas.addEventListener('pointerleave', () => {
    mouse.active = false; mouse.x = -9999; mouse.y = -9999;
  });

  resize();
  new ResizeObserver(resize).observe(canvas);

  function tick(now: number): void {
    const progress = Math.min(1, (now - assembleStart) / ASSEMBLE_DURATION);
    const ease = 1 - Math.pow(1 - progress, 3);
    ctx!.clearRect(0, 0, W, H);
    ctx!.fillStyle = '#bbccd7';
    const dot = Math.max(1.4, DPR * 0.9);
    for (const p of particles) {
      p.vx += (p.tx - p.x) * SPRING_K;
      p.vy += (p.ty - p.y) * SPRING_K;
      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 0.0001;
          const s = 1 - d / MOUSE_RADIUS;
          const force = s * s * MOUSE_FORCE;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }
      p.vx *= DAMPING; p.vy *= DAMPING;
      p.x += p.vx; p.y += p.vy;
      const drawX = progress < 1 ? p.sx + (p.x - p.sx) * ease : p.x;
      const drawY = progress < 1 ? p.sy + (p.y - p.sy) * ease : p.y;
      ctx!.fillRect(drawX, drawY, dot, dot);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function drawStatic(canvas: HTMLCanvasElement, text: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.scale(dpr, dpr);
  const fontSize = Math.min(rect.height * 0.78, rect.width / (text.length * 0.58));
  ctx.fillStyle = '#bbccd7';
  ctx.font = `900 ${fontSize}px Kanit, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, rect.width / 2, rect.height / 2);
}
TS

# --- src/effects/ghost-cursor.ts -------------------------------------------
cat > src/effects/ghost-cursor.ts <<'TS'
import * as THREE from 'three';

export function initGhostCursor(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const host = document.getElementById('ghost-cursor');
  if (!host) return;
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const TRAIL_LENGTH = 24;
  const positions = new Float32Array(TRAIL_LENGTH * 3);
  const alphas = new Float32Array(TRAIL_LENGTH);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float alpha;',
      'varying float vAlpha;',
      'void main() {',
      '  vAlpha = alpha;',
      '  gl_Position = vec4(position.xy, 0.0, 1.0);',
      '  gl_PointSize = 14.0 * alpha;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'varying float vAlpha;',
      'void main() {',
      '  vec2 d = gl_PointCoord - vec2(0.5);',
      '  float r = length(d);',
      '  float a = smoothstep(0.5, 0.0, r) * vAlpha;',
      '  gl_FragColor = vec4(0.72, 0.62, 0.95, a * 0.22);',
      '}',
    ].join('\n'),
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  const pointer = { x: 0, y: 0 };
  const history: Array<{ x: number; y: number }> = [];
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });
  function tick(): void {
    history.unshift({ x: pointer.x, y: pointer.y });
    if (history.length > TRAIL_LENGTH) history.pop();
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const p = history[i] ?? history[history.length - 1] ?? { x: 0, y: 0 };
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = 0;
      alphas[i] = Math.max(0, 1 - i / TRAIL_LENGTH);
    }
    geometry.attributes.position!.needsUpdate = true;
    geometry.attributes.alpha!.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
TS

# --- src/chat/highlight.ts -------------------------------------------------
cat > src/chat/highlight.ts <<'TS'
const HIGHLIGHT_CLASS = 'is-highlighted';
const HIGHLIGHT_DURATION_MS = 2000;

export function scrollToProfileId(id: string): boolean {
  const target = document.querySelector<HTMLElement>(`[data-profile-id="${id}"]`);
  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => target.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_DURATION_MS);
  return true;
}
TS

# --- src/chat/client.ts ----------------------------------------------------
cat > src/chat/client.ts <<'TS'
import type { PortfolioAnswer } from '../rag/types.ts';
import { scrollToProfileId } from './highlight.ts';

type ChatState = 'idle' | 'thinking' | 'answered' | 'error';

interface ChatElements {
  form: HTMLFormElement; input: HTMLInputElement;
  speech: HTMLElement; answer: HTMLElement;
  sources: HTMLElement; suggested: HTMLElement;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const CHAT_ENDPOINT = `${API_URL}/api/chat`;

function getElements(): ChatElements | null {
  const form = document.getElementById('chat-form') as HTMLFormElement | null;
  const input = document.getElementById('chat-input') as HTMLInputElement | null;
  const speech = document.getElementById('avatar-speech');
  const answer = document.getElementById('answer-text');
  const sources = document.getElementById('source-list');
  const suggested = document.getElementById('suggested-questions');
  if (!form || !input || !speech || !answer || !sources || !suggested) return null;
  return { form, input, speech, answer, sources, suggested };
}

function setState(el: ChatElements, state: ChatState): void {
  el.speech.dataset.state = state;
  if (state === 'thinking') el.suggested.dataset.state = 'thinking';
  else delete el.suggested.dataset.state;
}

function renderSources(el: ChatElements, answer: PortfolioAnswer): void {
  el.sources.innerHTML = '';
  for (const source of answer.sources) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'source-chip';
    chip.textContent = source.label;
    chip.dataset.sourceId = source.id;
    chip.addEventListener('click', () => {
      const found = scrollToProfileId(source.id);
      if (!found) chip.disabled = true;
    });
    el.sources.appendChild(chip);
  }
}

async function submitQuestion(el: ChatElements, question: string): Promise<void> {
  const trimmed = question.trim();
  if (trimmed.length === 0) return;
  setState(el, 'thinking');
  el.answer.textContent = 'Thinking…';
  el.sources.innerHTML = '';
  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed }),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(typeof detail.error === 'string' ? detail.error : 'Request failed');
    }
    const answer = (await res.json()) as PortfolioAnswer;
    el.answer.textContent = answer.answer;
    renderSources(el, answer);
    setState(el, 'answered');
  } catch (err) {
    el.answer.textContent = err instanceof Error ? err.message : 'Something went wrong.';
    setState(el, 'error');
  }
}

export function initChat(): void {
  const el = getElements();
  if (!el) return;
  el.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = el.input.value;
    if (!q.trim()) return;
    el.input.value = '';
    void submitQuestion(el, q);
  });
  for (const chip of el.suggested.querySelectorAll<HTMLButtonElement>('.question-chip')) {
    chip.addEventListener('click', () => {
      void submitQuestion(el, chip.dataset.question ?? chip.textContent ?? '');
    });
  }
}
TS

# --- src/rag/types.ts ------------------------------------------------------
cat > src/rag/types.ts <<'TS'
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
TS

# --- src/rag/chunker.ts ----------------------------------------------------
cat > src/rag/chunker.ts <<'TS'
import type { Profile } from '../data/schema.ts';
import type { KnowledgeChunk } from './types.ts';

export function buildChunks(profile: Profile): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  chunks.push({
    id: 'summary-profile', type: 'summary', label: 'Professional Summary',
    text: [
      `${profile.identity.name} — ${profile.identity.role}`,
      `Direction: ${profile.identity.direction}`,
      '', profile.positioning,
    ].join('\n'),
  });

  for (const exp of profile.experience) {
    for (const sub of exp.subProjects) {
      chunks.push({
        id: sub.id, type: 'experience',
        label: `${exp.company} — ${sub.name}`,
        text: [
          `${exp.company} — ${exp.role} (${exp.period})`,
          `Platform: ${sub.name}`, '', 'Responsibilities:',
          ...sub.responsibilities.map((r) => `- ${r}`), '',
          `Technology: ${sub.technology.join(', ')}`,
          `Focus areas: ${sub.themes.join(', ')}`,
        ].join('\n'),
      });
    }
  }

  for (const p of profile.academicProjects) {
    chunks.push({
      id: p.id, type: 'project', label: p.name,
      text: [
        `${p.name} — ${p.institution} (${p.year})`, '', p.overview, '',
        'Development:', ...p.development.map((d) => `- ${d}`), '',
        `Technology: ${p.technology.join(', ')}`,
        `Concepts: ${p.concepts.join(', ')}`,
      ].join('\n'),
    });
  }

  for (const a of profile.aiPractices) {
    chunks.push({
      id: a.id, type: 'ai-practice', label: a.name,
      text: [
        a.name, '', a.description,
        a.bullets.length ? '\n' + a.bullets.map((b) => `- ${b}`).join('\n') : '',
        a.tools.length ? `\nTools: ${a.tools.join(', ')}` : '',
        a.usage.length ? '\nUsage:\n' + a.usage.map((u) => `- ${u}`).join('\n') : '',
        a.workflowSteps.length
          ? '\nWorkflow:\n' + a.workflowSteps.map((s) => `  ${s}`).join('\n') : '',
      ].filter(Boolean).join('\n'),
    });
  }

  for (const s of profile.skills) {
    chunks.push({
      id: s.id, type: 'skill', label: s.category,
      text: [`${s.category}:`, ...s.items.map((i) => `- ${i}`)].join('\n'),
    });
  }

  for (const c of profile.capabilities) {
    chunks.push({
      id: c.id, type: 'capability', label: c.name,
      text: [c.name, c.context ?? '', '', 'Flow:',
        ...c.steps.map((s) => `  ${s}`)].filter(Boolean).join('\n'),
    });
  }

  return chunks;
}
TS

# --- src/rag/intent.ts -----------------------------------------------------
cat > src/rag/intent.ts <<'TS'
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
TS

# --- src/rag/retrieve.ts ---------------------------------------------------
cat > src/rag/retrieve.ts <<'TS'
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
TS

# --- src/rag/openai.ts -----------------------------------------------------
cat > src/rag/openai.ts <<'TS'
const OPENAI_BASE = 'https://api.openai.com/v1';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`[openai] Missing required env var: ${name}`);
  return v;
}

interface EmbeddingsResponse { data: Array<{ embedding: number[] }>; }

export async function embed(
  inputs: string[],
  model = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const res = await fetch(`${OPENAI_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requireEnv('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({ model, input: inputs }),
  });
  if (!res.ok) throw new Error(`[openai] Embeddings failed: HTTP ${res.status}`);
  const json = (await res.json()) as EmbeddingsResponse;
  return json.data.map((d) => d.embedding);
}

export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }
interface ChatResponse { choices: Array<{ message: { content: string } }>; }

export async function chat(
  messages: ChatMessage[],
  model = process.env.OPENAI_ANSWER_MODEL ?? 'gpt-5-mini',
): Promise<string> {
  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requireEnv('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`[openai] Chat failed: HTTP ${res.status}`);
  const json = (await res.json()) as ChatResponse;
  const content = json.choices[0]?.message.content;
  if (!content) throw new Error('[openai] Empty completion');
  return content.trim();
}
TS

# --- src/rag/answer.ts -----------------------------------------------------
cat > src/rag/answer.ts <<'TS'
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
TS

echo "✓ B-motion done"
ls -la src/effects src/chat src/rag