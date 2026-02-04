declare module "pdf-parse/lib/pdf-parse.js" {
  export interface PdfParseResult {
    text: string;
    numpages?: number;
    numrender?: number;
    info?: unknown;
    metadata?: unknown;
    version?: string;
  }

  export default function pdfParse(
    dataBuffer: Buffer,
    // pdf-parse options are not strongly typed in v1
    options?: unknown
  ): Promise<PdfParseResult>;
}

