import type { DiagramSpec, SlideOverride, SlideTheme, StudyMaterial } from "./types";

export interface ThemeDef {
  id: SlideTheme;
  name: string;
  description: string;
  background: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  secondary: string;
  font: string;
  headingFont: string;
  dark: boolean;
}

export const THEMES: Record<SlideTheme, ThemeDef> = {
  "minimal-academic": {
    id: "minimal-academic",
    name: "Minimal Academic",
    description: "Clean white pages with purple accents. Ideal for lectures.",
    background: "FFFFFF",
    surface: "F4F4F8",
    ink: "111827",
    muted: "6B7280",
    accent: "7C3AED",
    secondary: "2563EB",
    font: "Calibri",
    headingFont: "Georgia",
    dark: false,
  },
  "modern-professional": {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Deep navy with violet glows. Matches the app theme.",
    background: "0B0D17",
    surface: "161A2E",
    ink: "F8FAFC",
    muted: "94A3B8",
    accent: "8B5CF6",
    secondary: "38BDF8",
    font: "Segoe UI",
    headingFont: "Segoe UI Semibold",
    dark: true,
  },
  "colorful-educational": {
    id: "colorful-educational",
    name: "Colorful Educational",
    description: "Warm cream with orange and teal. Friendly for revision.",
    background: "FFF9F0",
    surface: "FFFFFF",
    ink: "1F2937",
    muted: "6B7280",
    accent: "EA580C",
    secondary: "0D9488",
    font: "Trebuchet MS",
    headingFont: "Trebuchet MS",
    dark: false,
  },
  "engineering-technical": {
    id: "engineering-technical",
    name: "Engineering Technical",
    description: "Graph-paper slate with cyan annotations and monospace data.",
    background: "0F172A",
    surface: "1E293B",
    ink: "E2E8F0",
    muted: "94A3B8",
    accent: "22D3EE",
    secondary: "A3E635",
    font: "Consolas",
    headingFont: "Consolas",
    dark: true,
  },
};

export const THEME_LIST = Object.values(THEMES);

export type SlideKind =
  | "title"
  | "agenda"
  | "chapter"
  | "concept"
  | "diagram"
  | "formulas"
  | "questions"
  | "revision"
  | "closing";

export interface DeckSlide {
  kind: SlideKind;
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  diagram?: DiagramSpec;
  footnote?: string;
}

export function buildDeck(study: StudyMaterial, overrides: Record<number, SlideOverride> = {}): DeckSlide[] {
  const slides: DeckSlide[] = [];

  slides.push({
    kind: "title",
    title: study.title,
    subtitle: study.subject,
    body: study.overview,
    footnote: "Generated with NoteWise AI",
  });

  slides.push({
    kind: "agenda",
    title: "What you will learn",
    bullets: study.chapters.map((chapter) => chapter.title).slice(0, 7),
    footnote: `${study.chapters.length} sections · ${study.diagrams.length} diagrams`,
  });

  for (const chapter of study.chapters.slice(0, 7)) {
    slides.push({
      kind: "chapter",
      title: chapter.title,
      body: chapter.summary,
      bullets: chapter.keyPoints.slice(0, 4),
      footnote: chapter.source,
    });
  }

  for (const concept of study.difficultConcepts.slice(0, 4)) {
    slides.push({
      kind: "concept",
      title: concept.title,
      subtitle: "Difficult concept, explained simply",
      body: concept.simpleExplanation,
      bullets: concept.steps.slice(0, 4),
      footnote: concept.sourceNote,
    });
  }

  for (const diagram of study.diagrams.slice(0, 4)) {
    slides.push({
      kind: "diagram",
      title: diagram.title,
      subtitle: diagram.caption,
      diagram,
    });
  }

  const formulas = study.revision.formulas.slice(0, 6);
  if (formulas.length > 0) {
    slides.push({
      kind: "formulas",
      title: "Formulas and relations",
      bullets: formulas.map((formula) => `${formula.expression} — ${formula.meaning}`),
      footnote: "Copy these into your revision sheet",
    });
  }

  if (study.questions.length > 0) {
    slides.push({
      kind: "questions",
      title: "Exam-style questions",
      bullets: study.questions
        .slice(0, 5)
        .map((question) => question.question),
      footnote: "Answers are in the NoteWise workspace",
    });
  }

  slides.push({
    kind: "revision",
    title: "Quick revision",
    bullets: study.revision.keyPoints.slice(0, 6),
    body:
      study.revision.definitions
        .slice(0, 3)
        .map((definition) => `${definition.term}: ${definition.definition}`)
        .join("\n") || undefined,
  });

  slides.push({
    kind: "closing",
    title: "Learn less complicated.",
    subtitle: "Understand more.",
    body: `Export the full notes and revision sheet from the NoteWise workspace.`,
    footnote: study.generatedBy === "ai" ? `AI: ${study.model ?? "model"}` : "Local analysis",
  });

  return slides.map((slide, index) => {
    const override = overrides[index];
    if (!override) return slide;
    return {
      ...slide,
      title: override.title?.trim() || slide.title,
      bullets: override.bullets && override.bullets.length > 0 ? override.bullets : slide.bullets,
    };
  });
}
