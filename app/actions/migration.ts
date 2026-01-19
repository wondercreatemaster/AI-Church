"use server";

import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  ANONYMOUS_CONVERSATIONS_COLLECTION,
  AnonymousConversation,
} from "@/lib/db/models/anonymous-conversation";
import {
  ANONYMOUS_MESSAGES_COLLECTION,
  AnonymousMessage,
} from "@/lib/db/models/anonymous-message";
import {
  CONVERSATIONS_COLLECTION,
  Conversation,
} from "@/lib/db/models/conversation";
import {
  MESSAGES_COLLECTION,
  Message,
} from "@/lib/db/models/message";

/**
 * Migrate all anonymous conversations and messages to authenticated user account
 * This is called automatically after signup or login
 */
export async function migrateAnonymousConversations(
  sessionId: string,
  userId: string
): Promise<{
  success: boolean;
  message?: string;
  migratedCount?: number;
}> {
  try {
    const db = await getDatabase();
    const userObjectId = new ObjectId(userId);

    // Find all anonymous conversations for this session
    const anonymousConversations = await db
      .collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .find({ sessionId })
      .toArray();

    if (anonymousConversations.length === 0) {
      return {
        success: true,
        message: "No conversations to migrate",
        migratedCount: 0,
      };
    }

    let migratedCount = 0;

    // Migrate each conversation
    for (const anonConv of anonymousConversations) {
      const anonConvId = anonConv._id?.toString();
      if (!anonConvId) continue;

      // Create authenticated conversation
      const newConversation: Omit<Conversation, "_id"> = {
        userId: userObjectId,
        title: anonConv.title,
        stage: anonConv.stage,
        userBelief: anonConv.userBelief,
        createdAt: anonConv.createdAt,
        updatedAt: anonConv.updatedAt,
        lastMessageAt: anonConv.lastMessageAt,
        isArchived: anonConv.isArchived,
        theologicalPositions: anonConv.theologicalPositions,
        resistanceLevel: anonConv.resistanceLevel,
        opennessScore: anonConv.opennessScore,
        conversionGoals: anonConv.conversionGoals,
        lastTactic: anonConv.lastTactic,
        contradictionsIdentified: anonConv.contradictionsIdentified,
        objectionsRaised: anonConv.objectionsRaised,
        topicsSensitive: anonConv.topicsSensitive,
      };

      const convResult = await db
        .collection<Conversation>(CONVERSATIONS_COLLECTION)
        .insertOne(newConversation as Conversation);

      const newConvId = convResult.insertedId;

      // Get all messages for this anonymous conversation
      const anonymousMessages = await db
        .collection<AnonymousMessage>(ANONYMOUS_MESSAGES_COLLECTION)
        .find({ conversationId: anonConvId })
        .sort({ timestamp: 1 })
        .toArray();

      // Migrate messages
      if (anonymousMessages.length > 0) {
        const newMessages = anonymousMessages.map((anonMsg) => ({
          conversationId: newConvId,
          userId: userObjectId,
          role: anonMsg.role,
          content: anonMsg.content,
          comparisonData: anonMsg.comparisonData,
          timestamp: anonMsg.timestamp,
          tokens: anonMsg.tokens,
        }));

        await db.collection<Message>(MESSAGES_COLLECTION).insertMany(newMessages as Message[]);
      }

      // Delete anonymous conversation and messages
      await db
        .collection(ANONYMOUS_CONVERSATIONS_COLLECTION)
        .deleteOne({ _id: anonConvId as any });
      await db
        .collection(ANONYMOUS_MESSAGES_COLLECTION)
        .deleteMany({ conversationId: anonConvId as any });

      migratedCount++;
    }

    return {
      success: true,
      message: `Successfully migrated ${migratedCount} conversation(s)`,
      migratedCount,
    };
  } catch (error) {
    console.error("Migration error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to migrate conversations",
      migratedCount: 0,
    };
  }
}

/**
 * Check if there are any anonymous conversations to migrate
 */
export async function hasAnonymousConversations(sessionId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const count = await db
      .collection(ANONYMOUS_CONVERSATIONS_COLLECTION)
      .countDocuments({ sessionId });
    return count > 0;
  } catch (error) {
    console.error("Check anonymous conversations error:", error);
    return false;
  }
}

