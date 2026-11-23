import type {
  DiagramEdge,
  DiagramNode,
  DiagramSpec,
  DocumentRecord,
  DifficultConcept,
  QuestionItem,
  StudyChapter,
  StudyMaterial,
} from "./types";
import { aiJson, aiModelLabel, aiStatus, aiText } from "./ai";
import { buildLocalStudyMaterial } from "./local";
import { titleFromFilename, truncate } from "./utils";

const SYSTEM_PROMPT = `You are NoteWise AI, an experienced engineering and science teacher who prepares study material for undergraduate students.

Rules you must follow:
1. Never simply shorten the source text. Restructure it into clear learning material.
2. Explain difficult concepts in simple language, but keep every technical term, symbol, unit and equation accurate.
3. Break complicated explanations into small numbered steps.
4. Use concrete examples and analogies — clearly separate them from source facts.
5. Diagrams must explain the actual concept, with accurate labels and connections. Never produce decorative or meaningless diagrams.
6. Preserve all important technical information from the source.
7. Never fabricate formulas, values, page numbers or facts. If something is missing, say so in "warnings".
8. Preserve the chapter and topic structure of the source document.
9. The output must be useful for examination preparation.
10. Return ONLY valid JSON. No markdown, no commentary, no code fences.`;

const SCHEMA_HINT = `Return JSON with exactly this shape:
{
  "title": string,
  "subject": string,
  "overview": string,
  "learningObjectives": string[],
  "chapters": [{
    "title": string,
    "summary": string,
    "keyPoints": string[],
    "definitions": [{ "term": string, "definition": string }],
    "formulas": [{ "expression": string, "meaning": string }],
    "examples": string[],
    "source": string
  }],
  "difficultConcepts": [{
    "title": string,
    "simpleExplanation": string,
    "steps": string[],
    "example": string,
    "analogy": string,
    "sourceNote": string,
    "diagram": {
      "type": "flow" | "mindmap" | "compare" | "block",
      "title": string,
      "caption": string,
      "nodes": [{ "id": string, "label": string, "note": string }],
      "edges": [{ "from": string, "to": string, "label": string }],
      "columns": [string, string]
    }
  }],
  "diagrams": [ same diagram object ],
  "questions": [{ "question": string, "answer": string, "marks": number, "difficulty": "easy" | "medium" | "hard" }],
  "revision": {
    "definitions": [{ "term": string, "definition": string }],
    "formulas": [{ "expression": string, "meaning": string }],
    "keyPoints": string[],
    "differences": [{ "conceptA": string, "conceptB": string, "points": string[] }],
    "examTopics": string[]
  },
  "warnings": string[]
}

Diagram rules:
- "flow" is a left-to-right process chain; "block" is a system/components chain; "mindmap" radiates from node id "root"; "compare" always has exactly two columns and its nodes belong to those columns.
- Every edge must reference node ids that exist. Use 3-7 nodes per diagram, short labels (max 42 characters).
- Give each chapter at least one formula only if the source actually contains it.
- 3 to 5 difficult concepts, each with one diagram. 6 to 10 exam questions.`;

function chunkText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if ((current + paragraph).length > maxChars && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current += (current ? "\n\n" : "") + paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 8);
}

interface DigestEntry {
  title: string;
  summary: string;
  keyPoints: string[];
  definitions: { term: string; definition: string }[];
  formulas: { expression: string; meaning: string }[];
}

async function digestChunk(chunk: string, index: number, total: number) {
  return aiJson<{ entries?: DigestEntry[] }>({
    system: SYSTEM_PROMPT,
    temperature: 0.2,
    maxTokens: 3000,
    user: `Read part ${index + 1} of ${total} of an academic document and condense it without losing technical facts.

Extract every section you find into an entry. For each entry give: the section title, a faithful summary (max 120 words), 3-6 key points, all definitions, and all formulas with their meaning and units.

${chunk}

Return JSON: {"entries":[{"title":string,"summary":string,"keyPoints":string[],"definitions":[{"term":string,"definition":string}],"formulas":[{"expression":string,"meaning":string}]}]}`,
  });
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown, limit = 12): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeDiagram(raw: unknown, fallbackTitle: string): DiagramSpec | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const source = raw as Record<string, unknown>;
  const type = ["flow", "mindmap", "compare", "block"].includes(String(source.type))
    ? (source.type as DiagramSpec["type"])
    : "flow";

  const rawNodes = Array.isArray(source.nodes) ? source.nodes : [];
  const nodes: DiagramNode[] = rawNodes
    .slice(0, 12)
    .map((node, index) => {
      const item = (node ?? {}) as Record<string, unknown>;
      const label = asString(item.label) || asString(item.title);
      if (!label) return null;
      return {
        id: asString(item.id, `n${index + 1}`),
        label: truncate(label, 60),
        note: asString(item.note) || undefined,
      } satisfies DiagramNode;
    })
    .filter((node): node is DiagramNode => Boolean(node));

  if (nodes.length < 2) return undefined;
  const ids = new Set(nodes.map((node) => node.id));
  const edges: DiagramEdge[] = (Array.isArray(source.edges) ? source.edges : [])
    .map((edge) => (edge ?? {}) as Record<string, unknown>)
    .map((edge) => ({
      from: asString(edge.from),
      to: asString(edge.to),
      label: asString(edge.label) || undefined,
    }))
    .filter((edge) => ids.has(edge.from) && ids.has(edge.to) && edge.from !== edge.to)
    .slice(0, 16);

  const columns = Array.isArray(source.columns)
    ? source.columns.map((column) => asString(column)).filter(Boolean)
    : [];

  return {
    type: type === "compare" && columns.length < 2 ? "block" : type,
    title: asString(source.title, fallbackTitle),
    caption: asString(source.caption) || undefined,
    nodes,
    edges,
    columns:
      columns.length >= 2 ? [columns[0], columns[1]] : undefined,
  };
}

function normalizeChapters(value: unknown): StudyChapter[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 12)
    .map((chapter, index) => {
      const item = (chapter ?? {}) as Record<string, unknown>;
      const definitions = (Array.isArray(item.definitions) ? item.definitions : [])
        .map((entry) => (entry ?? {}) as Record<string, unknown>)
        .map((entry) => ({
          term: asString(entry.term),
          definition: asString(entry.definition),
        }))
        .filter((entry) => entry.term && entry.definition)
        .slice(0, 8);
      const formulas = (Array.isArray(item.formulas) ? item.formulas : [])
        .map((entry) => (entry ?? {}) as Record<string, unknown>)
        .map((entry) => ({
          expression: asString(entry.expression),
          meaning: asString(entry.meaning),
        }))
        .filter((entry) => entry.expression)
        .slice(0, 8);
      return {
        id: `ch-${index + 1}`,
        title: asString(item.title, `Section ${index + 1}`),
        summary: asString(item.summary, "No summary was produced for this section."),
        keyPoints: asStringArray(item.keyPoints, 8),
        definitions,
        formulas,
        examples: asStringArray(item.examples, 4),
        source: asString(item.source) || undefined,
      } satisfies StudyChapter;
    })
    .filter((chapter) => chapter.title);
}

function normalizeConcepts(value: unknown): DifficultConcept[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 8)
    .map((concept, index) => {
      const item = (concept ?? {}) as Record<string, unknown>;
      return {
        id: `dc-${index + 1}`,
        title: asString(item.title, `Concept ${index + 1}`),
        simpleExplanation: asString(item.simpleExplanation),
        steps: asStringArray(item.steps, 10),
        example: asString(item.example),
        analogy: asString(item.analogy),
        sourceNote: asString(item.sourceNote) || undefined,
        diagram: normalizeDiagram(item.diagram, asString(item.title, "Concept diagram")),
      } satisfies DifficultConcept;
    })
    .filter((concept) => concept.title && concept.simpleExplanation);
}

function normalizeQuestions(value: unknown): QuestionItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 14)
    .map((question) => {
      const item = (question ?? {}) as Record<string, unknown>;
      const difficulty = ["easy", "medium", "hard"].includes(String(item.difficulty))
        ? (item.difficulty as QuestionItem["difficulty"])
        : "medium";
      return {
        question: asString(item.question),
        answer: asString(item.answer),
        marks: typeof item.marks === "number" && item.marks > 0 ? Math.round(item.marks) : undefined,
        difficulty,
      } satisfies QuestionItem;
    })
    .filter((item) => item.question && item.answer);
}

function normalizeStudy(raw: unknown, doc: DocumentRecord): StudyMaterial {
  const data = (raw ?? {}) as Record<string, unknown>;
  const revisionRaw = (data.revision ?? {}) as Record<string, unknown>;

  const chapters = normalizeChapters(data.chapters);
  if (chapters.length === 0) {
    throw new Error("The AI returned no chapters for this document.");
  }

  const diagrams = (Array.isArray(data.diagrams) ? data.diagrams : [])
    .map((diagram, index) =>
      normalizeDiagram(diagram, `Diagram ${index + 1}`),
    )
    .filter((diagram): diagram is DiagramSpec => Boolean(diagram))
    .slice(0, 6);

  const conceptDiagrams = normalizeConcepts(data.difficultConcepts)
    .map((concept) => concept.diagram)
    .filter((diagram): diagram is DiagramSpec => Boolean(diagram));

  const definitions = (Array.isArray(revisionRaw.definitions) ? revisionRaw.definitions : [])
    .map((entry) => (entry ?? {}) as Record<string, unknown>)
    .map((entry) => ({ term: asString(entry.term), definition: asString(entry.definition) }))
    .filter((entry) => entry.term && entry.definition)
    .slice(0, 20);

  const formulas = (Array.isArray(revisionRaw.formulas) ? revisionRaw.formulas : [])
    .map((entry) => (entry ?? {}) as Record<string, unknown>)
    .map((entry) => ({ expression: asString(entry.expression), meaning: asString(entry.meaning) }))
    .filter((entry) => entry.expression)
    .slice(0, 20);

  return {
    title: asString(data.title, titleFromFilename(doc.name)),
    subject: asString(data.subject, "Uploaded document"),
    overview: asString(data.overview, chapters[0].summary),
    learningObjectives: asStringArray(data.learningObjectives, 8),
    chapters,
    difficultConcepts: normalizeConcepts(data.difficultConcepts),
    diagrams: [...diagrams, ...conceptDiagrams].slice(0, 8),
    questions: normalizeQuestions(data.questions),
    revision: {
      definitions:
        definitions.length > 0
          ? definitions
          : chapters.flatMap((chapter) => chapter.definitions).slice(0, 15),
      formulas:
        formulas.length > 0
          ? formulas
          : chapters.flatMap((chapter) => chapter.formulas).slice(0, 15),
      keyPoints:
        asStringArray(revisionRaw.keyPoints, 12).length > 0
          ? asStringArray(revisionRaw.keyPoints, 12)
          : chapters.flatMap((chapter) => chapter.keyPoints).slice(0, 10),
      differences: (Array.isArray(revisionRaw.differences) ? revisionRaw.differences : [])
        .map((entry) => (entry ?? {}) as Record<string, unknown>)
        .map((entry) => ({
          conceptA: asString(entry.conceptA),
          conceptB: asString(entry.conceptB),
          points: asStringArray(entry.points, 8),
        }))
        .filter((entry) => entry.conceptA && entry.conceptB)
        .slice(0, 6),
      examTopics: asStringArray(revisionRaw.examTopics, 12),
    },
    generatedBy: "ai",
    model: aiModelLabel(),
    warnings: asStringArray(data.warnings, 8),
    generatedAt: new Date().toISOString(),
  };
}

export interface GenerationResult {
  study: StudyMaterial;
  aiError?: string;
}

export async function generateStudyMaterial(
  doc: DocumentRecord,
  onStage?: (stage: "organizing" | "simplifying" | "illustrating") => Promise<void> | void,
): Promise<GenerationResult> {
  const status = aiStatus();
  if (!status.configured) {
    return { study: buildLocalStudyMaterial(doc.name, doc.textPreview) };
  }

  try {
    await onStage?.("organizing");
    const chunks = chunkText(doc.textPreview, 26_000);
    let digest = "";

    if (chunks.length > 1) {
      const entries: DigestEntry[] = [];
      for (let index = 0; index < chunks.length; index += 1) {
        const result = await digestChunk(chunks[index], index, chunks.length);
        if (Array.isArray(result.entries)) entries.push(...result.entries);
      }
      digest = entries
        .slice(0, 30)
        .map(
          (entry) =>
            `## ${entry.title}\n${entry.summary}\nKey points: ${entry.keyPoints.join("; ")}\nDefinitions: ${entry.definitions
              .map((definition) => `${definition.term}: ${definition.definition}`)
              .join(" | ")}\nFormulas: ${entry.formulas
              .map((formula) => `${formula.expression} (${formula.meaning})`)
              .join(" | ")}`,
        )
        .join("\n\n");
    }

    await onStage?.("simplifying");
    const sourceBlock = digest
      ? `CONDENSED SECTION DIGEST (built from the full document):\n${digest}`
      : `SOURCE DOCUMENT TEXT:\n${doc.textPreview}`;

    const raw = await aiJson<unknown>({
      system: SYSTEM_PROMPT,
      temperature: 0.4,
      maxTokens: 7000,
      user: `Document name: ${doc.name}
Document type: ${doc.kind.toUpperCase()} with ${doc.pages} ${doc.kind === "pdf" ? "pages" : "slides"}

${sourceBlock}

${SCHEMA_HINT}

Write for an undergraduate preparing for examinations. Keep the document's own chapter structure and technical vocabulary. Explain, do not merely shorten.`,
    });

    await onStage?.("illustrating");
    const study = normalizeStudy(raw, doc);
    return { study };
  } catch (error) {
    const message = (error as Error).message;
    console.error("[notewise] AI generation failed:", message);
    const local = buildLocalStudyMaterial(doc.name, doc.textPreview);
    return {
      aiError: message,
      study: {
        ...local,
        warnings: [
          `The AI provider failed: ${message}`,
          "Falling back to local rule-based extraction so your document is still usable. Check your API key and quota, then process the document again.",
          ...local.warnings.slice(1),
        ],
      },
    };
  }
}

function relevantExcerpt(text: string, question: string, maxChars = 9000) {
  const keywords = question
    .toLowerCase()
    .match(/[a-z]{4,}/g)
    ?.filter((word) => !["what", "which", "when", "does", "explain", "about", "this", "that", "with"].includes(word));

  if (!keywords || keywords.length === 0) return text.slice(0, maxChars);

  const blocks = text.split(/\n{2,}/);
  const scored = blocks
    .map((block) => {
      const lower = block.toLowerCase();
      const score = keywords.reduce(
        (total, keyword) => total + (lower.includes(keyword) ? 1 : 0),
        0,
      );
      return { block, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return text.slice(0, maxChars);
  return scored
    .slice(0, 12)
    .map((item) => item.block)
    .join("\n\n")
    .slice(0, maxChars);
}

export interface AskResult {
  answer: string;
  mode: "ai" | "local";
}

export async function askDocument(
  doc: DocumentRecord,
  question: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
): Promise<AskResult> {
  const status = aiStatus();
  if (status.configured) {
    const conversation = history
      .slice(-6)
      .map((message) => `${message.role === "user" ? "Student" : "NoteWise"}: ${message.content}`)
      .join("\n");

    const answer = await aiText({
      system: `${SYSTEM_PROMPT}

You are now in chat mode. Answer the student's question using ONLY the supplied document excerpt. If the excerpt does not contain the answer, say so plainly and suggest what to check in the original document. Keep answers short, use bullet points for steps, and never invent numbers.`,
      temperature: 0.3,
      maxTokens: 1500,
      user: `DOCUMENT: ${doc.name}
${conversation ? `PREVIOUS CONVERSATION:\n${conversation}\n` : ""}
DOCUMENT EXCERPT:
${relevantExcerpt(doc.textPreview, question)}

STUDENT QUESTION: ${question}`,
    });
    return { answer: answer.trim(), mode: "ai" };
  }

  // Local mode: return the closest sentences from the source, clearly labelled.
  const sentences = doc.textPreview
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30);
  const keywords = question
    .toLowerCase()
    .match(/[a-z]{4,}/g)
    ?.filter((word) => !["what", "which", "when", "does", "explain", "about", "this", "that"].includes(word)) ?? [];

  const ranked = sentences
    .map((sentence) => {
      const lower = sentence.toLowerCase();
      const score = keywords.reduce(
        (total, keyword) => total + (lower.includes(keyword) ? 1 : 0),
        0,
      );
      return { sentence, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (ranked.length === 0) {
    return {
      mode: "local",
      answer:
        "I could not find anything about that in the extracted text. Try rephrasing with a term that appears in your document, or connect an AI model in Settings for a real explanation.",
    };
  }

  return {
    mode: "local",
    answer: `Local mode found these passages in your document (no AI configured, so nothing is paraphrased):\n\n${ranked
      .map((item) => `• ${truncate(item.sentence, 400)}`)
      .join("\n\n")}`,
  };
}

export async function regenerateConcept(
  doc: DocumentRecord,
  conceptTitle: string,
): Promise<DifficultConcept> {
  if (!aiStatus().configured) {
    throw new Error(
      "Regenerating explanations needs an AI model. Add an API key in Settings first.",
    );
  }

  const raw = await aiJson<Record<string, unknown>>({
    system: SYSTEM_PROMPT,
    temperature: 0.6,
    maxTokens: 2200,
    user: `Re-explain this concept for a struggling undergraduate, using a fresh analogy and a different structure from before.

DOCUMENT: ${doc.name}
CONCEPT: ${conceptTitle}

DOCUMENT EXCERPT:
${relevantExcerpt(doc.textPreview, conceptTitle, 7000)}

Return JSON: {"title":string,"simpleExplanation":string,"steps":string[],"example":string,"analogy":string,"sourceNote":string,"diagram":{"type":"flow"|"mindmap"|"compare"|"block","title":string,"caption":string,"nodes":[{"id":string,"label":string,"note":string}],"edges":[{"from":string,"to":string,"label":string}],"columns":[string,string]}}`,
  });

  const normalized = normalizeConcepts([raw])[0];
  if (!normalized) throw new Error("The AI returned an unusable explanation.");
  return normalized;
}
