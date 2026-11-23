import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createDocument, saveUpload } from "@/lib/db";
import { extractDocument, ExtractionError } from "@/lib/extract";
import type { DocKind } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set(["pdf", "pptx", "ppt"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file was received. Drop a PDF or PPTX and try again." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 25 MB.` },
        { status: 413 },
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED.has(extension)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Upload a PDF or a modern PowerPoint (.pptx).",
        },
        { status: 415 },
      );
    }

    if (extension === "ppt") {
      return NextResponse.json(
        {
          error:
            "Legacy .ppt files cannot be read. Open it in PowerPoint and use File → Save As → PowerPoint Presentation (.pptx).",
        },
        { status: 415 },
      );
    }

    const kind: DocKind = extension === "pdf" ? "pdf" : "pptx";
    const buffer = new Uint8Array(await file.arrayBuffer());

    let extraction;
    try {
      // pdf.js transfers the underlying buffer to its worker, so pass a copy.
      extraction = await extractDocument(buffer.slice(), kind);
    } catch (error) {
      if (error instanceof ExtractionError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 422 },
        );
      }
      throw error;
    }

    const id = randomUUID();
    await saveUpload(id, kind, buffer);

    const record = await createDocument({
      id,
      ownerId: "local-user",
      name: file.name,
      kind,
      size: file.size,
      pages: extraction.pages,
      charCount: extraction.text.length,
      status: "uploaded",
      stage: "queued",
      createdAt: new Date().toISOString(),
      text: extraction.text,
    });

    return NextResponse.json({
      id: record.id,
      name: record.name,
      kind: record.kind,
      pages: record.pages,
      characters: record.charCount,
      size: record.size,
    });
  } catch (error) {
    console.error("[notewise] upload failed:", error);
    return NextResponse.json(
      {
        error:
          "The document could not be read. It may be corrupted or password protected.",
      },
      { status: 500 },
    );
  }
}
