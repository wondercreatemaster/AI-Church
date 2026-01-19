"use server";

import { getDatabase } from "./mongodb";
import {
  ANONYMOUS_CONVERSATIONS_COLLECTION,
  AnonymousConversation,
} from "./models/anonymous-conversation";
import {
  ANONYMOUS_MESSAGES_COLLECTION,
  AnonymousMessage,
} from "./models/anonymous-message";

const CLEANUP_THRESHOLD_DAYS = 30;

/**
 * Delete anonymous conversations and messages older than 30 days
 * This prevents database bloat from abandoned anonymous sessions
 */
export async function cleanupOldAnonymousData(): Promise<{
  success: boolean;
  deletedConversations: number;
  deletedMessages: number;
  message?: string;
}> {
  try {
    const db = await getDatabase();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - CLEANUP_THRESHOLD_DAYS);

    // Find old anonymous conversations
    const oldConversations = await db
      .collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .find({
        createdAt: { $lt: thresholdDate },
      })
      .toArray();

    if (oldConversations.length === 0) {
      return {
        success: true,
        deletedConversations: 0,
        deletedMessages: 0,
        message: "No old anonymous conversations to clean up",
      };
    }

    const conversationIds = oldConversations.map((conv) => conv._id).filter((id) => id);

    // Delete messages for these conversations
    const messagesResult = await db
      .collection<AnonymousMessage>(ANONYMOUS_MESSAGES_COLLECTION)
      .deleteMany({
        conversationId: { $in: conversationIds as string[] },
      });

    // Delete conversations
    const conversationsResult = await db
      .collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .deleteMany({
        createdAt: { $lt: thresholdDate },
      });

    return {
      success: true,
      deletedConversations: conversationsResult.deletedCount,
      deletedMessages: messagesResult.deletedCount,
      message: `Cleaned up ${conversationsResult.deletedCount} conversations and ${messagesResult.deletedCount} messages older than ${CLEANUP_THRESHOLD_DAYS} days`,
    };
  } catch (error) {
    console.error("Cleanup error:", error);
    return {
      success: false,
      deletedConversations: 0,
      deletedMessages: 0,
      message: error instanceof Error ? error.message : "Failed to cleanup old data",
    };
  }
}

/**
 * Get statistics about anonymous data
 */
export async function getAnonymousDataStats(): Promise<{
  totalConversations: number;
  totalMessages: number;
  oldConversations: number;
  oldMessages: number;
}> {
  try {
    const db = await getDatabase();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - CLEANUP_THRESHOLD_DAYS);

    const totalConversations = await db
      .collection(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .countDocuments();

    const totalMessages = await db
      .collection(ANONYMOUS_MESSAGES_COLLECTION)
      .countDocuments();

    const oldConversations = await db
      .collection(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .countDocuments({
        createdAt: { $lt: thresholdDate },
      });

    const oldConversationsList = await db
      .collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .find({
        createdAt: { $lt: thresholdDate },
      })
      .toArray();

    const oldConversationIds = oldConversationsList.map((conv) => conv._id).filter((id) => id);

    const oldMessages = oldConversationIds.length > 0
      ? await db
          .collection(ANONYMOUS_MESSAGES_COLLECTION)
          .countDocuments({
            conversationId: { $in: oldConversationIds as string[] },
          })
      : 0;

    return {
      totalConversations,
      totalMessages,
      oldConversations,
      oldMessages,
    };
  } catch (error) {
    console.error("Stats error:", error);
    return {
      totalConversations: 0,
      totalMessages: 0,
      oldConversations: 0,
      oldMessages: 0,
    };
  }
}

