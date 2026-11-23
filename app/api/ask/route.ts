import { NextResponse } from "next/server";
import { getDocument } from "@/lib/db";
import { getAiConfig } from "@/lib/ai";
import { askDocument } from "@/lib/study";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      question?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    if (!body.id || !body.question?.trim()) {
      return NextResponse.json(
        { error: "Ask a question about the document first." },
        { status: 400 },
      );
    }
    if (body.question.length > 2000) {
      return NextResponse.json({ error: "That question is too long." }, { status: 400 });
    }

    const doc = await getDocument(body.id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (!getAiConfig().chatEnabled) {
      return NextResponse.json(
        { error: "Chat is disabled in this deployment." },
        { status: 403 },
      );
    }

    const history = Array.isArray(body.history)
      ? body.history
          .filter(
            (message) =>
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string",
          )
          .slice(-6)
      : [];

    const result = await askDocument(doc, body.question.trim(), history);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[notewise] ask failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The assistant could not answer right now.",
      },
      { status: 500 },
    );
  }
}
