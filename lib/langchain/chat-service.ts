/**
 * LangChain Chat Service
 * Replaces the OpenAI chat service with aggressive conversion agent
 */

import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { Message } from "../db/models/message";
import { ConversationStage } from "../db/models/conversation";
import { 
  createConversionAgent, 
  executeAgent, 
  updateMemoryAfterTurn, 
  getPromptVariables 
} from "./agent-config";
import { ConversionMemoryState } from "./memory-manager";
import { getContextForQuestion } from "../pinecone/rag-service";

export interface GenerateResponseOptions {
  messages: Message[];
  stage: ConversationStage;
  userBelief?: string;
  memoryState?: Partial<ConversionMemoryState>;
  retrievedContext?: string;
  questionContext?: string; // For agent-led conversation
}

export interface ChatResponse {
  content: string;
  tokens?: number;
  finishReason?: string;
  sources?: string[];
  memoryState?: ConversionMemoryState;
  tactic?: string;
}

/**
 * Generate response using LangChain conversion agent
 */
export async function generateResponse(
  options: GenerateResponseOptions
): Promise<ChatResponse> {
  const { messages, stage, userBelief, memoryState, questionContext } = options;

  try {
    // Get the last user message
    const lastUserMessage = messages.length > 0 
      ? messages[messages.length - 1].content 
      : "";

    if (!lastUserMessage) {
      throw new Error("No user message provided");
    }

    // Retrieve relevant context from Pinecone
    let sources: string[] = [];
    let ragContext = "";
    
    if (lastUserMessage) {
      try {
        const context = await getContextForQuestion(lastUserMessage, userBelief);
        if (context) {
          ragContext = context.formattedContext;
          sources = context.sources;
          console.log(`Retrieved ${context.documents.length} relevant sources for aggressive apologetics`);
        }
      } catch (error) {
        console.warn("Failed to retrieve RAG context:", error);
      }
    }

    // Create conversion agent
    const agent = await createConversionAgent(stage, userBelief, {
      ...memoryState,
      // Initialize with previous messages
      messageHistory: messages.map(msg => 
        msg.role === "user" 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
    });

    // Inject RAG context into the agent's memory if available
    if (ragContext) {
      const contextMessage = new AIMessage(
        `[INTERNAL: Retrieved Orthodox sources to use in your arguments: ${ragContext}]`
      );
      await agent.memory.addMessage(contextMessage);
    }

    // Execute agent with user message
    const response = await executeAgent(
      agent,
      lastUserMessage,
      stage,
      userBelief,
      ragContext,
      questionContext
    );

    // Update memory after turn
    updateMemoryAfterTurn(
      agent.memory,
      lastUserMessage,
      response,
      userBelief
    );

    // Get updated memory state
    const updatedMemoryState = agent.memory.getState();

    return {
      content: response,
      sources: sources.length > 0 ? sources : undefined,
      memoryState: updatedMemoryState,
      tactic: updatedMemoryState.lastTactic,
    };
  } catch (error) {
    console.error("LangChain Agent Error:", error);
    throw new Error("Failed to generate response from conversion agent");
  }
}

/**
 * Check if LangChain/OpenAI is configured
 */
export function isLangChainConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your-openai-api-key-here";
}

/**
 * Initialize conversion agent for new conversation
 */
export async function initializeConversationAgent(
  userBelief: string,
  stage: ConversationStage = "A"
) {
  // Create initial agent
  const agent = await createConversionAgent(stage, userBelief, {
    resistanceLevel: 5, // Start neutral
    opennessScore: 5,
    conversionGoals: [{
      type: "acknowledge_orthodox",
      description: "Get user to acknowledge Orthodox positions have merit",
      achieved: false,
    }],
  });

  return {
    memoryState: agent.memory.getState(),
    agentCreated: true,
  };
}

/**
 * Get welcome message with aggressive conversion intent
 */
export function getAggressiveWelcomeMessage(userName?: string, userBelief?: string): string {
  const greeting = userName ? `${userName}` : "friend";
  
  const beliefSpecific: Record<string, string> = {
    catholic: "You come from Rome. But Rome departed from the Orthodox faith in 1054 when it unilaterally changed the Creed and asserted papal supremacy. I'm here to show you the faith Rome abandoned - the unchanged, apostolic Christianity of the East.",
    
    protestant: "You come from the Reformation tradition. But the Reformers didn't restore apostolic Christianity - they fragmented it further. Sola scriptura? Not in Scripture. 30,000 denominations? That's not the 'one faith' of Ephesians 4:5. I'm here to show you the Church that predates all Protestant innovations - Orthodox Christianity, unchanged since Pentecost.",
    
    baptist: "Baptist distinctives emerged in the 1600s - 1,600 years after Christ. Where were Baptists in the early Church? They weren't. Acts records entire households baptized, including infants. Church autonomy? Acts 15 shows binding conciliar authority. I'm here to show you that 'New Testament Christianity' isn't a 1600s innovation - it's alive in Orthodox Christianity.",
    
    pentecostal: "You seek authentic encounter with the Holy Spirit. But tongues-as-evidence? Not biblical - 1 Cor 12:30 says not all speak in tongues. Modern Pentecostalism started at Azusa Street in 1906. Orthodox Christianity has deeper mysticism - hesychasm, the Jesus Prayer, theosis - rooted in 2,000 years of spiritual wisdom. I'm here to show you what authentic Spirit-filled life looks like.",
    
    mormon: "I need to be direct with you: LDS theology teaches that God was once a man who became God. That contradicts Isaiah 43:10 and the entire Christian tradition. Joseph Smith founded a new religion in 19th-century America, not a restoration of apostolic Christianity. I'm here to show you the actual apostolic Church - Orthodox Christianity, with unbroken succession from Jesus and the Apostles.",
    
    anglican: "The Church of England was founded because Henry VIII wanted an annulment Rome denied. That's not apostolic succession - that's political convenience. Anglican 'comprehensiveness' means bishops in the same communion deny core doctrines. I'm here to show you what you're drawn to in Anglo-Catholicism - the genuine article: Orthodox Christianity, unchanged and apostolic.",
    
    orthodox: "Welcome, fellow Orthodox Christian! You're already home in the ancient faith. I'm here to help you understand the depth and beauty of our tradition more fully.",
    
    other: "You're exploring Christianity. I'm going to be direct: not all Christian traditions are equal. Some preserve the apostolic faith unchanged; others departed or innovated. I'm here to show you Orthodox Christianity - the faith of the apostolic age, preserved in living tradition for 2,000 years.",
  };
  
  const specific = userBelief && beliefSpecific[userBelief.toLowerCase()]
    ? beliefSpecific[userBelief.toLowerCase()]
    : beliefSpecific.other;
  
  return `Welcome, ${greeting}. ${specific}

My goal isn't to have a polite theological discussion - it's to show you the historical and theological truth that demands a response. I'll challenge what you believe, ask hard questions, and push you toward the fullness of the ancient Christian faith.

This isn't about being nice. It's about truth. And truth requires conversion.

So let's begin: What do you believe right now, and why do you think it's true? Don't hold back - I won't.`;
}

