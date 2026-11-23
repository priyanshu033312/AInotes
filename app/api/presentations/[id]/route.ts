import { NextResponse } from "next/server";
import {
  exportFilePath,
  fileExists,
  getDocument,
  savePresentation,
  writeExport,
} from "@/lib/db";
import { generatePptx } from "@/lib/pptx";
import { THEMES } from "@/lib/slides";
import type { SlideTheme } from "@/lib/types";
import { titleFromFilename } from "@/lib/utils";
import { promises as fs } from "node:fs";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  if (!doc.study) {
    return NextResponse.json(
      { error: "No study material exists for this document yet." },
      { status: 409 },
    );
  }

  const url = new URL(request.url);
  const requested = url.searchParams.get("theme") as SlideTheme | null;
  const theme: SlideTheme =
    requested && requested in THEMES
      ? requested
      : (doc.presentation?.theme ?? "modern-professional");

  const fileName = `notewise-${doc.id}-${theme}.pptx`;
  const target = exportFilePath(fileName);

  if (!(await fileExists(target))) {
    const bytes = await generatePptx(
      doc.study,
      theme,
      doc.presentation?.slideOverrides,
    );
    await writeExport(fileName, bytes);
    await savePresentation(doc.id, {
      theme,
      createdAt: new Date().toISOString(),
      file: fileName,
      slideOverrides: doc.presentation?.slideOverrides,
    });
  }

  const data = await fs.readFile(target);
  const safeName = `${titleFromFilename(doc.study.title)
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || "notewise"}-${theme}.pptx`;

  return new NextResponse(new Blob([new Uint8Array(data)]), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    },
  });
}
