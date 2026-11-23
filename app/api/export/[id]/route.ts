import { NextResponse } from "next/server";
import { getDocument } from "@/lib/db";
import { generateNotesPdf } from "@/lib/export-pdf";
import { titleFromFilename } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc?.study) {
    return NextResponse.json(
      { error: "No study material exists for this document yet." },
      { status: 404 },
    );
  }

  const mode = new URL(request.url).searchParams.get("mode");
  const isRevision = mode === "revision";

  const study = isRevision
    ? {
        ...doc.study,
        title: `${doc.study.title} — Revision sheet`,
        overview:
          "A condensed revision sheet: definitions, formulas, differences, mark-earning points and likely exam topics.",
        chapters: [],
        difficultConcepts: [],
        questions: [],
        learningObjectives: [],
      }
    : doc.study;

  const pdf = await generateNotesPdf(study);
  const base =
    titleFromFilename(doc.study.title)
      .replace(/[^\w\s.-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) || "notewise";
  const fileName = `${base}-${isRevision ? "revision" : "notes"}.pdf`;

  return new NextResponse(new Blob([new Uint8Array(pdf)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
