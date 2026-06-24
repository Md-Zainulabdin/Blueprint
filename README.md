# Blueprint — FDE Workspace

A **Forward Deployed Engineering** workspace. Describe any manual workflow and get a production-grade AI-agent automation blueprint with system architecture, data flow, and ready-to-deploy agent configurations.

## Architecture

### Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page — hero with "Personalized Forward Deployed Engineering" |
| `/workspace` | FDE workspace — input workflow → 3-stage pipeline → step-based results |
| `/workspace/saved` | Saved blueprints — view, delete, and revisit past results (max 3) |

### API Routes
| Route | Description |
|-------|-------------|
| `POST /api/blueprint` | Runs the full 3-stage cognitive pipeline on a workflow description |
| `POST /api/generate` | Generic Groq generation endpoint (prompt + optional system instruction) |
| `POST /api/extract` | Extracts text from uploaded documents (PDF, DOCX, TXT, MD) |

### Document Upload

Upload PDF, DOCX, TXT, or MD files (up to 10MB) alongside or instead of a typed workflow description. The form uses an **either/or** pattern — selecting a file clears the textarea, and typing clears the file. Uploaded documents are extracted server-side via `POST /api/extract` (PDF via `pdf-parse`, DOCX via `mammoth`, TXT/MD as raw text), and the extracted text feeds directly into the 3-stage pipeline as input.

### 3-Stage Pipeline (`/api/blueprint`)

1. **Research Extraction** — LLM extracts 1-2 targeted web search queries from the user's workflow description (or extracted document text)
2. **Context Enrichment** — Web search (Tavily) fetches live documentation/API context
3. **Cognitive FDE Analysis** — Final LLM pass produces a structured `BlueprintResponse` with executive summary, system architecture, data flow, and agent configurations

### Saved Blueprints

Generated blueprints can be saved to **localStorage** (max 3) with a single click. Saved blueprints appear on `/workspace/saved` with title, date, and problem-statement preview — click **View** to open in read-only mode, or **Delete** to remove. The header bookmark icon links directly to the saved list.

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
│   │   ├── generate/route.ts       # Generic Groq generation endpoint
│   │   └── extract/route.ts        # File upload text extraction
│   ├── workspace/
│   │   ├── page.tsx                # FDE workspace (state machine: input → generating → done)
│   │   └── saved/page.tsx          # Saved blueprints list (localStorage, max 3)
│   ├── layout.tsx                  # Root layout (Geist fonts, next-themes, header/footer)
│   ├── not-found.tsx               # 404 page
│   └── globals.css                 # Tailwind v4 + shadcn theme + heading utilities
├── components/
│   ├── blueprint/
│   │   ├── workflow-input.tsx      # Either/or form — file clears textarea, typing clears file
│   │   ├── file-upload.tsx         # Drag-and-drop file upload (PDF/DOCX/TXT/MD, 10MB)
│   │   ├── pipeline-stages.tsx     # 3-stage progress indicator
│   │   ├── blueprint-result.tsx    # Step-based result orchestrator (Summary → Architecture → Agents)
│   │   ├── step-bar.tsx            # Horizontal connected-circle step indicator
│   │   ├── executive-summary.tsx   # Problem, Solution, Impact, Stakeholders
│   │   ├── data-flow.tsx           # Data flow step diagram
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
    ├── extract.ts                  # Document text extraction (PDF, DOCX, TXT, MD)
    ├── constants.ts                # Centralized config (API URLs, limits, models, file types)
    ├── errors.ts                   # getErrorMessage() + logError() utilities
    ├── hooks/
    │   └── use-mounted.ts          # useMounted() hydration-safe hook
    └── blueprint/
        ├── types.ts                # All FDE output TypeScript interfaces
        ├── pipeline.ts             # 3-stage pipeline orchestration
        ├── constants.ts            # STAGE_NAMES, createInitialStages()
        └── save.ts                 # localStorage save/load/delete (max 3 blueprints)
```

### UI / Styling

- **Framework**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **Theme**: Dark-first via `next-themes` with manual toggle
- **Font**: Geist (sans, mono) via `next/font/google`

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
File upload validates MIME type, extension, and size against centralized `FILES` constants before processing.
Groq requests auto-abort after 30 seconds; Tavily requests after 10 seconds.
