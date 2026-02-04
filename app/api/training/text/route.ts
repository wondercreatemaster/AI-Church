/**
 * Training API: Ingest plain text into the chatbot database (Pinecone)
 */

import { NextResponse } from "next/server";
import { ingestText } from "@/lib/pinecone/ingest-service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, title, source, author } = body as {
      content?: string;
      title?: string;
      source?: string;
      author?: string;
    };

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "content is required and must be non-empty text" },
        { status: 400 }
      );
    }

    const result = await ingestText(content.trim(), {
      title: title?.trim() || undefined,
      source: source?.trim() || undefined,
      author: author?.trim() || undefined,
    });

    if (result.upserted === 0 && result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors[0],
          upserted: result.upserted,
          chunks: result.chunks,
          errors: result.errors,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      upserted: result.upserted,
      chunks: result.chunks,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Training text ingest error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to ingest text",
      },
      { status: 500 }
    );
  }
}
