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

function toBool(v: string | null): boolean {
  return v === "1" || v?.toLowerCase() === "true";
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

    const { searchParams } = new URL(request.url);
    const namespace = (searchParams.get("namespace") ?? "").trim();
    const prefix = (searchParams.get("prefix") ?? "").trim();
    const paginationToken = searchParams.get("paginationToken") ?? undefined;
    const limitRaw = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitRaw ?? "50", 10) || 50, 1), 200);
    const includeMetadata = toBool(searchParams.get("includeMetadata"));
    const includeText = toBool(searchParams.get("includeText"));

    const index = getPineconeIndex().namespace(namespace);

    // listPaginated is only supported on serverless indexes. If unsupported, this will throw.
    const list = await index.listPaginated({
      prefix: prefix || undefined,
      limit,
      paginationToken,
    });

    const ids = (list.vectors ?? [])
      .map((v) => v.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    let records: Record<string, unknown> | undefined;
    if (includeMetadata && ids.length > 0) {
      const fetched = await index.fetch(ids);
      // Strip vector values to keep payload small
      records = Object.fromEntries(
        Object.entries(fetched.records ?? {}).map(([id, rec]) => [
          id,
          {
            id: rec.id,
            metadata:
              !includeText &&
              rec.metadata &&
              typeof rec.metadata === "object" &&
              "text" in rec.metadata
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (() => {
                    const { text: _text, ...rest } = rec.metadata as any;
                    return rest;
                  })()
                : rec.metadata,
          },
        ])
      );
    }

    return NextResponse.json({
      success: true,
      namespace: list.namespace ?? namespace,
      prefix,
      vectors: includeMetadata
        ? ids.map((id) => ({ id, ...(records?.[id] ? { record: records[id] } : {}) }))
        : ids.map((id) => ({ id })),
      pagination: list.pagination ?? undefined,
      usage: list.usage ?? undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Common: listPaginated not supported on pod-based indexes
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.toLowerCase().includes("listpaginated")) {
      return NextResponse.json(
        {
          error:
            "Listing record IDs is not supported for this Pinecone index type. Use Pinecone console, or switch to a serverless index to use listPaginated().",
          details: msg,
        },
        { status: 400 }
      );
    }

    console.error("Pinecone list error:", error);
    return NextResponse.json(
      { error: msg || "Failed to list records" },
      { status: 500 }
    );
  }
}

