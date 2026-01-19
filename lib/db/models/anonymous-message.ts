export type MessageRole = "user" | "assistant" | "system";

export interface ComparisonData {
  topic: string;
  orthodoxView: string;
  otherView: string;
  historicalContext?: string;
  sources?: string[];
}

export interface AnonymousMessage {
  _id?: string;
  conversationId: string; // Anonymous conversation ID
  sessionId: string; // Anonymous session identifier
  role: MessageRole;
  content: string;
  comparisonData?: ComparisonData;
  timestamp: Date;
  tokens?: number; // Token usage for this message
  sources?: string[];           // AI-retrieved sources from RAG
  userReferences?: string[];    // User-added/edited references
}

export interface AnonymousMessageWithId extends Omit<AnonymousMessage, "_id"> {
  id: string;
}

export type CreateAnonymousMessageInput = Omit<AnonymousMessage, "_id">;

// Collection name
export const ANONYMOUS_MESSAGES_COLLECTION = "anonymous_messages";

// Helper function to transform anonymous message to safe object
export function transformAnonymousMessage(message: AnonymousMessage): AnonymousMessageWithId {
  const { _id, ...rest } = message;
  return {
    ...rest,
    id: _id?.toString() || "",
  };
}

// Helper to format messages for OpenAI API
export function formatAnonymousMessagesForOpenAI(messages: AnonymousMessage[]): Array<{role: string; content: string}> {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

