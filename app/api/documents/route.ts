import { NextResponse } from "next/server";
import { DEFAULT_OWNER, listDocuments } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const documents = await listDocuments(DEFAULT_OWNER);
  return NextResponse.json({
    documents: documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      kind: doc.kind,
      size: doc.size,
      pages: doc.pages,
      status: doc.status,
      stage: doc.stage,
      createdAt: doc.createdAt,
      processedAt: doc.processedAt,
      isSample: doc.isSample,
      title: doc.study?.title ?? doc.name,
      chapterCount: doc.study?.chapters.length ?? 0,
      hasStudy: Boolean(doc.study),
      hasPresentation: Boolean(doc.presentation),
      generatedBy: doc.study?.generatedBy,
    })),
  });
}
