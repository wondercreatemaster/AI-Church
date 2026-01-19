export type ConversationStage = "A" | "B" | "C" | "D";

export interface TheologicalPosition {
  topic: string;
  belief: string;
  challenged: boolean;
  conceded: boolean;
  lastChallengedAt?: Date;
}

export interface ConversionGoal {
  type: "acknowledge_orthodox" | "express_doubt" | "commit_visit_church" | "attend_liturgy" | "speak_with_priest" | "begin_catechism";
  description: string;
  achieved: boolean;
  attemptedAt?: Date;
  achievedAt?: Date;
}

export type ConversationTactic = "attack" | "probe" | "present" | "pressure" | "soften";

export interface QuestionResponse {
  questionId: string;
  userResponse: string;
  understandingLevel: number; // 1-10
  timestamp: Date;
}

export interface AnonymousConversation {
  _id?: string;
  sessionId: string; // Anonymous session identifier
  title: string;
  stage: ConversationStage;
  userBelief?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  isArchived?: boolean;
  
  // Conversion tracking fields
  theologicalPositions?: Record<string, TheologicalPosition>;
  resistanceLevel?: number; // 1-10 scale, 1 = very open, 10 = very resistant
  opennessScore?: number; // 1-10 scale, 1 = closed, 10 = very open
  conversionGoals?: ConversionGoal[];
  lastTactic?: ConversationTactic;
  contradictionsIdentified?: string[]; // Track logical contradictions found in user's beliefs
  objectionsRaised?: string[]; // Track what objections user has raised
  topicsSensitive?: string[]; // Topics that make user defensive
  
  // Question tracking fields for agent-led conversation
  questionsAsked?: string[]; // Array of question IDs asked
  currentQuestionId?: string; // Current active question
  lastQuestionAskedAt?: Date;
  questionResponses?: Record<string, QuestionResponse>;
}

export interface AnonymousConversationWithId extends Omit<AnonymousConversation, "_id"> {
  id: string;
}

export type CreateAnonymousConversationInput = Omit<AnonymousConversation, "_id" | "createdAt" | "updatedAt" | "lastMessageAt">;

export type UpdateAnonymousConversationInput = Partial<Pick<AnonymousConversation, "title" | "stage" | "isArchived">>;

// Collection name
export const ANONYMOUS_CONVERSATIONS_COLLECTION = "anonymous_conversations";

// Helper function to transform anonymous conversation to safe object
export function transformAnonymousConversation(conversation: AnonymousConversation): AnonymousConversationWithId {
  const { _id, ...rest } = conversation;
  return {
    ...rest,
    id: _id?.toString() || "",
  };
}

// Helper to generate conversation title from first message
export function generateAnonymousConversationTitle(firstMessage: string): string {
  const maxLength = 50;
  const trimmed = firstMessage.trim();
  
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  
  return trimmed.substring(0, maxLength).trim() + "...";
}

