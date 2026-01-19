"use server";

import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  CONVERSATIONS_COLLECTION,
  Conversation,
  ConversationStage,
  generateConversationTitle,
  transformConversation,
} from "@/lib/db/models/conversation";
import {
  MESSAGES_COLLECTION,
  Message,
  CreateMessageInput,
  transformMessage,
} from "@/lib/db/models/message";
import { generateResponse, isLangChainConfigured } from "@/lib/langchain/chat-service";
import { shouldProgressStage } from "@/lib/prompts/orthodox-prompts";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Send a message and get AI response
 */
export async function sendMessageAction(
  conversationId: string | null,
  content: string,
  userBelief?: string
): Promise<{
  success: boolean;
  message?: string;
  conversationId?: string;
  assistantMessage?: ChatMessage;
  newStage?: ConversationStage;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if LangChain/OpenAI is configured
    if (!isLangChainConfigured()) {
      return {
        success: false,
        message: "OpenAI is not configured. Please add OPENAI_API_KEY to .env.local",
      };
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);
    let convId: ObjectId;
    let currentStage: ConversationStage = "A";

    // Create new conversation if needed
    if (!conversationId) {
      const title = generateConversationTitle(content);
      const newConversation: Omit<Conversation, "_id"> = {
        userId,
        title,
        stage: "A",
        userBelief,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
      };

      const result = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).insertOne(newConversation as Conversation);
      convId = result.insertedId;
    } else {
      convId = new ObjectId(conversationId);
      
      // Get current stage
      const conversation = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).findOne({ _id: convId });
      if (conversation) {
        currentStage = conversation.stage;
      }
    }

    // Save user message
    const userMessage: CreateMessageInput = {
      conversationId: convId,
      userId,
      role: "user",
      content,
      timestamp: new Date(),
    };

    await db.collection<Message>(MESSAGES_COLLECTION).insertOne(userMessage as Message);

    // Get conversation history
    const messages = await db
      .collection<Message>(MESSAGES_COLLECTION)
      .find({ conversationId: convId })
      .sort({ timestamp: 1 })
      .toArray();

    // Get current conversation state for memory
    const conversation = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).findOne({ _id: convId });
    const memoryState = conversation ? {
      theologicalPositions: conversation.theologicalPositions || {},
      resistanceLevel: conversation.resistanceLevel || 5,
      opennessScore: conversation.opennessScore || 5,
      conversionGoals: conversation.conversionGoals || [],
      lastTactic: conversation.lastTactic,
      contradictionsIdentified: conversation.contradictionsIdentified || [],
      objectionsRaised: conversation.objectionsRaised || [],
      topicsSensitive: conversation.topicsSensitive || [],
      messageHistory: [],
    } : undefined;

    // Generate AI response using LangChain conversion agent
    const response = await generateResponse({
      messages,
      stage: currentStage,
      userBelief,
      memoryState,
    });

    // Log if sources were used
    if (response.sources && response.sources.length > 0) {
      console.log(`Response enhanced with ${response.sources.length} Orthodox sources:`, response.sources);
    }

    // Log conversion tactic used
    if (response.tactic) {
      console.log(`Conversion tactic: ${response.tactic}`);
    }

    // Save assistant message
    const assistantMessage: CreateMessageInput = {
      conversationId: convId,
      userId,
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      tokens: response.tokens,
    };

    const assistantResult = await db.collection<Message>(MESSAGES_COLLECTION).insertOne(assistantMessage as Message);

    // Check if stage should progress
    const messageCount = messages.length + 1; // +1 for the new user message
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
    const updateFields: Partial<Conversation> = {
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

    await db.collection<Conversation>(CONVERSATIONS_COLLECTION).updateOne(
      { _id: convId },
      { $set: updateFields }
    );

    return {
      success: true,
      conversationId: convId.toString(),
      assistantMessage: {
        id: assistantResult.insertedId.toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      },
      newStage,
    };
  } catch (error) {
    console.error("Send message error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

/**
 * Load messages for a conversation
 */
export async function loadConversationMessagesAction(conversationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", messages: [] };
    }

    const db = await getDatabase();
    const convId = new ObjectId(conversationId);
    const userId = new ObjectId(session.user.id);

    // Verify user owns this conversation
    const conversation = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).findOne({
      _id: convId,
      userId,
    });

    if (!conversation) {
      return { success: false, message: "Conversation not found", messages: [] };
    }

    // Get messages
    const messages = await db
      .collection<Message>(MESSAGES_COLLECTION)
      .find({ conversationId: convId })
      .sort({ timestamp: 1 })
      .toArray();

    return {
      success: true,
      messages: messages.map(transformMessage),
      conversation: transformConversation(conversation),
    };
  } catch (error) {
    console.error("Load messages error:", error);
    return { success: false, message: "Failed to load messages", messages: [] };
  }
}

/**
 * Get user's conversations
 */
export async function getUserConversationsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", conversations: [] };
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const conversations = await db
      .collection<Conversation>(CONVERSATIONS_COLLECTION)
      .find({ userId, isArchived: { $ne: true } })
      .sort({ lastMessageAt: -1 })
      .toArray();

    return {
      success: true,
      conversations: conversations.map(transformConversation),
    };
  } catch (error) {
    console.error("Get conversations error:", error);
    return { success: false, message: "Failed to load conversations", conversations: [] };
  }
}

/**
 * Create a new conversation
 */
export async function createConversationAction(userBelief?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const newConversation: Omit<Conversation, "_id"> = {
      userId,
      title: "New Conversation",
      stage: "A",
      userBelief,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: new Date(),
    };

    const result = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).insertOne(newConversation as Conversation);

    return {
      success: true,
      conversationId: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Create conversation error:", error);
    return { success: false, message: "Failed to create conversation" };
  }
}

