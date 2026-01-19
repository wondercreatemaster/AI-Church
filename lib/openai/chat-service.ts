import { openai, OPENAI_CONFIG } from "./config";
import { generateSystemPrompt } from "../prompts/orthodox-prompts";
import { Message } from "../db/models/message";
import { ConversationStage } from "../db/models/conversation";
import type { ChatCompletion } from "openai/resources/chat/completions";
import { getContextForQuestion } from "../pinecone/rag-service";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateResponseOptions {
  messages: Message[];
  stage: ConversationStage;
  userBelief?: string;
  stream?: boolean;
  retrievedContext?: string;
}

export interface ChatResponse {
  content: string;
  tokens?: number;
  finishReason?: string;
  sources?: string[];
}

/**
 * Generate a response from OpenAI based on conversation history
 */
export async function generateResponse(
  options: GenerateResponseOptions
): Promise<ChatResponse> {
  const { messages, stage, userBelief, stream = false, retrievedContext } = options;

  try {
    // Get the last user message for RAG retrieval
    const lastUserMessage = messages.length > 0 
      ? messages[messages.length - 1].content 
      : "";

    // Retrieve relevant context from Pinecone (if not already provided)
    let contextToUse = retrievedContext;
    let sources: string[] = [];

    if (!contextToUse && lastUserMessage) {
      try {
        const ragContext = await getContextForQuestion(lastUserMessage, userBelief);
        if (ragContext) {
          contextToUse = ragContext.formattedContext;
          sources = ragContext.sources;
          console.log(`Retrieved ${ragContext.documents.length} relevant sources for query`);
        }
      } catch (error) {
        console.warn("Failed to retrieve RAG context, continuing without it:", error);
      }
    }

    // Generate system prompt based on stage, user belief, and retrieved context
    const systemPrompt = generateSystemPrompt(stage, userBelief, contextToUse);

    // Format messages for OpenAI
    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }))
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: chatMessages,
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: OPENAI_CONFIG.maxTokens,
      top_p: OPENAI_CONFIG.topP,
      frequency_penalty: OPENAI_CONFIG.frequencyPenalty,
      presence_penalty: OPENAI_CONFIG.presencePenalty,
      stream: false,
    }) as ChatCompletion;

    const response = completion.choices[0];
    
    return {
      content: response.message.content || "",
      tokens: completion.usage?.total_tokens,
      finishReason: response.finish_reason || undefined,
      sources: sources.length > 0 ? sources : undefined,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate response from AI");
  }
}

/**
 * Generate a streaming response from OpenAI
 */
export async function* generateStreamingResponse(
  options: GenerateResponseOptions
): AsyncGenerator<string, void, unknown> {
  const { messages, stage, userBelief } = options;

  try {
    // Generate system prompt
    const systemPrompt = generateSystemPrompt(stage, userBelief);

    // Format messages
    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }))
    ];

    // Create streaming completion
    const stream = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: chatMessages,
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: OPENAI_CONFIG.maxTokens,
      stream: true,
    });

    // Yield chunks as they arrive
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("OpenAI Streaming Error:", error);
    throw new Error("Failed to stream response from AI");
  }
}

/**
 * Check if OpenAI API is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your-openai-api-key-here";
}

