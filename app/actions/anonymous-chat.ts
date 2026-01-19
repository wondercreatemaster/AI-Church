"use server";

import { getOrCreateAnonymousSession } from "@/lib/auth/anonymous-session";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  ANONYMOUS_CONVERSATIONS_COLLECTION,
  AnonymousConversation,
  generateAnonymousConversationTitle,
  transformAnonymousConversation,
} from "@/lib/db/models/anonymous-conversation";
import {
  ANONYMOUS_MESSAGES_COLLECTION,
  AnonymousMessage,
  CreateAnonymousMessageInput,
  transformAnonymousMessage,
} from "@/lib/db/models/anonymous-message";
import { ConversationStage } from "@/lib/db/models/conversation";
import { generateResponse, isLangChainConfigured } from "@/lib/langchain/chat-service";
import { shouldProgressStage } from "@/lib/prompts/orthodox-prompts";
import { checkRateLimit } from "@/lib/utils/rate-limiter";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Send a message as anonymous user and get AI response
 */
export async function sendAnonymousMessageAction(
  conversationId: string | null,
  content: string,
  userBelief?: string
): Promise<{
  success: boolean;
  message?: string;
  conversationId?: string;
  assistantMessage?: ChatMessage;
  newStage?: ConversationStage;
  memoryState?: any;
}> {
  try {
    // Get or create anonymous session
    const sessionId = await getOrCreateAnonymousSession();

    // Rate limiting check
    const rateLimit = checkRateLimit(sessionId);
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: `Please wait ${rateLimit.retryAfter} seconds before sending another message.`,
      };
    }

    // Check if LangChain/OpenAI is configured
    if (!isLangChainConfigured()) {
      return {
        success: false,
        message: "OpenAI is not configured. Please add OPENAI_API_KEY to .env.local",
      };
    }

    const db = await getDatabase();
    let convId: string;
    let currentStage: ConversationStage = "A";

    // Create new conversation if needed
    if (!conversationId) {
      const title = generateAnonymousConversationTitle(content);
      const newConversation: Omit<AnonymousConversation, "_id"> = {
        sessionId,
        title,
        stage: "A",
        userBelief,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
      };

      const result = await db
        .collection(ANONYMOUS_CONVERSATIONS_COLLECTION)
        .insertOne(newConversation);
      convId = result.insertedId.toString();
    } else {
      convId = conversationId;

      // Get current stage (convert string ID to ObjectId for query)
      const objectId = new ObjectId(conversationId);
      const conversation = await db
        .collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
        .findOne({ _id: objectId as any, sessionId });

      if (!conversation) {
        return { success: false, message: "Conversation not found" };
      }

      currentStage = conversation.stage;
    }

    // Save user message
    const userMessage: CreateAnonymousMessageInput = {
      conversationId: convId,
      sessionId,
      role: "user",
      content,
      timestamp: new Date(),
    };

    await db.collection(ANONYMOUS_MESSAGES_COLLECTION).insertOne(userMessage);

    // Get conversation history
    const messages = await db
      .collection<AnonymousMessage>(ANONYMOUS_MESSAGES_COLLECTION)
      .find({ conversationId: convId })
      .sort({ timestamp: 1 })
      .toArray();

    // Get current conversation state for memory
    const conversation = await db
      .collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .findOne({ _id: convId });

    const memoryState = conversation
      ? {
          theologicalPositions: conversation.theologicalPositions || {},
          resistanceLevel: conversation.resistanceLevel || 5,
          opennessScore: conversation.opennessScore || 5,
          conversionGoals: conversation.conversionGoals || [],
          lastTactic: conversation.lastTactic,
          contradictionsIdentified: conversation.contradictionsIdentified || [],
          objectionsRaised: conversation.objectionsRaised || [],
          topicsSensitive: conversation.topicsSensitive || [],
          messageHistory: [],
        }
      : undefined;

    // Generate AI response using LangChain conversion agent
    // Convert anonymous messages to Message-compatible format
    const compatibleMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      tokens: msg.tokens,
    })) as any[];

    const response = await generateResponse({
      messages: compatibleMessages as any,
      stage: currentStage,
      userBelief,
      memoryState,
    });

    // Save assistant message
    const assistantMessage: CreateAnonymousMessageInput = {
      conversationId: convId,
      sessionId,
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      tokens: response.tokens,
    };

    const assistantResult = await db
      .collection(ANONYMOUS_MESSAGES_COLLECTION)
      .insertOne(assistantMessage);

    // Check if stage should progress
    const messageCount = messages.length + 1;
    const shouldProgress = shouldProgressStage(currentStage, messageCount, content);

    let newStage: ConversationStage | undefined;
    if (shouldProgress) {
      const stageMap: Record<ConversationStage, ConversationStage> = {
        A: "B",
        B: "C",
        C: "D",
        D: "D",
      };
      newStage = stageMap[currentStage];
      currentStage = newStage;
    }

    // Update conversation with conversion tracking data
    const updateFields: Partial<AnonymousConversation> = {
      lastMessageAt: new Date(),
      updatedAt: new Date(),
      ...(newStage ? { stage: newStage } : {}),
    };

    // Update with memory state from agent
    if (response.memoryState) {
      updateFields.theologicalPositions = response.memoryState.theologicalPositions;
      updateFields.resistanceLevel = response.memoryState.resistanceLevel;
      updateFields.opennessScore = response.memoryState.opennessScore;
      updateFields.conversionGoals = response.memoryState.conversionGoals;
      updateFields.lastTactic = response.memoryState.lastTactic;
      updateFields.contradictionsIdentified = response.memoryState.contradictionsIdentified;
      updateFields.objectionsRaised = response.memoryState.objectionsRaised;
      updateFields.topicsSensitive = response.memoryState.topicsSensitive;
    }

    await db
      .collection(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .updateOne({ _id: convId as any, sessionId }, { $set: updateFields });

    return {
      success: true,
      conversationId: convId,
      assistantMessage: {
        id: assistantResult.insertedId.toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      },
      newStage,
      memoryState: response.memoryState,
    };
  } catch (error) {
    console.error("Send anonymous message error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

/**
 * Load messages for an anonymous conversation
 */
export async function loadAnonymousConversationAction(conversationId: string) {
  try {
    const sessionId = await getOrCreateAnonymousSession();

    const db = await getDatabase();

    // Convert string ID to ObjectId for MongoDB query
    const objectId = new ObjectId(conversationId);

    // Verify session owns this conversation
    const conversation = await db
      .collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .findOne({
        _id: objectId as any,
        sessionId,
      });

    if (!conversation) {
      return { success: false, message: "Conversation not found", messages: [] };
    }

    // Get messages (conversationId stored as string in messages)
    const messages = await db
      .collection<AnonymousMessage>(ANONYMOUS_MESSAGES_COLLECTION)
      .find({ conversationId })
      .sort({ timestamp: 1 })
      .toArray();

    return {
      success: true,
      messages: messages.map(transformAnonymousMessage),
      conversation: transformAnonymousConversation(conversation),
    };
  } catch (error) {
    console.error("Load anonymous messages error:", error);
    return { success: false, message: "Failed to load messages", messages: [] };
  }
}

/**
 * Get anonymous user's conversations
 */
export async function getAnonymousConversationsAction() {
  try {
    const sessionId = await getOrCreateAnonymousSession();

    const db = await getDatabase();

    const conversations = await db
      .collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .find({ sessionId, isArchived: { $ne: true } })
      .sort({ lastMessageAt: -1 })
      .toArray();

    return {
      success: true,
      conversations: conversations.map(transformAnonymousConversation),
    };
  } catch (error) {
    console.error("Get anonymous conversations error:", error);
    return { success: false, message: "Failed to load conversations", conversations: [] };
  }
}

