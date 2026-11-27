import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { StudyMaterial } from "./types";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COLOR = {
  ink: rgb(0.09, 0.11, 0.16),
  muted: rgb(0.42, 0.45, 0.52),
  accent: rgb(0.49, 0.36, 0.96),
  secondary: rgb(0.13, 0.55, 0.9),
  line: rgb(0.88, 0.89, 0.93),
  panel: rgb(0.965, 0.966, 0.98),
};

const REPLACEMENTS: [RegExp, string][] = [
  [/[“”„]/g, '"'],
  [/[‘’‚]/g, "'"],
  [/[–—−]/g, "-"],
  [/…/g, "..."],
  [/Δ/g, "Delta "],
  [/δ/g, "delta "],
  [/ε/g, "epsilon "],
  [/η/g, "eta "],
  [/λ/g, "lambda "],
  [/μ/g, "mu "],
  [/ρ/g, "rho "],
  [/σ/g, "sigma "],
  [/Σ/g, "Sum "],
  [/∑/g, "Sum "],
  [/∫/g, "Integral "],
  [/√/g, "sqrt"],
  [/≈/g, "~="],
  [/≤/g, "<="],
  [/≥/g, ">="],
  [/≠/g, "!="],
  [/±/g, "+/-"],
  [/×/g, "x"],
  [/÷/g, "/"],
  [/→/g, "->"],
  [/←/g, "<-"],
  [/↔/g, "<->"],
  [/∞/g, "inf"],
  [/·/g, "-"],
  [/•/g, "-"],
  [/°/g, " deg"],
  [/²/g, "^2"],
  [/³/g, "^3"],
  [/⁻/g, "-"],
  [/₁/g, "1"],
  [/₂/g, "2"],
  [/θ/g, "theta "],
  [/φ/g, "phi "],
  [/ω/g, "omega "],
  [/α/g, "alpha "],
  [/β/g, "beta "],
  [/⁄/g, "/"],
];

function sanitize(value: string): string {
  let text = value;
  for (const [pattern, replacement] of REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  // Drop anything outside the printable WinAnsi range.
  return text.replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = sanitize(text).replace(/\s+/g, " ").split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

class Writer {
  pdf!: PDFDocument;
  page!: PDFPage;
  y = 0;
  regular!: PDFFont;
  bold!: PDFFont;

  async init() {
    this.pdf = await PDFDocument.create();
    this.regular = await this.pdf.embedFont(StandardFonts.Helvetica);
    this.bold = await this.pdf.embedFont(StandardFonts.HelveticaBold);
    this.newPage();
  }

  newPage() {
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.page.drawRectangle({
      x: 0,
      y: PAGE_H - 8,
      width: PAGE_W,
      height: 8,
      color: COLOR.accent,
    });
    this.y = PAGE_H - MARGIN;
  }

  ensure(space: number) {
    if (this.y - space < MARGIN + 30) this.newPage();
  }

  text(
    value: string,
    options: {
      size?: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
      gap?: number;
      indent?: number;
      lineGap?: number;
    } = {},
  ) {
    const size = options.size ?? 10;
    const font = options.bold ? this.bold : this.regular;
    const color = options.color ?? COLOR.ink;
    const indent = options.indent ?? 0;
    const lineHeight = size * 1.42;
    const lines = wrap(value, font, size, CONTENT_W - indent);
    for (const line of lines) {
      this.ensure(lineHeight);
      this.page.drawText(line, {
        x: MARGIN + indent,
        y: this.y - size,
        size,
        font,
        color,
      });
      this.y -= lineHeight;
    }
    this.y -= options.gap ?? 4;
  }

  heading(value: string, size = 15) {
    this.ensure(size * 2.6);
    this.y -= 8;
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - 3,
      width: 26,
      height: 3,
      color: COLOR.accent,
    });
    this.y -= 10;
    this.text(value, { size, bold: true, gap: 6 });
  }

  bullets(items: string[], options: { size?: number; marker?: string } = {}) {
    const size = options.size ?? 10;
    for (const item of items) {
      this.text(`${options.marker ?? "•"} ${item}`, {
        size,
        indent: 10,
        gap: 2,
      });
    }
  }

  divider() {
    this.ensure(18);
    this.y -= 8;
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_W - MARGIN, y: this.y },
      thickness: 0.6,
      color: COLOR.line,
    });
    this.y -= 10;
  }

  panel(content: () => void) {
    const startY = this.y + 6;
    content();
    const height = startY - this.y;
    if (height <= 0) return;
  }

  async finish(): Promise<Uint8Array> {
    const pages = this.pdf.getPages();
    pages.forEach((page, index) => {
      page.drawText(`NoteWise AI  ·  Page ${index + 1} of ${pages.length}`, {
        x: MARGIN,
        y: 26,
        size: 8,
        font: this.regular,
        color: COLOR.muted,
      });
    });
    this.pdf.setTitle("NoteWise AI study notes");
    this.pdf.setCreator("NoteWise AI");
    return this.pdf.save();
  }
}

export async function generateNotesPdf(study: StudyMaterial): Promise<Uint8Array> {
  const writer = new Writer();
  await writer.init();

  writer.text("NOTEWISE AI", {
    size: 9,
    bold: true,
    color: COLOR.accent,
  });
  writer.text(study.title, { size: 24, bold: true, gap: 2 });
  writer.text(study.subject, { size: 11, color: COLOR.secondary, gap: 10 });
  writer.text(
    `Generated ${
      study.generatedBy === "ai" ? `with ${study.model ?? "an AI model"}` : "by local analysis"
    } · ${new Date(study.generatedAt).toLocaleDateString()}`,
    { size: 8.5, color: COLOR.muted, gap: 12 },
  );

  writer.heading("Overview", 13);
  writer.text(study.overview, { size: 10, gap: 8 });

  if (study.learningObjectives.length > 0) {
    writer.heading("Learning objectives", 13);
    writer.bullets(study.learningObjectives);
    writer.y -= 4;
  }

  if (study.warnings.length > 0) {
    writer.ensure(40);
    for (const warning of study.warnings) {
      writer.text(`Note: ${warning}`, {
        size: 8.5,
        color: COLOR.muted,
        indent: 4,
        gap: 3,
      });
    }
    writer.divider();
  }

  for (const chapter of study.chapters) {
    writer.heading(chapter.title, 14);
    if (chapter.summary) writer.text(chapter.summary, { size: 10, gap: 6 });

    if (chapter.explanation) {
      for (const paragraph of chapter.explanation.split(/\n{2,}/)) {
        if (paragraph.trim()) writer.text(paragraph.trim(), { size: 10, gap: 5 });
      }
    }

    if (chapter.keyPoints.length > 0) {
      writer.text("Key points", { size: 9.5, bold: true, color: COLOR.secondary, gap: 3 });
      writer.bullets(chapter.keyPoints, { size: 9.5 });
      writer.y -= 3;
    }

    if (chapter.definitions.length > 0) {
      writer.text("Definitions", { size: 9.5, bold: true, color: COLOR.secondary, gap: 3 });
      for (const definition of chapter.definitions) {
        writer.text(`${definition.term}: ${definition.definition}`, {
          size: 9.5,
          indent: 8,
          gap: 2,
        });
      }
      writer.y -= 3;
    }

    if (chapter.formulas.length > 0) {
      writer.text("Formulas", { size: 9.5, bold: true, color: COLOR.secondary, gap: 3 });
      for (const formula of chapter.formulas) {
        writer.text(`${formula.expression}  —  ${formula.meaning}`, {
          size: 9.5,
          indent: 8,
          gap: 2,
        });
      }
    }

    if (chapter.derivations && chapter.derivations.length > 0) {
      writer.text("Derivations", { size: 9.5, bold: true, color: COLOR.secondary, gap: 3 });
      for (const derivation of chapter.derivations) {
        writer.text(derivation.title, { size: 9.5, bold: true, indent: 8, gap: 2 });
        derivation.steps.forEach((step, index) => {
          writer.text(`${index + 1}. ${step}`, { size: 9.5, indent: 16, gap: 2 });
        });
        if (derivation.result) {
          writer.text(`Result: ${derivation.result}`, { size: 9.5, indent: 8, gap: 3 });
        }
      }
    }

    if (chapter.workedExamples && chapter.workedExamples.length > 0) {
      writer.text("Solved examples", { size: 9.5, bold: true, color: COLOR.secondary, gap: 3 });
      chapter.workedExamples.forEach((example, index) => {
        writer.text(`Q${index + 1}. ${example.question}`, { size: 9.5, indent: 8, gap: 2 });
        writer.text(example.solution, { size: 9.5, indent: 16, gap: 3 });
      });
    }

    if (chapter.commonMistakes && chapter.commonMistakes.length > 0) {
      writer.text("Common mistakes", { size: 9.5, bold: true, color: COLOR.secondary, gap: 3 });
      writer.bullets(chapter.commonMistakes, { size: 9.5 });
    }

    if (chapter.examTips && chapter.examTips.length > 0) {
      writer.text("Exam tips", { size: 9.5, bold: true, color: COLOR.secondary, gap: 3 });
      writer.bullets(chapter.examTips, { size: 9.5 });
    }

    if (chapter.source) {
      writer.text(chapter.source, { size: 8, color: COLOR.muted, gap: 2 });
    }
    writer.divider();
  }

  if (study.difficultConcepts.length > 0) {
    writer.newPage();
    writer.text("Difficult concepts, explained simply", {
      size: 18,
      bold: true,
      gap: 10,
    });
    for (const concept of study.difficultConcepts) {
      writer.heading(concept.title, 13);
      writer.text(concept.simpleExplanation, { size: 10, gap: 4 });
      if (concept.steps.length > 0) {
        writer.text("Step by step", { size: 9.5, bold: true, color: COLOR.secondary, gap: 3 });
        concept.steps.forEach((step, index) => {
          writer.text(`${index + 1}. ${step}`, { size: 9.5, indent: 8, gap: 2 });
        });
      }
      if (concept.example) {
        writer.text(`Example: ${concept.example}`, { size: 9.5, bold: false, gap: 3 });
      }
      if (concept.analogy) {
        writer.text(`Analogy: ${concept.analogy}`, {
          size: 9.5,
          color: COLOR.muted,
          gap: 3,
        });
      }
      if (concept.sourceNote) {
        writer.text(concept.sourceNote, {
          size: 8,
          color: COLOR.muted,
          gap: 3,
        });
      }
      writer.divider();
    }
  }

  writer.newPage();
  writer.text("Quick revision sheet", { size: 18, bold: true, gap: 10 });

  if (study.revision.definitions.length > 0) {
    writer.heading("Definitions to memorise", 12);
    for (const definition of study.revision.definitions) {
      writer.text(`• ${definition.term}: ${definition.definition}`, {
        size: 9.5,
        indent: 6,
        gap: 2,
      });
    }
  }

  if (study.revision.formulas.length > 0) {
    writer.heading("Formulas", 12);
    for (const formula of study.revision.formulas) {
      writer.text(`• ${formula.expression} — ${formula.meaning}`, {
        size: 9.5,
        indent: 6,
        gap: 2,
      });
    }
  }

  if (study.revision.keyPoints.length > 0) {
    writer.heading("Points that earn marks", 12);
    writer.bullets(study.revision.keyPoints, { size: 9.5 });
  }

  for (const difference of study.revision.differences) {
    writer.heading(`${difference.conceptA} vs ${difference.conceptB}`, 12);
    writer.bullets(difference.points, { size: 9.5 });
  }

  if (study.revision.examTopics.length > 0) {
    writer.heading("Likely exam topics", 12);
    writer.bullets(study.revision.examTopics, { size: 9.5 });
  }

  if (study.questions.length > 0) {
    writer.heading("Practice questions", 12);
    study.questions.forEach((question, index) => {
      writer.text(
        `${index + 1}. ${question.question}${
          question.marks ? `  (${question.marks} marks)` : ""
        }`,
        { size: 9.5, gap: 2 },
      );
    });
  }

  return writer.finish();
}
