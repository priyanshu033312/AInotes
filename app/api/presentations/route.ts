import { NextResponse } from "next/server";
import { getDocument, savePresentation, writeExport } from "@/lib/db";
import { generatePptx } from "@/lib/pptx";
import { THEMES } from "@/lib/slides";
import type { SlideTheme } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; theme?: SlideTheme };
    if (!body.id) {
      return NextResponse.json({ error: "Missing document id." }, { status: 400 });
    }
    const theme: SlideTheme =
      body.theme && body.theme in THEMES ? body.theme : "modern-professional";

    const doc = await getDocument(body.id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }
    if (!doc.study) {
      return NextResponse.json(
        { error: "Generate study material before creating a presentation." },
        { status: 409 },
      );
    }

    const bytes = await generatePptx(
      doc.study,
      theme,
      doc.presentation?.slideOverrides,
    );
    const fileName = `notewise-${doc.id}-${theme}.pptx`;
    await writeExport(fileName, bytes);
    await savePresentation(doc.id, {
      theme,
      createdAt: new Date().toISOString(),
      file: fileName,
      slideOverrides: doc.presentation?.slideOverrides,
    });

    return NextResponse.json({
      ok: true,
      theme,
      fileName,
      size: bytes.byteLength,
      downloadUrl: `/api/presentations/${doc.id}?theme=${theme}`,
    });
  } catch (error) {
    console.error("[notewise] presentation generation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The presentation could not be generated.",
      },
      { status: 500 },
    );
  }
}
