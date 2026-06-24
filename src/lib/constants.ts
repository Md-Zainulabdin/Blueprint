export const API = {
  GROQ_URL: "https://api.groq.com/openai/v1/chat/completions",
  TAVILY_URL: "https://api.tavily.com/search",
} as const;

export const TIMEOUT = {
  GROQ_MS: 30_000,
  TAVILY_MS: 10_000,
} as const;

export const MODELS = {
  FREE: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3-32b"] as const,
  STAGE3: "llama-3.3-70b-versatile",
} as const;

export const LIMITS = {
  MAX_BODY_SIZE: 100_000,
  MAX_WORKFLOW_CHARS: 10_000,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_SEARCH_SNIPPET: 2000,
} as const;

export const FILES = {
  ALLOWED_MIME: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ] as string[],
  ALLOWED_EXTENSIONS: [".pdf", ".docx", ".txt", ".md"] as string[],
  ALLOWED_LABELS: "PDF, DOCX, TXT",
} as const;
