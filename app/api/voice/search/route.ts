/**
 * Orthodox Document Search API for Voice Chat
 * Handles function calls from OpenAI Real-Time API
 */


import { NextResponse } from "next/server";
import { getContextForQuestion } from "@/lib/pinecone/rag-service";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { CONVERSATIONS_COLLECTION } from "@/lib/db/models/conversation";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {


    const { query, conversationId, userBelief } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Retrieve relevant Orthodox documents from Pinecone
    const ragContext = await getContextForQuestion(query, userBelief);

    if (!ragContext || ragContext.documents.length === 0) {
      return NextResponse.json({
        success: true,
        result: "I don't have specific sources in my database for that question, but I can share what I know from Orthodox Christian teaching.",
        sources: [],
        documentsFound: 0,
      });
    }

    // Track search in conversation metadata if conversation ID provided
    if (conversationId) {
      try {
        const db = await getDatabase();
        await db.collection(CONVERSATIONS_COLLECTION).updateOne(
          { _id: new ObjectId(conversationId) },
          {
            $set: { lastVoiceSearchAt: new Date() },
            $inc: { voiceSearchCount: 1 },
          }
        );
      } catch (error) {
        console.warn("Failed to update conversation metadata:", error);
      }
    }

    // Format context for voice response (more concise than text)
    const contextForVoice = formatVoiceContext(ragContext);

    return NextResponse.json({
      success: true,
      result: contextForVoice,
      sources: ragContext.sources,
      documentsFound: ragContext.documents.length,
    });
  } catch (error) {
    console.error("Voice search error:", error);
    return NextResponse.json(
      { error: "Failed to search documents" },
      { status: 500 }
    );
  }
}

/**
 * Format RAG context optimized for voice responses
 * More concise than text chat format
 */
function formatVoiceContext(ragContext: any): string {
  const { documents, sources } = ragContext;

  if (documents.length === 0) {
    return "No relevant documents found.";
  }

  // Create concise context for voice
  const contextParts = documents.slice(0, 3).map((doc: any, index: number) => {
    const sourceInfo = doc.metadata?.title || doc.metadata?.source || "Document";
    return `Source ${index + 1} (${sourceInfo}): ${doc.content.substring(0, 300)}...`;
  });

  return `I found ${documents.length} relevant sources in the Orthodox documents database:\n\n${contextParts.join("\n\n")}\n\nPlease use these sources to answer the user's question in a conversational, natural speaking style. Cite sources naturally (e.g., "According to [source name]..."). Keep your response concise and suitable for voice - aim for 150-250 words.`;
}

