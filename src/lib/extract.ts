export interface ExtractionResult {
  text: string;
  metadata: {
    pages?: number;
    words: number;
    type: string;
  };
}

export async function extractText(
  buffer: Buffer,
  filename: string
): Promise<ExtractionResult> {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf": {
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const data = await pdfParse(buffer);
      return {
        text: data.text,
        metadata: {
          pages: data.numpages,
          words: data.text.split(/\s+/).filter(Boolean).length,
          type: "pdf",
        },
      };
    }
    case "docx": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value,
        metadata: {
          words: result.value.split(/\s+/).filter(Boolean).length,
          type: "docx",
        },
      };
    }
    case "txt":
    case "md": {
      const text = buffer.toString("utf-8");
      return {
        text,
        metadata: {
          words: text.split(/\s+/).filter(Boolean).length,
          type: ext,
        },
      };
    }
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}
