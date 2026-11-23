import { NextResponse } from "next/server";
import { deleteDocument, getDocument } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  return NextResponse.json({
    document: {
      id: doc.id,
      name: doc.name,
      status: doc.status,
      stage: doc.stage,
      error: doc.error,
      pages: doc.pages,
      charCount: doc.charCount,
      createdAt: doc.createdAt,
      processedAt: doc.processedAt,
      isSample: doc.isSample,
      hasStudy: Boolean(doc.study),
      hasPresentation: Boolean(doc.presentation),
      presentationTheme: doc.presentation?.theme,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const removed = await deleteDocument(id);
  if (!removed) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
