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
