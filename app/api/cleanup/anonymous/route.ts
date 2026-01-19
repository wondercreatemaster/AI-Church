/**
 * API route to cleanup old anonymous conversations
 * Can be called manually or via cron job
 */

import { NextResponse } from "next/server";
import { cleanupOldAnonymousData, getAnonymousDataStats } from "@/lib/db/cleanup-anonymous";

export async function POST(request: Request) {
  try {
    // Optional: Add authentication check here to protect this endpoint
    // For now, you might want to add a secret token check
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await cleanupOldAnonymousData();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cleanup API error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup anonymous data" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Optional: Add authentication check here
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stats = await getAnonymousDataStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}

