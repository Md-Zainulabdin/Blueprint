# Blueprint — FDE Workspace

A **Forward Deployed Engineering** workspace. Describe any manual workflow and get a production-grade AI-agent automation blueprint with system architecture, data flow, and ready-to-deploy agent configurations.

## Architecture

### Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page — hero with "Personalized Forward Deployed Engineering" |
| `/workspace` | FDE workspace — input workflow → 3-stage pipeline → step-based results |

### API Routes
| Route | Description |
|-------|-------------|
| `POST /api/blueprint` | Runs the full 3-stage cognitive pipeline on a workflow description |
| `POST /api/generate` | Generic Groq generation endpoint (prompt + optional system instruction) |

### 3-Stage Pipeline (`/api/blueprint`)

1. **Research Extraction** — LLM extracts 1-2 targeted web search queries from the user's workflow description
2. **Context Enrichment** — Web search (Tavily) fetches live documentation/API context
3. **Cognitive FDE Analysis** — Final LLM pass produces a structured `BlueprintResponse` with executive summary, system architecture, data flow, and agent configurations

### Project Structure

```
src/
├── app/
│   ├── (root)/                     # Route group: landing page + error/loading boundaries
│   │   ├── page.tsx                # Landing page
│   │   ├── error.tsx               # Client error boundary
│   │   └── loading.tsx             # Loading state
│   ├── api/
│   │   ├── blueprint/route.ts      # 3-stage FDE pipeline
│   │   └── generate/route.ts       # Generic Gemini proxy
│   ├── workspace/page.tsx          # FDE workspace (state machine: input → generating → done)
│   ├── layout.tsx                  # Root layout (Geist fonts, next-themes, header/footer)
│   ├── not-found.tsx               # 404 page
│   └── globals.css                 # Tailwind v4 + shadcn theme + heading utilities
├── components/
│   ├── blueprint/
│   │   ├── workflow-input.tsx      # Text input form with textarea + submit
│   │   ├── pipeline-stages.tsx     # 3-stage progress indicator
│   │   ├── blueprint-result.tsx    # Step-based result orchestrator (Summary → Architecture → Agents)
│   │   ├── step-bar.tsx            # Horizontal connected-circle step indicator
│   │   ├── executive-summary.tsx   # Problem, Solution, Impact, Stakeholders
│   │   ├── system-architecture.tsx # Components grid + data flow list
│   │   └── agent-card.tsx          # Expandable card with system prompt, tools, I/O
│   ├── layout/
│   │   ├── header.tsx              # Nav bar + theme toggle
│   │   └── footer.tsx              # Copyright
│   ├── shared/
│   │   ├── theme-toggle.tsx        # Dark/light mode toggle (next-themes)
│   │   └── client-only.tsx         # SSR-safe wrapper for Radix portal
│   └── ui/                         # Shadcn UI components (button, input, textarea, badge, etc.)
└── lib/
    ├── groq.ts                     # Groq API client with fallback models and timeout
    ├── search.ts                   # Tavily API client (with timeout, dedup, batch)
    ├── blueprint/
    │   ├── types.ts                # All FDE output TypeScript interfaces
    │   └── pipeline.ts             # 3-stage pipeline orchestration
    └── utils.ts                    # cn() helper
```

### UI / Styling

- **Framework**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **Theme**: Dark-first via `next-themes` with manual toggle
- **Font**: Geist (sans, mono) via `next/font/google`
- **Utilities**:
  - `heading-xl` — `text-2xl font-bold tracking-tight`
  - `heading-lg` — `text-xl font-bold tracking-tight`
  - `heading-md` — `text-base font-semibold`
  - `heading-label` — `text-sm font-semibold uppercase tracking-wider text-muted-foreground`

## Getting Started

### Prerequisites
- Node.js 20+
- A [Groq API key](https://console.groq.com) (required — free tier available)
- A [Tavily API key](https://tavily.com) (recommended for rich context results)

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your GROQ_API_KEY and optionally TAVILY_API_KEY

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Build

```bash
npm run build
npm start
```

## Error Handling

All components defensively handle `null`/`undefined` arrays with optional chaining (`?.map(...)`).
API routes validate input shapes and return typed error responses with appropriate HTTP status codes.
Groq requests auto-abort after 30 seconds; Tavily requests after 10 seconds.
