import { ObjectId } from "mongodb";

export type MessageRole = "user" | "assistant" | "system";

export interface ComparisonData {
  topic: string;
  orthodoxView: string;
  otherView: string;
  historicalContext?: string;
  sources?: string[];
}

export interface Message {
  _id?: ObjectId;
  conversationId: ObjectId;
  userId: ObjectId;
  role: MessageRole;
  content: string;
  comparisonData?: ComparisonData;
  timestamp: Date;
  tokens?: number; // Token usage for this message
  sources?: string[];           // AI-retrieved sources from RAG
  userReferences?: string[];    // User-added/edited references
}

export interface MessageWithId extends Omit<Message, "_id" | "conversationId" | "userId"> {
  id: string;
  conversationId: string;
  userId: string;
}

export type CreateMessageInput = Omit<Message, "_id">;

// Collection name
export const MESSAGES_COLLECTION = "messages";

// Helper function to transform MongoDB message to safe object
export function transformMessage(message: Message): MessageWithId {
  const { _id, conversationId, userId, ...rest } = message;
  return {
    ...rest,
    id: _id?.toString() || "",
    conversationId: conversationId.toString(),
    userId: userId.toString(),
  };
}

// Helper to format messages for OpenAI API
export function formatMessagesForOpenAI(messages: Message[]): Array<{role: string; content: string}> {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

