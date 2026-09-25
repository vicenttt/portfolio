**Demo:**

https://github.com/user-attachments/assets/6b935c21-b49e-412a-be3c-77379a0eefe3

# QA Engineer Portfolio

A personal portfolio site for a QA automation engineer, built as its own system under test.

---

## What this is

A single-page portfolio that presents QA engineering experience — automation, API and integration testing, data validation, and AI-assisted engineering — through an interactive site with a retrieval-augmented chat assistant.

The site is also its own **QA Lab**: a Playwright suite tests the UI, the chat API, and the retrieval quality of the knowledge base. The portfolio does not deploy if its own tests fail.

---

## Architecture

```
                    ┌───────────────┐
                    │  CONTENT.md   │
                    │  (source of   │
                    │   truth)      │
                    └───────┬───────┘
                            │
                            │  pnpm parse:content
                            ▼
                    ┌───────────────┐
                    │  profile.ts   │
                    │  (typed data) │
                    └───────┬───────┘
                            │
                            │  pnpm rag:build
                            ▼
                    ┌───────────────┐
                    │ rag-index.json│
                    │  (25 chunks)  │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      ┌───────────────┐         ┌─────────────────────┐
      │ Portfolio UI  │         │ POST /api/chat      │
      │ (Vite build)  │         │ retrieval + rerank  │
      └───────────────┘         │ + grounded LLM      │
                                └─────────────────────┘
```

**Single source of truth.** All content originates in `content/CONTENT.md`. A parser turns it into `src/data/profile.ts`; a chunker turns that into `generated/rag-index.json`. The UI and the RAG system both read from these derived artifacts.

---

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 5 + TypeScript |
| UI | Plain HTML / CSS / JavaScript |
| Cursor effect | Three.js |
| Chat API | Vercel Serverless Function |
| Retrieval | In-memory cosine similarity + intent reranking |
| Embeddings | Google `gemini-embedding-001` |
| Answer model | Google `gemini-3.6-flash` |
| Static host | GitHub Pages |
| Tests | Vitest (unit) + Playwright (E2E, API, RAG) |
| CI | GitHub Actions |

---

## Features

### Content pipeline

- **`content/CONTENT.md`** — the single source of truth. A markdown file with Vincent's identity, experience, projects, skills, and capability model.
- **Parser** (`scripts/parse-content.ts`) — turns markdown into typed data. Fails loudly if a section cannot be parsed, rather than silently dropping data.
- **Chunker** (`src/rag/chunker.ts`) — produces 25 knowledge chunks, including 5 topic-specific chunks (`p97-playwright`, `p97-api`, `p97-sql`, `p97-cicd`, `p97-ai`) derived from P97 experience.

### RAG system

- Embeddings precomputed at build time for each chunk
- Retrieval via cosine similarity
- Intent-aware reranking (regex-based rules apply 1.15–1.20× boosts for matching chunk types)
- Dual thresholds: raw `0.30`, type-specific `0.17`
- Grounded LLM prompt with strict "no invention" rules
- Every answer returns sources that link back to matching cards on the page

### Portfolio UI

- **Sticky stacking scroll** — each section parks at the top; the next slides up to cover it
- **Particle heading** — `VINCENT LIU` assembled from particles that respond to cursor movement
- **Character follow** — the illustration tilts toward the pointer
- **Skill carousel** — horizontal scroll, focus highlight, edge fades, dot indicator
- **Experience accordion** — company-level accordion, project-level tabs, staggered reveals
- **Capability card stack** — sticky title, cards stack with 12px stagger
- **Project grid** — two-column cards with hover accent bar
- **Contact cards** — icon + label + inline link for email, GitHub, LinkedIn

### QA Lab

- Parser unit tests (Vitest)
- API contract tests (Playwright) — validation, error paths, no-leak assertions, CORS
- End-to-end tests (Playwright) — hero, chat round-trip, source chip → DOM target, reduced motion
- RAG quality tests — index invariants, intent detection, boost math, golden query set
- Full test strategy in `qa-lab/test-design.md`

---

## Local development

```bash
# Install dependencies
pnpm install

# Content pipeline
pnpm parse:content          # CONTENT.md → src/data/profile.ts
pnpm rag:build              # profile.ts → generated/rag-index.json

# Run
pnpm dev                    # site at http://localhost:5173

# Test
pnpm test                   # Vitest (parser, chunker, ranking)
pnpm test:e2e               # Playwright (UI, API, RAG)
pnpm typecheck              # TypeScript check
```

### Environment

Copy `.env.example` to `.env` and fill in:

| Variable | Scope | Purpose |
|---|---|---|
| `GOOGLE_API_KEY` | server | Embeddings + answer generation |
| `GOOGLE_EMBEDDING_MODEL` | server | Defaults to `gemini-embedding-001` |
| `GOOGLE_ANSWER_MODEL` | server | Defaults to `gemini-3.6-flash` |
| `ALLOWED_ORIGINS` | server | Comma-separated CORS allowlist |
| `VITE_API_URL` | client | Deployed API base URL |

The static site never imports server modules and never sees the API key. Secrets are server-only and are never prefixed with `VITE_`.

---

## Deployment

Two parts:

1. **Static site** → GitHub Pages via GitHub Actions
2. **Chat API** → Vercel Serverless Function

### Vercel (API)

```bash
pnpm dlx vercel link
pnpm dlx vercel env add GOOGLE_API_KEY production
pnpm dlx vercel env add ALLOWED_ORIGINS production
pnpm dlx vercel deploy --prod
```

### GitHub Pages (static)

1. Repository → Settings → Pages → Source: **GitHub Actions**
2. Repository → Settings → Secrets and variables → Actions → Variables
   - `VITE_API_URL` = your Vercel deployment URL
3. Push to `main`

---

## Content rules

1. Preserve factual accuracy
2. Never invent metrics, responsibilities, or technologies beyond `CONTENT.md`
3. Never claim AI/ML engineering where the experience is AI-assisted development
4. Keep professional experience and academic projects separate
5. The visual design may be experimental; the professional content must stay factual

See `content/CONTENT.md` §10 for the full list.

---

## Updating content

```bash
# 1. Edit content/CONTENT.md
# 2. Regenerate derived artifacts
pnpm parse:content
pnpm rag:build

# 3. Commit both source and derived
git add content/CONTENT.md src/data/profile.ts generated/rag-index.json
git commit -m "content: update ..."
git push
```

`generated/rag-index.json` **must be committed** — the serverless function reads it at runtime.

---

## Project structure

```
.
├── content/
│   └── CONTENT.md              # source of truth
├── src/
│   ├── data/
│   │   ├── profile.ts          # generated data
│   │   └── schema.ts           # types
│   ├── rag/                    # RAG pipeline (browser-side types)
│   ├── chat/                   # chat widget client
│   ├── sections/               # UI section renderers
│   ├── effects/                # visual effects
│   └── main.ts                 # entry point
├── scripts/
│   ├── parse-content.ts        # markdown → typed data
│   ├── build-rag-index.ts      # data → embeddings
│   └── lib/markdown.ts         # markdown utilities
├── api/
│   ├── chat.ts                 # Vercel function
│   ├── rag/                    # RAG code copy for deployment
│   └── data/
│       └── rag-index.js        # index for deployment
├── generated/
│   └── rag-index.json          # committed embeddings
├── qa-lab/
│   ├── tests/                  # Playwright suite
│   ├── test-design.md          # test strategy
│   └── playwright.config.ts
├── index.html
├── styles.css
└── package.json
```

---

## License

Personal project. Content and design © Vincent Liu.
Code is available for reference.

---
