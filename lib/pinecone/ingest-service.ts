import { getPineconeIndex, PINECONE_CONFIG, isPineconeConfigured } from "./config";
import { generateEmbedding } from "./rag-service";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

export interface IngestChunk {
  text: string;
  metadata: {
    title: string;
    source?: string;
    author?: string;
    page?: number;
    source_type: "text" | "pdf" | "url";
    source_url?: string;
    filename?: string;
  };
}

/**
 * Split text into overlapping chunks for embedding
 */
export function chunkText(
  text: string,
  maxChunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const chunks: string[] = [];
  const step = Math.max(1, Math.floor(maxChunkSize * 0.75) - overlap);

  for (let i = 0; i < words.length; i += step) {
    const chunk = words.slice(i, i + Math.floor(maxChunkSize * 0.75)).join(" ");
    if (chunk.length > 50) chunks.push(chunk);
  }
  return chunks.length ? chunks : [text];
}

/**
 * Upsert chunks to Pinecone with embeddings
 */
export async function upsertChunksToPinecone(
  chunks: IngestChunk[],
  docId: string
): Promise<{ upserted: number; errors: string[] }> {
  const errors: string[] = [];
  if (!isPineconeConfigured()) {
    throw new Error("Pinecone is not configured. Set PINECONE_API_KEY.");
  }

  const index = getPineconeIndex();
  const batchSize = 50;
  let upserted = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const vectors = await Promise.all(
      batch.map(async (chunk, idx) => {
        const globalIdx = i + idx;
        const id = `${docId}-chunk-${globalIdx}`;
        try {
          const values = await generateEmbedding(chunk.text);
          return {
            id,
            values,
            metadata: {
              text: chunk.text,
              title: chunk.metadata.title,
              source_title: chunk.metadata.title,
              source: chunk.metadata.source ?? chunk.metadata.title,
              author: chunk.metadata.author ?? "Unknown",
              ...(chunk.metadata.page != null && { page: chunk.metadata.page }),
              source_type: chunk.metadata.source_type,
              ...(chunk.metadata.source_url && { source_url: chunk.metadata.source_url }),
              ...(chunk.metadata.filename && { filename: chunk.metadata.filename }),
              chunkIndex: globalIdx,
              totalChunks: chunks.length,
            },
          };
        } catch (err) {
          errors.push(`Chunk ${globalIdx}: ${err instanceof Error ? err.message : String(err)}`);
          return null;
        }
      })
    );

    const valid = vectors.filter((v): v is NonNullable<typeof v> => v !== null);
    if (valid.length > 0) {
      await index.upsert(valid);
      upserted += valid.length;
    }
  }

  return { upserted, errors };
}

/**
 * Ingest plain text into the chatbot database
 */
export async function ingestText(
  content: string,
  options: { title?: string; source?: string; author?: string } = {}
): Promise<{ upserted: number; chunks: number; errors: string[] }> {
  const title = options.title || "Untitled text";
  const chunks = chunkText(content).map((text) => ({
    text,
    metadata: {
      title,
      source: options.source ?? title,
      author: options.author ?? "Unknown",
      source_type: "text" as const,
    },
  }));
  const docId = `text-${Date.now()}-${title.replace(/\W/g, "-").slice(0, 30)}`;
  const { upserted, errors } = await upsertChunksToPinecone(chunks, docId);
  return { upserted, chunks: chunks.length, errors };
}

/**
 * Ingest PDF buffer into the chatbot database (Node only)
 * Supports pdf-parse v2 (PDFParse class) and v1 (default function).
 */
export async function ingestPDF(
  buffer: Buffer,
  options: { filename?: string; title?: string; author?: string } = {}
): Promise<{ upserted: number; chunks: number; pages: number; errors: string[] }> {
  // NOTE: pdf-parse@1.1.1's package entrypoint runs a debug self-test when `module.parent`
  // is unavailable (which can happen in webpack bundles). Import the actual parser directly.
  const mod = (await import("pdf-parse/lib/pdf-parse.js")) as unknown;
  let fullText: string;
  let pages = 1;

  const pdfParse =
    (mod as { default?: (buf: Buffer) => Promise<{ text: string; numpages?: number }> })
      .default ??
    (mod as unknown as (buf: Buffer) => Promise<{ text: string; numpages?: number }>);

  const data = await pdfParse(buffer);
  fullText = data.text ?? "";
  pages = data.numpages ?? 1;

  const title = options.title || options.filename || "Untitled PDF";

  const chunks = chunkText(fullText).map((text) => ({
    text,
    metadata: {
      title,
      source: title,
      author: options.author ?? "Unknown",
      page: undefined,
      source_type: "pdf" as const,
      filename: options.filename,
    },
  }));

  const docId = `pdf-${Date.now()}-${(options.filename || title).replace(/\W/g, "-").slice(0, 30)}`;
  const { upserted, errors } = await upsertChunksToPinecone(chunks, docId);
  return { upserted, chunks: chunks.length, pages, errors };
}

/**
 * Fetch URL and extract main text, then ingest
 */
export async function ingestURL(
  url: string,
  options: { title?: string } = {}
): Promise<{ upserted: number; chunks: number; errors: string[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(url, {
    signal: controller.signal,
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });
  clearTimeout(timeout);
  if (!res.ok)
    throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
  const html = await res.text();
  const finalUrl = res.url || url;

  const cheerio = await import("cheerio");
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, svg").remove();
  const $main =
    $("article, main, [role='main'], .content, .post-content, .article-body, #content").first();
  const mainText = $main.length ? $main.text() : "";
  const $body = $("body");
  const bodyText = $body.length ? $body.text() : $.text();
  const raw = (mainText || bodyText).replace(/\s+/g, " ").trim();
  const text = raw.slice(0, 500000);
  if (!text || text.length < 100)
    throw new Error(
      "Page had too little text to ingest (need at least 100 characters). Try a different URL or add content manually."
    );

  const title =
    options.title?.trim() ||
    $("title").text()?.trim() ||
    finalUrl;
  const chunks = chunkText(text).map((t) => ({
    text: t,
    metadata: {
      title,
      source: title,
      author: "Unknown",
      source_type: "url" as const,
      source_url: url,
    },
  }));

  const docId = `url-${Date.now()}-${finalUrl.replace(/\W/g, "-").slice(0, 40)}`;
  const { upserted, errors } = await upsertChunksToPinecone(chunks, docId);
  return { upserted, chunks: chunks.length, errors };
}
