import { NextResponse } from "next/server";
import { getDocument, updateDocument } from "@/lib/db";
import { regenerateConcept } from "@/lib/study";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { conceptId?: string };
    if (!body.conceptId) {
      return NextResponse.json({ error: "Missing concept id." }, { status: 400 });
    }

    const doc = await getDocument(id);
    if (!doc?.study) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const concept = doc.study.difficultConcepts.find(
      (item) => item.id === body.conceptId,
    );
    if (!concept) {
      return NextResponse.json({ error: "Concept not found." }, { status: 404 });
    }

    const regenerated = await regenerateConcept(doc, concept.title);
    const updated = {
      ...regenerated,
      id: concept.id,
    };

    const study = {
      ...doc.study,
      difficultConcepts: doc.study.difficultConcepts.map((item) =>
        item.id === concept.id ? updated : item,
      ),
      generatedAt: new Date().toISOString(),
    };

    await updateDocument(doc.id, { study });
    return NextResponse.json({ ok: true, concept: updated });
  } catch (error) {
    console.error("[notewise] concept regeneration failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The explanation could not be regenerated.",
      },
      { status: 500 },
    );
  }
}
