import type { DocStatus, ProcessingStage } from "./types";

export const STAGE_ORDER: ProcessingStage[] = [
  "extracting",
  "organizing",
  "simplifying",
  "illustrating",
  "preparing",
  "done",
];

export const STAGE_LABELS: Record<ProcessingStage, string> = {
  queued: "Waiting to start",
  extracting: "Uploading and extracting content",
  organizing: "Identifying chapters, definitions and formulas",
  simplifying: "Simplifying difficult concepts",
  illustrating: "Generating visual explanations",
  preparing: "Preparing study material",
  done: "Ready",
};

export const STAGE_COPY: Record<ProcessingStage, string> = {
  queued: "Your file is stored locally and queued for analysis.",
  extracting: "Reading text, headings, slide notes and page references.",
  organizing: "Mapping the structure of the document before writing.",
  simplifying: "Rewriting hard sections in plain language, keeping the physics.",
  illustrating: "Building labelled diagrams from the concepts, not decoration.",
  preparing: "Assembling notes, questions, revision sheet and the deck.",
  done: "Everything is ready in the workspace.",
};

export const STATUS_LABELS: Record<DocStatus, string> = {
  uploaded: "Uploaded",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

export function statusTone(
  status: DocStatus,
): "accent" | "cyan" | "success" | "warn" | "danger" | "neutral" {
  switch (status) {
    case "ready":
      return "success";
    case "processing":
      return "cyan";
    case "uploaded":
      return "accent";
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
}

export function kindLabel(kind: "pdf" | "pptx") {
  return kind === "pdf" ? "PDF" : "PPTX";
}
