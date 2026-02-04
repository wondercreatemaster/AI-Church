/**
 * Training API: Ingest PDF file into the chatbot database (Pinecone)
 */

import { NextResponse } from "next/server";
import { ingestPDF } from "@/lib/pinecone/ingest-service";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || undefined;
    const author = (formData.get("author") as string) || undefined;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "file is required and must be a PDF file" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF (application/pdf)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestPDF(buffer, {
      filename: file.name,
      title: title?.trim() || file.name,
      author: author?.trim() || undefined,
    });

    if (result.upserted === 0 && result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors[0],
          upserted: result.upserted,
          chunks: result.chunks,
          pages: result.pages,
          errors: result.errors,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      upserted: result.upserted,
      chunks: result.chunks,
      pages: result.pages,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Training PDF ingest error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to ingest PDF",
      },
      { status: 500 }
    );
  }
}
