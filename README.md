# Blueprint — Architect Workspace

**Blueprint** is an open-source internal tool that turns plain-language workflow descriptions into production-ready AI-agent automation architectures. Describe any manual process — sales reconciliation, customer onboarding, incident response — and Blueprint returns a structured blueprint containing system architecture, data flow, agent configurations, and a critique of your approach.

Built for operations teams, automation engineers, and technical leaders who want to move from "we should automate this" to a deployable architecture in minutes, not weeks.

## Features

- **Three-Stage AI Pipeline** — Research Extraction (LLM generates targeted search queries), Context Enrichment (Tavily fetches live documentation and trends), Cognitive Analysis (final LLM pass produces a complete blueprint with critique, architecture, and agent definitions)
- **Critique & Validation** — Every blueprint includes a feasibility assessment, relevant industry trends surfaced from web search, and actionable recommendations
- **Document Upload** — Upload PDF, DOCX, TXT, or Markdown files (up to 10MB) as an alternative to typing your workflow
- **Export** — Download your blueprint as JSON, a formatted Markdown report, or a standalone Mermaid architecture diagram
- **Local Save** — Save up to 3 blueprints in the browser (localStorage) for quick reference
- **AI Resilience** — Automatic retry with fallback models on transient errors; configurable timeouts per request
- **Error Boundary** — Client-side error boundary catches React crashes and shows a recovery UI instead of a white screen
- **Dark-First Theme** — Dark-mode default with Geist sans/mono typography via next-themes

## How It Works

### Pipeline (`POST /api/blueprint`)

| Stage | What it does |
|-------|-------------|
| **1. Research Extraction** | The LLM analyzes your workflow description and formulates 1–2 precise search queries targeting relevant documentation, API references, and technical constraints |
| **2. Context Enrichment** | Tavily searches the web using those queries. Results are deduplicated, scored, and fed to the next stage |
| **3. Cognitive Analysis** | A final LLM pass (using `llama-3.3-70b-versatile`) produces the complete blueprint, including a critique section that validates the approach, identifies industry trends, and recommends improvements |

The LLM automatically falls back through alternative models (`llama-3.1-8b-instant`, `qwen/qwen3-32b`) if the primary model returns 429 or 5xx errors. Each model request has a 30-second timeout.

### What You Get

Every blueprint is a structured JSON object containing:

| Section | Content |
|---------|---------|
| **critique** | Feasibility assessment, relevant industry trends from web search, actionable recommendations |
| **executiveSummary** | Title, problem statement, solution overview, expected impact, key stakeholders |
| **architecture** | Narrative description, component list (name, role, technology), data flow (from → to → action → data type) |
| **agents** | 3–6 autonomous agents with ID, name, role, model, structured system prompt (Persona/Task/Context/Output), tools, inputs, outputs, triggers |

### Document Upload (`POST /api/extract`)

Accepted formats: PDF, DOCX, TXT, MD (max 10MB). Selecting a file clears the textarea and vice versa. The extracted text is fed directly into the pipeline.

### Standalone Generation (`POST /api/generate`)

A lower-level endpoint that calls the LLM directly with a prompt and optional system instruction. Used internally and available for custom integrations.

### Export Formats

From the blueprint result view (Step 4), you can download:

| Format | Extension | Content |
|--------|-----------|---------|
| JSON | `.json` | Full `BlueprintResponse` as pretty-printed JSON |
| Markdown | `.md` | Formatted report with critique, executive summary, architecture, components, data flow, and all agent configurations with full system prompts |
| Mermaid | `.mmd` | Standalone flowchart diagram generated from the architecture's components and data flows |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/workspace` | Main workspace — describe a workflow and generate a blueprint |
| `/workspace/saved` | Browse, view, and delete saved blueprints (max 3) |

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Framework** | Next.js 16 App Router (Turbopack) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| **Fonts** | Geist Sans / Geist Mono (via next/font) |
| **Theme** | Dark-first, toggleable via next-themes |
| **AI Inference** | Groq API (Llama 3.1 8B, Llama 3.3 70B, Qwen 32B) |
| **Web Search** | Tavily API |
| **Testing** | Vitest + jsdom + Testing Library (80 tests across 9 test suites) |

## Project Structure

```
src/
├── app/
│   ├── (root)/          # Landing page
│   ├── api/
│   │   ├── blueprint/   # Full pipeline endpoint
│   │   ├── extract/     # Document upload & text extraction
│   │   └── generate/    # Standalone LLM generation
│   └── workspace/       # Main workspace + saved blueprints
├── components/
│   ├── blueprint/       # Pipeline stages, file upload, results, step bar
│   ├── layout/          # Header + footer
│   ├── shared/          # Error boundary, theme toggle
│   └── ui/              # shadcn/ui primitives
├── hooks/               # useMounted
├── lib/
│   ├── blueprint/       # Pipeline logic, validation, save/load, export, types
│   └── constants.ts, errors.ts, extract.ts, groq.ts, search.ts, utils.ts
└── types/               # Ambient type declarations
tests/                   # 80 unit tests (Vitest)
```

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add your API keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/workspace` to generate your first blueprint.

### API Keys

| Key | Required | Description |
|-----|----------|-------------|
| `GROQ_API_KEY` | Yes | LLM inference via Groq (free tier available at [console.groq.com](https://console.groq.com)) |
| `TAVILY_API_KEY` | Recommended | Web search for context enrichment (free tier at [tavily.com](https://tavily.com)) |

If `TAVILY_API_KEY` is missing, Stage 2 is skipped and the pipeline runs on the LLM's pre-training knowledge alone.

## Testing

```bash
npm install          # installs dev dependencies including Vitest
npx vitest run       # run all tests
npx vitest           # watch mode
```

Tests are located in the root-level `tests/` directory and use `@/` path aliases matching the application's TypeScript configuration.

## Contributing

This project is MIT-licensed and community-driven. Contributions, issues, and feature requests are welcome.

- Report bugs or suggest features via [GitHub Issues](https://github.com/Md-Zainulabdin/Blueprint/issues)
- Fork the repo, make changes, and open a pull request
- Run `npx vitest run` before submitting to ensure tests pass

By contributing, you agree that your contributions will be licensed under the MIT License.

## License

MIT License — see [LICENSE](LICENSE) for details.
