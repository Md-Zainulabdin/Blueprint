# Blueprint — Architect Workspace

An **Architect** workspace. Paste a manual workflow or upload a document and get a production-grade AI-agent automation blueprint with system architecture, data flow, and agent configurations.

## Quick Start

```bash
npm install
cp .env.example .env.local   # add GROQ_API_KEY (and TAVILY_API_KEY)
npm run dev
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/workspace` | Input workflow → 3-stage pipeline → results |
| `/workspace/saved` | Browse and manage saved blueprints (max 3) |

## Pipeline (`POST /api/blueprint`)

1. **Research Extraction** — LLM formulates 1–2 targeted search queries from your workflow description
2. **Context Enrichment** — Tavily fetches live API docs and automation context
3. **Cognitive Analysis** — Final LLM pass produces a structured blueprint

## Document Upload (`POST /api/extract`)

Upload PDF, DOCX, TXT, or MD files (up to 10MB). Selecting a file clears the textarea, and typing clears the file. Extracted text feeds directly into the pipeline.

## Tech Stack

- **Framework**: Next.js 16 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Theme**: Dark-first via `next-themes` (Geist sans/mono)
- **AI**: Groq (LLM) + Tavily (web search)

## Prerequisites

- Node.js 20+
- [Groq API key](https://console.groq.com) (free tier) — required
- [Tavily API key](https://tavily.com) — recommended for richer results
