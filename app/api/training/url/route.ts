/**
 * Training API: Ingest web page from URL into the chatbot database (Pinecone)
 */

import { NextResponse } from "next/server";
import { ingestURL } from "@/lib/pinecone/ingest-service";

export const runtime = "nodejs";
export const maxDuration = 60;

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title } = body as { url?: string; title?: string };

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { error: "url is required and must be a valid HTTP(S) URL" },
        { status: 400 }
      );
    }

    const normalized = url.trim();
    if (!isValidUrl(normalized)) {
      return NextResponse.json(
        { error: "url must be a valid http or https URL" },
        { status: 400 }
      );
    }

    const result = await ingestURL(normalized, {
      title: title?.trim() || undefined,
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
    console.error("Training URL ingest error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to ingest URL",
      },
      { status: 500 }
    );
  }
}
