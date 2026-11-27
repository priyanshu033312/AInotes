import type {
  Derivation,
  DiagramEdge,
  DiagramNode,
  DiagramSpec,
  DocumentRecord,
  DifficultConcept,
  QuestionItem,
  StudyChapter,
  StudyMaterial,
  WorkedExample,
} from "./types";
import { aiJson, aiModelLabel, aiStatus, aiText } from "./ai";
import { buildLocalStudyMaterial } from "./local";
import { titleFromFilename, truncate } from "./utils";

const SYSTEM_PROMPT = `You are NoteWise AI, an experienced engineering and science teacher who writes complete, self-contained study notes for undergraduate students preparing for exams.

Rules you must follow:
1. These notes must replace the textbook, not summarise it. A student who reads only your notes must understand and be able to solve problems on the topic.
2. Build every chapter in this order: the plain-language idea, the formal definition, then the mechanism step by step. Define every symbol, subscript and unit the first time it appears.
3. Derive every formula that appears: start from the stated law or definition, show each algebraic/logical step on its own line, and finish with the final expression. Never drop a formula from the sky when it can be derived.
4. Include fully solved examples with real numbers: formula, substitution, arithmetic and final answer with its unit.
5. State the mistakes students actually make and the exact points an examiner awards marks for.
6. Use concrete physical analogies, but clearly separate an analogy from a source fact.
7. Never fabricate page numbers, measured values, quotes or facts attributed to the document. Standard textbook theory may be used to explain and derive, but do not present it as coming from the source. If something needed is missing, say so in "warnings".
8. Preserve the chapter and topic structure of the source document.
9. Write plain prose. No markdown symbols (no **, #, -, backticks) inside text fields.
10. Return ONLY valid JSON. No commentary, no code fences.`;

const SCHEMA_HINT = `Return JSON with exactly this shape:
{
  "title": string,
  "subject": string,
  "overview": string (150-250 words: what the subject is, why it matters, and how the chapters build on each other),
  "learningObjectives": string[] (5-8, each measurable),
  "chapters": [{
    "title": string,
    "summary": string (80-140 words, not two sentences),
    "keyPoints": string[] (6-10, each a full fact, not a heading),
    "definitions": [{ "term": string, "definition": string }] (every technical term in the chapter, with the symbol if one exists),
    "formulas": [{ "expression": string, "meaning": string }] (every formula, with what each symbol means and its unit),
    "examples": string[] (2-4 short contextual examples),
    "source": string
  }],
  "difficultConcepts": [{
    "title": string,
    "simpleExplanation": string (120-200 words),
    "steps": string[] (5-8 numbered reasoning steps),
    "example": string (a concrete worked example),
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
  "questions": [{ "question": string, "answer": string (3-6 sentences with the reasoning, not one line), "marks": number, "difficulty": "easy" | "medium" | "hard" }],
  "revision": {
    "definitions": [{ "term": string, "definition": string }],
    "formulas": [{ "expression": string, "meaning": string }],
    "keyPoints": string[] (10-15 mark-earning statements),
    "differences": [{ "conceptA": string, "conceptB": string, "points": string[] }],
    "examTopics": string[]
  },
  "warnings": string[]
}

Chapter rules:
- One chapter per real section of the document, in source order. Do not merge unrelated topics to save space.
- Keep the source's own technical vocabulary, notation and units.
- If the document has no explicit chapters, split it into the natural topics it teaches.

Diagram rules:
- "flow" is a left-to-right process chain; "block" is a system/components chain; "mindmap" radiates from node id "root"; "compare" always has exactly two columns and its nodes belong to those columns.
- Every edge must reference node ids that exist. Use 3-7 nodes per diagram, short labels (max 42 characters).
- Give each chapter at least one formula only if the source actually contains it.
- 4 to 6 difficult concepts, each with one diagram. 8 to 12 exam questions.`;

const DEEP_DIVE_PROMPT = `You are writing the full study note for ONE chapter of an academic document. This is the chapter a student will actually learn from, so it must be complete and self-contained.

Return JSON with exactly this shape:
{
  "explanation": string,
  "derivations": [{ "title": string, "steps": string[], "result": string }],
  "workedExamples": [{ "question": string, "solution": string }],
  "commonMistakes": string[],
  "examTips": string[]
}

Depth requirements:
- explanation: 380-600 words in 4-7 paragraphs separated by a blank line (two newlines). Paragraph 1: the plain-language idea and why it matters. Then: every technical term, symbol and unit defined; what physically or logically happens; how the parts connect in order; what changes when a parameter increases or decreases; and a closing link to the next topic or a real application. Plain prose only — no lists, no markdown.
- derivations: 1-3 entries whenever the chapter contains a formula or quantitative relation. Each entry starts from a stated law or definition, numbers every step, substitutes symbolic variables, and ends with the exact final expression. Use an empty array only if the chapter is purely descriptive.
- workedExamples: 1-2 fully solved problems. Give the formula, the substitution with numbers and units, the arithmetic, and the final answer with its unit. If the chapter has no numerical content, use a conceptual example with concrete values.
- commonMistakes: 2-4 specific errors students make, each saying what goes wrong and what the correct reasoning is.
- examTips: 2-4 points on what the examiner looks for and how to structure a written answer.

Use standard textbook theory for explanations and derivations, but never invent facts, page numbers or data attributed to the document. If the supplied excerpt does not cover part of the chapter, explain the standard theory without claiming the source said it.`;

const DEEP_DIVE_FOOTER = `Field limits: explanation max 4000 characters; derivations max 3, steps max 12; workedExamples max 2; commonMistakes max 4; examTips max 4.`;

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
    maxTokens: 4000,
    user: `Read part ${index + 1} of ${total} of an academic document and condense it without losing technical facts.

Extract every section you find into an entry. For each entry give: the section title, a faithful summary (max 180 words), 4-8 key points, all definitions, and all formulas with their meaning and units.

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
    .map((node, index): DiagramNode | null => {
      const item = (node ?? {}) as Record<string, unknown>;
      const label = asString(item.label) || asString(item.title);
      if (!label) return null;
      const mapped: DiagramNode = {
        id: asString(item.id, `n${index + 1}`),
        label: truncate(label, 60),
      };
      const note = asString(item.note);
      if (note) mapped.note = note;
      return mapped;
    })
    .filter((node): node is DiagramNode => node !== null);

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

function normalizeDerivations(value: unknown): Derivation[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (entry ?? {}) as Record<string, unknown>)
    .map((entry) => ({
      title: asString(entry.title),
      steps: asStringArray(entry.steps, 12),
      result: asString(entry.result),
    }))
    .filter((entry) => entry.title && entry.steps.length > 0)
    .slice(0, 3);
}

function normalizeWorkedExamples(value: unknown): WorkedExample[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (entry ?? {}) as Record<string, unknown>)
    .map((entry) => ({
      question: asString(entry.question),
      solution: asString(entry.solution),
    }))
    .filter((entry) => entry.question && entry.solution.length > 40)
    .slice(0, 2);
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

interface ChapterDetail {
  explanation?: string;
  derivations: Derivation[];
  workedExamples: WorkedExample[];
  commonMistakes: string[];
  examTips: string[];
}

async function expandChapter(
  doc: DocumentRecord,
  chapter: StudyChapter,
): Promise<ChapterDetail> {
  const known = [
    chapter.summary ? `SUMMARY: ${chapter.summary}` : "",
    chapter.keyPoints.length ? `KEY POINTS: ${chapter.keyPoints.join("; ")}` : "",
    chapter.definitions.length
      ? `DEFINITIONS: ${chapter.definitions
          .map((definition) => `${definition.term} = ${definition.definition}`)
          .join(" | ")}`
      : "",
    chapter.formulas.length
      ? `FORMULAS: ${chapter.formulas
          .map((formula) => `${formula.expression} (${formula.meaning})`)
          .join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await aiJson<Record<string, unknown>>({
    system: DEEP_DIVE_PROMPT,
    temperature: 0.35,
    maxTokens: 6000,
    user: `DOCUMENT: ${doc.name} (${doc.kind.toUpperCase()}, ${doc.pages} ${
      doc.kind === "pdf" ? "pages" : "slides"
    })
CHAPTER TITLE: ${chapter.title}

WHAT THE OUTLINE ALREADY KNOWS:
${known || "No outline detail available; rely on the source excerpt."}

SOURCE EXCERPTS FROM THIS DOCUMENT:
${relevantExcerpt(doc.text, chapter.title, 12_000)}

${DEEP_DIVE_FOOTER}`,
  });

  const explanation = asString(raw.explanation);
  return {
    explanation: explanation.length >= 200 ? explanation : undefined,
    derivations: normalizeDerivations(raw.derivations),
    workedExamples: normalizeWorkedExamples(raw.workedExamples),
    commonMistakes: asStringArray(raw.commonMistakes, 4),
    examTips: asStringArray(raw.examTips, 4),
  };
}

/** Run async work over a list with a bounded number of parallel requests. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index], index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
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
    return { study: buildLocalStudyMaterial(doc.name, doc.text) };
  }

  try {
    await onStage?.("organizing");
    const chunks = chunkText(doc.text, 26_000);
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
      : `SOURCE DOCUMENT TEXT:\n${doc.text}`;

    const raw = await aiJson<unknown>({
      system: SYSTEM_PROMPT,
      temperature: 0.4,
      maxTokens: 9000,
      user: `Document name: ${doc.name}
Document type: ${doc.kind.toUpperCase()} with ${doc.pages} ${doc.kind === "pdf" ? "pages" : "slides"}

${sourceBlock}

${SCHEMA_HINT}

Write for an undergraduate preparing for examinations. Keep the document's own chapter structure and technical vocabulary. Explain, do not merely shorten.`,
    });

    const study = normalizeStudy(raw, doc);

    // Phase 2: the outline above is intentionally compact so it stays reliable.
    // Each chapter now gets its own call that writes the long explanation,
    // derivations and solved examples. Calls run a few at a time, and a failed
    // chapter keeps its outline instead of sinking the whole document.
    const details = await mapWithConcurrency(
      study.chapters,
      3,
      async (chapter) => {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            return await expandChapter(doc, chapter);
          } catch (error) {
            console.error(
              `[notewise] deep dive failed for "${chapter.title}" (attempt ${attempt + 1}):`,
              (error as Error).message,
            );
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }
        }
        return null;
      },
    );

    const failedChapters: string[] = [];
    study.chapters = study.chapters.map((chapter, index) => {
      const detail = details[index];
      const hasDetail =
        Boolean(detail?.explanation) ||
        (detail?.derivations.length ?? 0) > 0 ||
        (detail?.workedExamples.length ?? 0) > 0;
      if (!detail || !hasDetail) {
        failedChapters.push(chapter.title);
        return chapter;
      }
      return { ...chapter, ...detail };
    });

    if (failedChapters.length > 0) {
      study.warnings = [
        ...study.warnings,
        `The in-depth pass could not be completed for: ${failedChapters
          .slice(0, 5)
          .join(", ")}. Those chapters keep their outline only — rebuild the notes to retry.`,
      ];
    }

    await onStage?.("illustrating");
    return { study };
  } catch (error) {
    const message = (error as Error).message;
    console.error("[notewise] AI generation failed:", message);
    const local = buildLocalStudyMaterial(doc.name, doc.text);
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
${relevantExcerpt(doc.text, question)}

STUDENT QUESTION: ${question}`,
    });
    return { answer: answer.trim(), mode: "ai" };
  }

  // Local mode: return the closest sentences from the source, clearly labelled.
  const sentences = doc.text
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
    maxTokens: 3200,
    user: `Re-explain this concept for a struggling undergraduate, using a fresh analogy and a different structure from before.

Write a 150-250 word explanation, then 5-8 numbered reasoning steps, then a concrete worked example with numbers where the topic allows. Do not repeat the previous wording.

DOCUMENT: ${doc.name}
CONCEPT: ${conceptTitle}

DOCUMENT EXCERPT:
${relevantExcerpt(doc.text, conceptTitle, 7000)}

Return JSON: {"title":string,"simpleExplanation":string,"steps":string[],"example":string,"analogy":string,"sourceNote":string,"diagram":{"type":"flow"|"mindmap"|"compare"|"block","title":string,"caption":string,"nodes":[{"id":string,"label":string,"note":string}],"edges":[{"from":string,"to":string,"label":string}],"columns":[string,string]}}`,
  });

  const normalized = normalizeConcepts([raw])[0];
  if (!normalized) throw new Error("The AI returned an unusable explanation.");
  return normalized;
}
