import type {
  Definition,
  DiagramSpec,
  DifficultConcept,
  Formula,
  QuestionItem,
  StudyChapter,
  StudyMaterial,
} from "./types";
import { titleFromFilename, truncate } from "./utils";

const HEADING_PATTERNS = [
  /^(?:unit|chapter|module|lesson)\s+[0-9ivxlc]+\b.*$/i,
  /^\d{1,2}(?:\.\d{1,2}){0,2}[.)]?\s+\S.{2,90}$/,
  /^[A-Z][A-Z0-9 ,&/()\-]{6,70}$/,
];

const DEFINITION_PATTERN =
  /^(.{3,70}?)\s+(?:is|are|means|refers to|is defined as|is called)\s+(.{20,320})$/i;

const FORMULA_HINT = /[=≈≤≥∑∫√]/;

function cleanLine(line: string) {
  return line.replace(/^[-•*\u2022]\s*/, "").replace(/\s+/g, " ").trim();
}

function isHeading(line: string) {
  if (line.length < 3 || line.length > 95) return false;
  if (/[.!?]$/.test(line) && line.length > 40) return false;
  return HEADING_PATTERNS.some((pattern) => pattern.test(line));
}

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25);
}

const STOPWORDS = new Set([
  "the","and","for","with","that","this","from","have","been","which","their",
  "there","would","could","should","about","these","those","while","where",
  "when","then","than","into","also","such","more","most","some","only",
]);

function scoreSentence(sentence: string) {
  const words = sentence.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  const unique = new Set(words.filter((word) => !STOPWORDS.has(word)));
  let score = unique.size;
  if (/\b(important|therefore|because|must|always|never|key|note|remember)\b/i.test(sentence))
    score += 6;
  if (FORMULA_HINT.test(sentence)) score += 4;
  if (sentence.length > 240) score -= 4;
  return score;
}

function pickKeyPoints(sentences: string[], limit: number) {
  const seen = new Set<string>();
  const ranked = sentences
    .map((sentence) => ({ sentence, score: scoreSentence(sentence) }))
    .sort((a, b) => b.score - a.score);
  const result: string[] = [];
  for (const item of ranked) {
    const key = item.sentence.slice(0, 60).toLowerCase();
    if (seen.has(key)) continue;
    if (item.sentence.length > 320) continue;
    seen.add(key);
    result.push(item.sentence);
    if (result.length >= limit) break;
  }
  return result;
}

function extractDefinitions(text: string): Definition[] {
  const found: Definition[] = [];
  const seen = new Set<string>();
  for (const sentence of splitSentences(text)) {
    const match = sentence.match(DEFINITION_PATTERN);
    if (!match) continue;
    const term = match[1].replace(/^(a|an|the)\s+/i, "").trim();
    if (term.split(" ").length > 8) continue;
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({ term, definition: truncate(match[2].trim(), 300) });
    if (found.length >= 6) break;
  }
  return found;
}

function extractFormulas(text: string): Formula[] {
  const found: Formula[] = [];
  const seen = new Set<string>();
  for (const rawLine of text.split("\n")) {
    const line = cleanLine(rawLine);
    if (line.length < 5 || line.length > 110) continue;
    if (!FORMULA_HINT.test(line)) continue;
    const expression = line.replace(/^where\s+/i, "");
    const key = expression.replace(/\s/g, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      expression,
      meaning:
        "Quoted directly from the uploaded document. Check the original page for context.",
    });
    if (found.length >= 6) break;
  }
  return found;
}

interface Section {
  title: string;
  lines: string[];
}

function splitIntoSections(text: string, fallbackTitle: string): Section[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^---\s*(page|slide)\s+\d+\s*---$/i.test(line));

  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    if (isHeading(line)) {
      if (current && current.lines.join(" ").length > 120) {
        sections.push(current);
        current = { title: cleanLine(line), lines: [] };
      } else if (current) {
        current.lines.push(line);
      } else {
        current = { title: cleanLine(line), lines: [] };
      }
      continue;
    }
    if (!current) {
      current = { title: fallbackTitle, lines: [] };
    }
    current.lines.push(line);
  }
  if (current) sections.push(current);

  return sections.filter((section) => section.lines.join(" ").length > 80);
}

function buildChapters(sections: Section[], maxChapters = 6): StudyChapter[] {
  const chapters = sections.slice(0, maxChapters).map((section, index) => {
    const body = section.lines.join(" ");
    const sentences = splitSentences(body);
    return {
      id: `ch-${index + 1}`,
      title: section.title,
      summary: truncate(sentences.slice(0, 2).join(" ") || body, 420),
      // Local mode cannot invent explanations, so quote the fuller body text
      // directly. It is still more to study from than the two-sentence summary.
      explanation:
        sentences.length > 3
          ? truncate(sentences.slice(2, 12).join(" "), 2400)
          : undefined,
      keyPoints: pickKeyPoints(sentences, 5),
      definitions: extractDefinitions(body),
      formulas: extractFormulas(section.lines.join("\n")),
      examples: sentences
        .filter((sentence) => /\b(for example|e\.g\.|consider|suppose|such as)\b/i.test(sentence))
        .slice(0, 2)
        .map((sentence) => truncate(sentence, 260)),
      derivations: [],
      workedExamples: [],
      commonMistakes: [],
      examTips: [],
      source: "Locally extracted from the uploaded document",
    } satisfies StudyChapter;
  });
  return chapters;
}

function buildDiagrams(title: string, chapters: StudyChapter[]): DiagramSpec[] {
  const diagrams: DiagramSpec[] = [];
  if (chapters.length >= 2) {
    diagrams.push({
      type: "flow",
      title: "Topic sequence in this document",
      caption:
        "Built locally from the headings in your document — the order matches the source.",
      nodes: chapters.map((chapter, index) => ({
        id: `n${index + 1}`,
        label: truncate(chapter.title, 48),
      })),
      edges: chapters.slice(1).map((_, index) => ({
        from: `n${index + 1}`,
        to: `n${index + 2}`,
      })),
    });
  }
  diagrams.push({
    type: "mindmap",
    title: `Key ideas inside ${title}`,
    caption: "The most frequently emphasised points, grouped by section.",
    nodes: [
      { id: "root", label: truncate(title, 40) },
      ...chapters.flatMap((chapter, index) => [
        { id: `c${index + 1}`, label: truncate(chapter.title, 40) },
        ...chapter.keyPoints.slice(0, 2).map((point, pointIndex) => ({
          id: `c${index + 1}p${pointIndex + 1}`,
          label: truncate(point, 52),
        })),
      ]),
    ],
    edges: chapters.flatMap((chapter, index) => [
      { from: "root", to: `c${index + 1}` },
      ...chapter.keyPoints.slice(0, 2).map((_, pointIndex) => ({
        from: `c${index + 1}`,
        to: `c${index + 1}p${pointIndex + 1}`,
      })),
    ]),
  });
  return diagrams;
}

function buildConcepts(chapters: StudyChapter[]): DifficultConcept[] {
  return chapters.slice(0, 4).map((chapter, index) => ({
    id: `dc-${index + 1}`,
    title: chapter.title,
    simpleExplanation: chapter.summary,
    steps: chapter.keyPoints.slice(0, 4),
    example:
      chapter.examples[0] ??
      "The document does not contain a worked example for this section.",
    analogy: "",
    sourceNote:
      "Local mode: this is a condensed extract of your document, not an AI explanation. Add an API key to unlock step-by-step explanations and analogies.",
    diagram: chapters.length > 1
      ? {
          type: "flow",
          title: `How ${truncate(chapter.title, 40)} is presented`,
          nodes: chapter.keyPoints.slice(0, 3).map((point, pointIndex) => ({
            id: `s${pointIndex + 1}`,
            label: truncate(point, 46),
          })),
          edges: chapter.keyPoints
            .slice(0, 3)
            .slice(1)
            .map((_, pointIndex) => ({
              from: `s${pointIndex + 1}`,
              to: `s${pointIndex + 2}`,
            })),
        }
      : undefined,
  }));
}

function buildQuestions(chapters: StudyChapter[]): QuestionItem[] {
  const questions: QuestionItem[] = [];
  for (const chapter of chapters.slice(0, 4)) {
    questions.push({
      question: `Explain the main idea of “${truncate(chapter.title, 70)}”.`,
      answer: chapter.summary,
      marks: 5,
      difficulty: "medium",
    });
    const definition = chapter.definitions[0];
    if (definition) {
      questions.push({
        question: `Define ${definition.term}.`,
        answer: definition.definition,
        marks: 3,
        difficulty: "easy",
      });
    }
    const formula = chapter.formulas[0];
    if (formula) {
      questions.push({
        question: `State and explain the relation ${truncate(formula.expression, 60)}.`,
        answer: `The document states: ${formula.expression}`,
        marks: 4,
        difficulty: "medium",
      });
    }
  }
  return questions.slice(0, 8);
}

export function buildLocalStudyMaterial(
  name: string,
  text: string,
): StudyMaterial {
  const title = titleFromFilename(name);
  const sections = splitIntoSections(text, title);
  const chapters =
    sections.length > 0
      ? buildChapters(sections)
      : buildChapters([{ title, lines: [text] }]);

  const definitions = chapters.flatMap((chapter) => chapter.definitions).slice(0, 10);
  const formulas = chapters.flatMap((chapter) => chapter.formulas).slice(0, 10);
  const keyPoints = chapters.flatMap((chapter) => chapter.keyPoints).slice(0, 8);

  return {
    title,
    subject: "Uploaded document",
    overview: truncate(chapters[0]?.summary ?? text, 480),
    learningObjectives: chapters
      .slice(0, 4)
      .map((chapter) => `Understand ${truncate(chapter.title, 60)}`),
    chapters,
    difficultConcepts: buildConcepts(chapters),
    diagrams: buildDiagrams(title, chapters),
    questions: buildQuestions(chapters),
    revision: {
      definitions,
      formulas,
      keyPoints,
      differences: [],
      examTopics: chapters.map((chapter) => truncate(chapter.title, 70)),
    },
    generatedBy: "local",
    model: "local-rules",
    warnings: [
      "AI is not configured, so this material was assembled with local rules directly from your document text.",
      "Definitions, formulas and key points are quoted or lightly condensed — no invented facts. Connect a model in Settings for real explanations, analogies and richer questions.",
    ],
    generatedAt: new Date().toISOString(),
  };
}
