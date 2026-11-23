import JSZip from "jszip";
import type { DocumentRecord } from "./types";

export class ExtractionError extends Error {
  code: "SCANNED_PDF" | "CORRUPT_FILE" | "EMPTY_DOCUMENT" | "UNSUPPORTED";
  constructor(code: ExtractionError["code"], message: string) {
    super(message);
    this.code = code;
    this.name = "ExtractionError";
  }
}

export interface ExtractionResult {
  text: string;
  pages: number;
  preview: string;
  notes?: string[];
}

const decodeXml = (value: string) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&");

export function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00ad\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractPdf(data: Uint8Array): Promise<ExtractionResult> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  let pdf;
  try {
    pdf = await getDocumentProxy(data);
  } catch (error) {
    throw new ExtractionError(
      "CORRUPT_FILE",
      `The PDF could not be opened. It may be corrupted or password protected. (${
        (error as Error).message
      })`,
    );
  }

  const { totalPages, text } = (await extractText(pdf, {
    mergePages: false,
  })) as { totalPages: number; text: string[] };

  const perPage = text.map((page) => normalizeText(page));
  const joined = perPage
    .map((page, index) => `--- Page ${index + 1} ---\n${page}`)
    .join("\n\n");

  const usableCharacters = joined.replace(/--- Page \d+ ---/g, "").replace(/\s/g, "").length;
  if (usableCharacters < 40) {
    throw new ExtractionError(
      "SCANNED_PDF",
      "No selectable text was found. This looks like a scanned PDF — OCR is required. Convert it with a text layer (e.g. re-export from Word or run OCR) and upload again.",
    );
  }

  return {
    text: joined,
    pages: totalPages,
    preview: joined.slice(0, 1200),
  };
}

export async function extractPptx(data: Uint8Array): Promise<ExtractionResult> {
  const zip = await JSZip.loadAsync(data).catch(() => {
    throw new ExtractionError(
      "CORRUPT_FILE",
      "The presentation could not be opened. Only modern .pptx files are supported.",
    );
  });

  const slideEntries = Object.keys(zip.files).filter((name) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(name),
  );
  if (slideEntries.length === 0) {
    throw new ExtractionError(
      "UNSUPPORTED",
      "No slides were found inside this file. It may be a legacy .ppt in disguise — save it as .pptx and try again.",
    );
  }

  const sorted = slideEntries
    .map((name) => ({
      name,
      index: Number(name.match(/slide(\d+)\.xml$/)?.[1] ?? 0),
    }))
    .sort((a, b) => a.index - b.index);

  const notes: string[] = [];
  const slides: { index: number; title: string; lines: string[] }[] = [];

  for (const entry of sorted) {
    const xml = await zip.files[entry.name].async("string");
    const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((match) =>
      decodeXml(match[1]).replace(/\s+/g, " ").trim(),
    );
    const lines = runs.filter((line) => line.length > 0);
    slides.push({
      index: entry.index,
      title: lines[0] ?? `Slide ${entry.index}`,
      lines,
    });

    // Notes are optional and referenced through the slide's relationship file.
    const relPath = `ppt/slides/_rels/slide${entry.index}.xml.rels`;
    const relFile = zip.files[relPath];
    if (relFile) {
      const rels = await relFile.async("string");
      const notesTarget = rels.match(
        /Target="\.\.\/notesSlides\/(notesSlide\d+\.xml)"/,
      )?.[1];
      if (notesTarget) {
        const notesFile = zip.files[`ppt/notesSlides/${notesTarget}`];
        if (notesFile) {
          const notesXml = await notesFile.async("string");
          const noteText = [
            ...notesXml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g),
          ]
            .map((m) => decodeXml(m[1]).trim())
            .filter((line) => line.length > 0 && !/^\d+$/.test(line))
            .join(" ");
          if (noteText) notes.push(`Slide ${entry.index} — ${noteText}`);
        }
      }
    }
  }

  const text = slides
    .map(
      (slide) =>
        `--- Slide ${slide.index} ---\n${slide.lines.join("\n")}`,
    )
    .join("\n\n");

  if (text.replace(/--- Slide \d+ ---/g, "").replace(/\s/g, "").length < 20) {
    throw new ExtractionError(
      "EMPTY_DOCUMENT",
      "The presentation contains almost no readable text — the slides may be images only.",
    );
  }

  return {
    text: normalizeText(text),
    pages: slides.length,
    preview: text.slice(0, 1200),
    notes,
  };
}

export async function extractDocument(
  buffer: Uint8Array,
  kind: DocumentRecord["kind"],
): Promise<ExtractionResult> {
  if (kind === "pdf") return extractPdf(buffer);
  return extractPptx(buffer);
}
