/**
 * Reference Management API
 * Handles adding, editing, and deleting user references on messages
 */

import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { MESSAGES_COLLECTION, Message } from "@/lib/db/models/message";
import { ANONYMOUS_MESSAGES_COLLECTION, AnonymousMessage } from "@/lib/db/models/anonymous-message";
import { getOrCreateAnonymousSession } from "@/lib/auth/anonymous-session";

export const runtime = 'nodejs';

// PUT - Add or edit a reference
export async function PUT(request: Request) {
  try {
    const session = await auth();
    const { messageId, conversationId, reference, index } = await request.json();

    if (!messageId || !reference) {
      return new Response(
        JSON.stringify({ error: "messageId and reference are required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDatabase();
    const isAuthenticated = !!session?.user?.id;

    if (isAuthenticated) {
      // Authenticated user
      const objectId = new ObjectId(messageId);
      const message = await db.collection<Message>(MESSAGES_COLLECTION).findOne({
        _id: objectId,
        userId: new ObjectId(session.user.id),
      });

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message not found" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const userReferences = message.userReferences || [];

      if (typeof index === 'number' && index >= 0 && index < userReferences.length) {
        // Edit existing reference
        userReferences[index] = reference;
      } else {
        // Add new reference
        userReferences.push(reference);
      }

      await db.collection<Message>(MESSAGES_COLLECTION).updateOne(
        { _id: objectId },
        { $set: { userReferences } }
      );

      return new Response(
        JSON.stringify({ success: true, userReferences }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Anonymous user
      const sessionId = await getOrCreateAnonymousSession();
      const objectId = new ObjectId(messageId);
      
      const message = await db.collection<AnonymousMessage>(ANONYMOUS_MESSAGES_COLLECTION).findOne({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _id: objectId as any,
        sessionId,
      });

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message not found" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const userReferences = message.userReferences || [];

      if (typeof index === 'number' && index >= 0 && index < userReferences.length) {
        // Edit existing reference
        userReferences[index] = reference;
      } else {
        // Add new reference
        userReferences.push(reference);
      }

      await db.collection(ANONYMOUS_MESSAGES_COLLECTION).updateOne(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _id: objectId as any, sessionId },
        { $set: { userReferences } }
      );

      return new Response(
        JSON.stringify({ success: true, userReferences }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Reference PUT error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update reference" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE - Remove a reference
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const { messageId, index } = await request.json();

    if (!messageId || typeof index !== 'number') {
      return new Response(
        JSON.stringify({ error: "messageId and index are required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDatabase();
    const isAuthenticated = !!session?.user?.id;

    if (isAuthenticated) {
      // Authenticated user
      const objectId = new ObjectId(messageId);
      const message = await db.collection<Message>(MESSAGES_COLLECTION).findOne({
        _id: objectId,
        userId: new ObjectId(session.user.id),
      });

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message not found" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const userReferences = message.userReferences || [];

      if (index < 0 || index >= userReferences.length) {
        return new Response(
          JSON.stringify({ error: "Invalid reference index" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      userReferences.splice(index, 1);

      await db.collection<Message>(MESSAGES_COLLECTION).updateOne(
        { _id: objectId },
        { $set: { userReferences } }
      );

      return new Response(
        JSON.stringify({ success: true, userReferences }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Anonymous user
      const sessionId = await getOrCreateAnonymousSession();
      const objectId = new ObjectId(messageId);
      
      const message = await db.collection<AnonymousMessage>(ANONYMOUS_MESSAGES_COLLECTION).findOne({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _id: objectId as any,
        sessionId,
      });

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message not found" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const userReferences = message.userReferences || [];

      if (index < 0 || index >= userReferences.length) {
        return new Response(
          JSON.stringify({ error: "Invalid reference index" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      userReferences.splice(index, 1);

      await db.collection(ANONYMOUS_MESSAGES_COLLECTION).updateOne(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _id: objectId as any, sessionId },
        { $set: { userReferences } }
      );

      return new Response(
        JSON.stringify({ success: true, userReferences }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Reference DELETE error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete reference" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
