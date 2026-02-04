import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Pinecone client.
// IMPORTANT: Do not throw at import-time (breaks Next build/routes). Validate at call-sites.
export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? "",
});

// Pinecone configuration
export const PINECONE_CONFIG = {
  indexName: process.env.PINECONE_INDEX_NAME || "church",
  environment: process.env.PINECONE_ENVIRONMENT || "us-east-1",
  embeddingModel: "text-embedding-3-large",
  embeddingDimensions: 3072,
  topK: 5, // Number of most relevant results to retrieve
} as const;

// Get Pinecone index
export function getPineconeIndex() {
  if (!isPineconeConfigured()) {
    throw new Error('Missing environment variable: "PINECONE_API_KEY"');
  }
  return pinecone.index(PINECONE_CONFIG.indexName);
}

// Check if Pinecone is configured
export function isPineconeConfigured(): boolean {
  return !!process.env.PINECONE_API_KEY && 
         process.env.PINECONE_API_KEY !== "your-pinecone-api-key-here";
}

// Export type for configuration
export type PineconeConfig = typeof PINECONE_CONFIG;

