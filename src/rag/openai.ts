/**
 * LLM provider abstraction.
 *
 * Primary: Google Gemini (free tier).
 *   - Embeddings: text-embedding-004 (768 dims)
 *   - Chat:       gemini-2.0-flash
 *
 * Fallback: OpenAI (if only OPENAI_API_KEY is set).
 *
 * The rest of the codebase imports `embed` and `chat` from this module
 * and does not care which provider is active.
 */

const GOOGLE_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const OPENAI_BASE = 'https://api.openai.com/v1';

function googleKey(): string | null {
  return process.env.GOOGLE_API_KEY ?? null;
}

function openaiKey(): string | null {
  return process.env.OPENAI_API_KEY ?? null;
}

export function getEmbeddingModelName(): string {
  if (googleKey()) {
    return `google:${process.env.GOOGLE_EMBEDDING_MODEL ?? 'text-embedding-004'}`;
  }
  return `openai:${process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small'}`;
}

// ---------------------------------------------------------------------------
// Google embeddings
// ---------------------------------------------------------------------------

interface GoogleBatchEmbedResponse {
  embeddings: Array<{ values: number[] }>;
}

async function googleEmbed(inputs: string[]): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const key = googleKey();
  if (!key) throw new Error('[llm] GOOGLE_API_KEY not set');
  const model = process.env.GOOGLE_EMBEDDING_MODEL ?? 'text-embedding-004';

  const res = await fetch(
    `${GOOGLE_BASE}/models/${model}:batchEmbedContents?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: inputs.map((text) => ({
          model: `models/${model}`,
          content: { parts: [{ text }] },
        })),
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`[llm] Google embeddings failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as GoogleBatchEmbedResponse;
  return json.embeddings.map((e) => e.values);
}

// ---------------------------------------------------------------------------
// OpenAI embeddings (fallback)
// ---------------------------------------------------------------------------

interface OpenAIEmbedResponse {
  data: Array<{ embedding: number[] }>;
}

async function openaiEmbed(inputs: string[]): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const key = openaiKey();
  if (!key) throw new Error('[llm] OPENAI_API_KEY not set');
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';

  const res = await fetch(`${OPENAI_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, input: inputs }),
  });

  if (!res.ok) {
    throw new Error(`[llm] OpenAI embeddings failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as OpenAIEmbedResponse;
  return json.data.map((d) => d.embedding);
}

// ---------------------------------------------------------------------------
// Public: embed
// ---------------------------------------------------------------------------

export async function embed(inputs: string[]): Promise<number[][]> {
  if (googleKey()) return googleEmbed(inputs);
  if (openaiKey()) return openaiEmbed(inputs);
  throw new Error(
    '[llm] No API key configured. Set GOOGLE_API_KEY or OPENAI_API_KEY in .env',
  );
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GoogleChatResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

async function googleChat(messages: ChatMessage[]): Promise<string> {
  const key = googleKey();
  if (!key) throw new Error('[llm] GOOGLE_API_KEY not set');
  const model = process.env.GOOGLE_ANSWER_MODEL ?? 'gemini-2.0-flash';

  const systemMessage = messages.find((m) => m.role === 'system');
  const conversation = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents: conversation,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  };

  if (systemMessage) {
    body.systemInstruction = { parts: [{ text: systemMessage.content }] };
  }

  const res = await fetch(
    `${GOOGLE_BASE}/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw new Error(`[llm] Google chat failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as GoogleChatResponse;
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('[llm] Empty completion');
  return text.trim();
}

interface OpenAIChatResponse {
  choices: Array<{ message: { content: string } }>;
}

async function openaiChat(messages: ChatMessage[]): Promise<string> {
  const key = openaiKey();
  if (!key) throw new Error('[llm] OPENAI_API_KEY not set');
  const model = process.env.OPENAI_ANSWER_MODEL ?? 'gpt-5-mini';

const res = await fetch(
  `${GOOGLE_BASE}/models/${model}:embedContent?key=${key}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text: inputs.join('\n---\n') }] },
    }),
  },
);

 if (!res.ok) {
    const body = await res.text();
    throw new Error(`[llm] Google chat failed: HTTP ${res.status} — ${body}`);
  }

  const json = (await res.json()) as OpenAIChatResponse;
  const content = json.choices[0]?.message.content;
  if (!content) throw new Error('[llm] Empty completion');
  return content.trim();
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  if (googleKey()) return googleChat(messages);
  if (openaiKey()) return openaiChat(messages);
  throw new Error(
    '[llm] No API key configured. Set GOOGLE_API_KEY or OPENAI_API_KEY in .env',
  );
}