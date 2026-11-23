import { NextResponse } from "next/server";
import { getDocument, savePresentation, writeExport } from "@/lib/db";
import { generatePptx } from "@/lib/pptx";
import { buildDeck, THEMES } from "@/lib/slides";
import { aiJson, aiStatus } from "@/lib/ai";
import type { SlideOverride, SlideTheme, StudyMaterial } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { index?: number; theme?: SlideTheme };
    const index = body.index;

    if (typeof index !== "number" || index < 0) {
      return NextResponse.json({ error: "Invalid slide index." }, { status: 400 });
    }
    if (!aiStatus().configured) {
      return NextResponse.json(
        {
          error:
            "Regenerating a slide needs an AI model. Add an API key in Settings, or change the theme instead.",
        },
        { status: 400 },
      );
    }

    const doc = await getDocument(id);
    if (!doc?.study) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const deck = buildDeck(doc.study, doc.presentation?.slideOverrides);
    const slide = deck[index];
    if (!slide) {
      return NextResponse.json({ error: "That slide does not exist." }, { status: 404 });
    }

    const raw = await aiJson<{ title?: string; bullets?: string[] }>({
      system:
        "You are NoteWise AI, writing concise presentation slides for undergraduate students. Keep every fact, symbol and unit accurate. Return only JSON.",
      temperature: 0.6,
      maxTokens: 900,
      user: `Rewrite this presentation slide so it is clearer for students. Keep it short: a title of at most 9 words and 2-4 bullets of at most 18 words each. Do not invent facts.

SLIDE TITLE: ${slide.title}
SLIDE BODY: ${slide.body ?? ""}
CURRENT BULLETS:
${(slide.bullets ?? []).map((bullet) => `- ${bullet}`).join("\n")}

SOURCE MATERIAL:
${JSON.stringify(sliceStudy(doc.study)).slice(0, 6000)}

Return JSON: {"title": string, "bullets": string[]}`,
    });

    const override: SlideOverride = {
      title: typeof raw.title === "string" ? raw.title.trim() : slide.title,
      bullets: Array.isArray(raw.bullets)
        ? raw.bullets
            .filter((bullet): bullet is string => typeof bullet === "string")
            .map((bullet) => bullet.trim())
            .filter(Boolean)
            .slice(0, 5)
        : slide.bullets,
    };

    const overrides = {
      ...(doc.presentation?.slideOverrides ?? {}),
      [index]: override,
    };
    const theme: SlideTheme =
      body.theme && body.theme in THEMES
        ? body.theme
        : (doc.presentation?.theme ?? "modern-professional");

    const bytes = await generatePptx(doc.study, theme, overrides);
    const fileName = `notewise-${doc.id}-${theme}.pptx`;
    await writeExport(fileName, bytes);
    await savePresentation(doc.id, {
      theme,
      createdAt: new Date().toISOString(),
      file: fileName,
      slideOverrides: overrides,
    });

    return NextResponse.json({ ok: true, slide: override, overrides });
  } catch (error) {
    console.error("[notewise] slide regeneration failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The slide could not be regenerated.",
      },
      { status: 500 },
    );
  }
}

function sliceStudy(study: StudyMaterial) {
  return {
    title: study.title,
    chapters: study.chapters.map((chapter) => ({
      title: chapter.title,
      summary: chapter.summary,
      keyPoints: chapter.keyPoints,
      formulas: chapter.formulas,
    })),
    revision: { formulas: study.revision.formulas, keyPoints: study.revision.keyPoints },
  };
}
