import { NextResponse } from "next/server";
import { getDocument, updateDocument } from "@/lib/db";
import { generateStudyMaterial } from "@/lib/study";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  let id: string | undefined;
  try {
    const body = (await request.json()) as { id?: string };
    id = body.id;
    if (!id) {
      return NextResponse.json({ error: "Missing document id." }, { status: 400 });
    }

    const doc = await getDocument(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }
    if (doc.status === "processing") {
      return NextResponse.json(
        { error: "This document is already being processed." },
        { status: 409 },
      );
    }
    if (!doc.text || doc.text.trim().length < 40) {
      return NextResponse.json(
        {
          error:
            "There is not enough readable text in this document to build study material.",
        },
        { status: 422 },
      );
    }

    await updateDocument(id, {
      status: "processing",
      stage: "extracting",
      error: undefined,
    });

    const result = await generateStudyMaterial(doc, async (stage) => {
      await updateDocument(doc.id, { stage });
    });

    await updateDocument(doc.id, {
      study: result.study,
      status: "ready",
      stage: "done",
      processedAt: new Date().toISOString(),
      error: undefined,
    });

    return NextResponse.json({
      ok: true,
      generatedBy: result.study.generatedBy,
      model: result.study.model,
      warnings: result.study.warnings,
      aiError: result.aiError,
    });
  } catch (error) {
    console.error("[notewise] processing failed:", error);
    if (id) {
      await updateDocument(id, {
        status: "failed",
        stage: "done",
        error:
          error instanceof Error
            ? error.message
            : "Processing failed unexpectedly.",
      }).catch(() => undefined);
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Processing failed unexpectedly. Your document is still saved.",
      },
      { status: 500 },
    );
  }
}
