import OpenAI from "openai";

// Initialize OpenAI client.
// IMPORTANT: Do not throw at import-time (breaks Next build/routes). Validate at call-sites.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

// Model configuration
export const OPENAI_CONFIG = {
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000"),
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
} as const;

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequestsPerMinute: 20,
  maxTokensPerDay: 100000,
} as const;

// Export type for configuration
export type OpenAIConfig = typeof OPENAI_CONFIG;

