import { NextResponse } from "next/server";
import { aiStatus, aiText } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const status = aiStatus();
  if (!status.configured) {
    return NextResponse.json(
      { error: status.reason ?? "AI is not configured." },
      { status: 400 },
    );
  }
  const startedAt = Date.now();
  try {
    const reply = await aiText({
      system: "You are a connection test. Reply with exactly: NoteWise connection OK",
      user: "Reply with exactly: NoteWise connection OK",
      temperature: 0,
      maxTokens: 24,
    });
    return NextResponse.json({
      ok: true,
      provider: status.provider,
      model: status.model,
      latencyMs: Date.now() - startedAt,
      reply: reply.trim().slice(0, 120),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "The provider rejected the test.",
      },
      { status: 502 },
    );
  }
}
