interface PDFParseResult {
  text: string;
  numpages: number;
  numrender: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
  version: string;
}

interface PDFParseFunction {
  (data: Buffer, options?: object): Promise<PDFParseResult>;
}

declare module "pdf-parse" {
  const pdfParse: PDFParseFunction;
  export default pdfParse;
}

declare module "pdf-parse/lib/pdf-parse.js" {
  const pdfParse: PDFParseFunction;
  export default pdfParse;
}
