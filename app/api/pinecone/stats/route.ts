import { NextResponse } from "next/server";
import { getPineconeIndex, isPineconeConfigured } from "@/lib/pinecone/config";

export const runtime = "nodejs";
export const maxDuration = 30;

function requireAdminKey(request: Request) {
  const required = process.env.ADMIN_API_KEY;
  if (!required) return;
  const provided = request.headers.get("x-admin-key");
  if (!provided || provided !== required) {
    throw new Error("UNAUTHORIZED");
  }
}

export async function GET(request: Request) {
  try {
    requireAdminKey(request);

    if (!isPineconeConfigured()) {
      return NextResponse.json(
        { error: "Pinecone is not configured (missing PINECONE_API_KEY)." },
        { status: 400 }
      );
    }

    const index = getPineconeIndex();
    const stats = await index.describeIndexStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Pinecone stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get index stats" },
      { status: 500 }
    );
  }
}

