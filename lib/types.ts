export type DocKind = "pdf" | "pptx";
export type DocStatus = "uploaded" | "processing" | "ready" | "failed";

export type ProcessingStage =
  | "queued"
  | "extracting"
  | "organizing"
  | "simplifying"
  | "illustrating"
  | "preparing"
  | "done";

export type SlideTheme =
  | "minimal-academic"
  | "modern-professional"
  | "colorful-educational"
  | "engineering-technical";

export interface Definition {
  term: string;
  definition: string;
}

export interface Formula {
  expression: string;
  meaning: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  note?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DiagramSpec {
  type: "flow" | "mindmap" | "compare" | "block";
  title: string;
  caption?: string;
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  columns?: [string, string];
}

export interface StudyChapter {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  definitions: Definition[];
  formulas: Formula[];
  examples: string[];
  source?: string;
}

export interface DifficultConcept {
  id: string;
  title: string;
  simpleExplanation: string;
  steps: string[];
  example: string;
  analogy: string;
  sourceNote?: string;
  diagram?: DiagramSpec;
}

export interface QuestionItem {
  question: string;
  answer: string;
  marks?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface RevisionPack {
  definitions: Definition[];
  formulas: Formula[];
  keyPoints: string[];
  differences: { conceptA: string; conceptB: string; points: string[] }[];
  examTopics: string[];
}

export interface StudyMaterial {
  title: string;
  subject: string;
  overview: string;
  learningObjectives: string[];
  chapters: StudyChapter[];
  difficultConcepts: DifficultConcept[];
  diagrams: DiagramSpec[];
  questions: QuestionItem[];
  revision: RevisionPack;
  generatedBy: "ai" | "local";
  model?: string;
  warnings: string[];
  generatedAt: string;
}

export interface SlideOverride {
  title?: string;
  bullets?: string[];
}

export interface PresentationRecord {
  theme: SlideTheme;
  createdAt: string;
  file: string;
  slideOverrides?: Record<number, SlideOverride>;
}

export interface DocumentRecord {
  id: string;
  ownerId: string;
  name: string;
  kind: DocKind;
  size: number;
  pages: number;
  charCount: number;
  status: DocStatus;
  stage: ProcessingStage;
  error?: string;
  createdAt: string;
  processedAt?: string;
  isSample?: boolean;
  textPreview: string;
  study?: StudyMaterial;
  presentation?: PresentationRecord;
}

export interface AskMessage {
  role: "user" | "assistant";
  content: string;
  mode?: "ai" | "local";
  at?: string;
}

export type StudyTab =
  | "notes"
  | "original"
  | "visual"
  | "revision"
  | "questions";
