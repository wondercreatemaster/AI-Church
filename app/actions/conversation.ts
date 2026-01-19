"use server";

import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  CONVERSATIONS_COLLECTION,
  Conversation,
  transformConversation,
} from "@/lib/db/models/conversation";
import { MESSAGES_COLLECTION, Message } from "@/lib/db/models/message";

/**
 * Update conversation title
 */
export async function updateConversationTitleAction(
  conversationId: string,
  title: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const db = await getDatabase();
    const convId = new ObjectId(conversationId);
    const userId = new ObjectId(session.user.id);

    const result = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).updateOne(
      { _id: convId, userId },
      {
        $set: {
          title,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "Conversation not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Update title error:", error);
    return { success: false, message: "Failed to update title" };
  }
}

/**
 * Delete conversation and all its messages
 */
export async function deleteConversationAction(
  conversationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const db = await getDatabase();
    const convId = new ObjectId(conversationId);
    const userId = new ObjectId(session.user.id);

    // Delete conversation
    const result = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).deleteOne({
      _id: convId,
      userId,
    });

    if (result.deletedCount === 0) {
      return { success: false, message: "Conversation not found" };
    }

    // Delete all messages
    await db.collection<Message>(MESSAGES_COLLECTION).deleteMany({
      conversationId: convId,
    });

    return { success: true };
  } catch (error) {
    console.error("Delete conversation error:", error);
    return { success: false, message: "Failed to delete conversation" };
  }
}

/**
 * Rename conversation (alias for updateConversationTitleAction)
 */
export async function renameConversationAction(
  conversationId: string,
  newTitle: string
): Promise<{ success: boolean; message?: string }> {
  return updateConversationTitleAction(conversationId, newTitle);
}

/**
 * Get all user conversations
 */
export async function getUserConversationsAction(): Promise<{
  success: boolean;
  conversations: any[];
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, conversations: [], message: "Unauthorized" };
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const conversations = await db
      .collection<Conversation>(CONVERSATIONS_COLLECTION)
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    // Get last message timestamp for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await db
          .collection<Message>(MESSAGES_COLLECTION)
          .findOne(
            { conversationId: conv._id },
            { sort: { timestamp: -1 } }
          );

        return {
          id: conv._id.toString(),
          title: conv.title,
          stage: conv.stage,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          lastMessageAt: lastMessage?.timestamp || conv.updatedAt,
        };
      })
    );

    return { success: true, conversations: conversationsWithDetails };
  } catch (error) {
    console.error("Get conversations error:", error);
    return {
      success: false,
      conversations: [],
      message: "Failed to load conversations",
    };
  }
}

/**
 * Export conversation as JSON
 */
export async function exportConversationAction(conversationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", data: null };
    }

    const db = await getDatabase();
    const convId = new ObjectId(conversationId);
    const userId = new ObjectId(session.user.id);

    // Get conversation
    const conversation = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).findOne({
      _id: convId,
      userId,
    });

    if (!conversation) {
      return { success: false, message: "Conversation not found", data: null };
    }

    // Get messages
    const messages = await db
      .collection<Message>(MESSAGES_COLLECTION)
      .find({ conversationId: convId })
      .sort({ timestamp: 1 })
      .toArray();

    const exportData = {
      conversation: {
        title: conversation.title,
        stage: conversation.stage,
        userBelief: conversation.userBelief,
        createdAt: conversation.createdAt,
      },
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      exportedAt: new Date(),
      exportedBy: session.user.name || session.user.email,
    };

    return {
      success: true,
      data: JSON.stringify(exportData, null, 2),
    };
  } catch (error) {
    console.error("Export conversation error:", error);
    return { success: false, message: "Failed to export conversation", data: null };
  }
}

