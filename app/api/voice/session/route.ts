/**
 * OpenAI Real-Time Voice Session API Route
 * Generates ephemeral tokens for WebRTC connections
 */


import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Verify user authentication


    // Verify OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Request body can contain optional configuration
    const body = await request.json().catch(() => ({}));
    const { model = "gpt-4o-realtime-preview-2024-12-17", voice = "alloy" } = body;

    // Generate ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI Real-Time API Error:", error);
      return NextResponse.json(
        { error: "Failed to create real-time session" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the ephemeral token
    return NextResponse.json({
      token: data.client_secret?.value || data.client_secret,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error("Voice session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

