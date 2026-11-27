"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  ChevronDown,
  Copy as CopyIcon,
  FileSearch,
  GitBranch,
  Lightbulb,
  ListChecks,
  Loader2,
  RefreshCw,
  Sigma,
  Target,
} from "lucide-react";
import type { DifficultConcept, StudyMaterial } from "@/lib/types";
import { Diagram } from "@/components/diagram";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/workspace/copy-button";
import { cn, truncate } from "@/lib/utils";

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof BookOpen;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-accent-2" />
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">
        {title}
      </p>
      {hint ? <span className="text-[10.5px] text-faint/70">{hint}</span> : null}
    </div>
  );
}

export function OverviewCard({ study }: { study: StudyMaterial }) {
  return (
    <div className="panel-gradient rounded-2xl border border-line/70 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={study.generatedBy === "ai" ? "accent" : "warn"}>
          {study.generatedBy === "ai" ? "AI generated" : "Local analysis"}
        </Badge>
        <Badge tone="neutral">{study.subject}</Badge>
        <Badge tone="neutral">{study.chapters.length} chapters</Badge>
        <Badge tone="neutral">{study.diagrams.length} diagrams</Badge>
        <span className="ml-auto text-[10.5px] text-faint">
          {new Date(study.generatedAt).toLocaleDateString()}
        </span>
      </div>
      <p className="mt-4 text-[13.5px] leading-relaxed text-muted">{study.overview}</p>

      {study.learningObjectives.length > 0 ? (
        <div className="mt-4">
          <SectionTitle icon={Target} title="You should be able to" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {study.learningObjectives.map((objective) => (
              <span
                key={objective}
                className="rounded-md border border-line/60 bg-white/[0.02] px-2 py-1 text-[10.5px] text-muted"
              >
                {objective}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {study.warnings.length > 0 ? (
        <div className="mt-4 space-y-1.5 rounded-lg border border-warn/25 bg-warn/[0.06] p-2.5">
          {study.warnings.map((warning) => (
            <p key={warning} className="flex gap-2 text-[11px] leading-relaxed text-warn">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChapterCard({
  chapter,
  index,
  open,
  onToggle,
}: {
  chapter: StudyMaterial["chapters"][number];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const copyText = [
    chapter.title,
    chapter.summary,
    chapter.explanation ?? "",
    "",
    ...chapter.keyPoints.map((point) => `• ${point}`),
    ...chapter.definitions.map((definition) => `${definition.term}: ${definition.definition}`),
    ...chapter.formulas.map((formula) => `${formula.expression} — ${formula.meaning}`),
    ...(chapter.derivations ?? []).flatMap((derivation) => [
      `Derivation: ${derivation.title}`,
      ...derivation.steps.map((step, index) => `${index + 1}. ${step}`),
      derivation.result,
    ]),
    ...(chapter.workedExamples ?? []).flatMap((example) => [
      `Solved example: ${example.question}`,
      example.solution,
    ]),
  ].join("\n");

  return (
    <div
      id={`chapter-${chapter.id}`}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-line/70 bg-panel/40"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line bg-base-soft font-mono text-[10.5px] text-accent-2">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[13.5px] font-semibold text-ink">
            {chapter.title}
          </span>
          <span className="mt-0.5 block truncate text-[10.5px] text-faint">
            {chapter.keyPoints.length} key points ·{" "}
            {chapter.formulas.length} formulas · {chapter.definitions.length} definitions
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-faint transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-line-soft px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[12.5px] leading-relaxed text-muted">{chapter.summary}</p>
                <CopyButton text={copyText} label="Copy section" className="shrink-0" />
              </div>

              {chapter.explanation ? (
                <div className="mt-3 space-y-2 border-l-2 border-accent/25 pl-3">
                  {chapter.explanation
                    .split(/\n{2,}/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-[12.5px] leading-relaxed text-muted"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              ) : null}

              {chapter.keyPoints.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {chapter.keyPoints.map((point) => (
                    <li key={point} className="flex gap-2 text-[12px] leading-relaxed text-muted">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}

              {chapter.definitions.length > 0 ? (
                <div className="mt-4">
                  <SectionTitle icon={BookOpen} title="Definitions" />
                  <div className="mt-2 space-y-1.5">
                    {chapter.definitions.map((definition) => (
                      <div
                        key={definition.term}
                        className="rounded-lg border border-line/50 bg-white/[0.02] px-3 py-2"
                      >
                        <p className="text-[11.5px] font-semibold text-ink">
                          {definition.term}
                        </p>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                          {definition.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {chapter.formulas.length > 0 ? (
                <div className="mt-4">
                  <SectionTitle icon={Sigma} title="Formulas" />
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {chapter.formulas.map((formula) => (
                      <div
                        key={formula.expression}
                        className="rounded-lg border border-accent/20 bg-accent/[0.06] px-3 py-2"
                      >
                        <p className="font-mono text-[11.5px] text-ink">
                          {formula.expression}
                        </p>
                        <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">
                          {formula.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {chapter.derivations && chapter.derivations.length > 0 ? (
                <div className="mt-4">
                  <SectionTitle icon={GitBranch} title="Derivations" hint="where each formula comes from" />
                  <div className="mt-2 space-y-2">
                    {chapter.derivations.map((derivation) => (
                      <div
                        key={derivation.title}
                        className="rounded-lg border border-accent/20 bg-accent/[0.05] px-3 py-2.5"
                      >
                        <p className="text-[11.5px] font-semibold text-ink">
                          {derivation.title}
                        </p>
                        <ol className="mt-1.5 space-y-1">
                          {derivation.steps.map((step, stepIndex) => (
                            <li
                              key={stepIndex}
                              className="flex gap-2 text-[11.5px] leading-relaxed text-muted"
                            >
                              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded bg-accent/15 font-mono text-[9px] text-accent-2">
                                {stepIndex + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                        {derivation.result ? (
                          <p className="mt-2 rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[11.5px] text-ink">
                            {derivation.result}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {chapter.workedExamples && chapter.workedExamples.length > 0 ? (
                <div className="mt-4">
                  <SectionTitle icon={Calculator} title="Solved examples" />
                  <div className="mt-2 space-y-2">
                    {chapter.workedExamples.map((example, exampleIndex) => (
                      <div
                        key={`${example.question}-${exampleIndex}`}
                        className="rounded-lg border border-line/50 bg-base-soft/50 px-3 py-2.5"
                      >
                        <p className="text-[11.5px] font-semibold leading-relaxed text-ink">
                          Q{exampleIndex + 1}. {example.question}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-[11.5px] leading-relaxed text-muted">
                          {example.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {chapter.examples.length > 0 ? (
                <div className="mt-4">
                  <SectionTitle icon={Lightbulb} title="Examples in context" />
                  <ul className="mt-2 space-y-1.5">
                    {chapter.examples.map((example) => (
                      <li
                        key={example}
                        className="rounded-lg border border-line/50 bg-base-soft/50 px-3 py-2 text-[11.5px] leading-relaxed text-muted"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {chapter.commonMistakes && chapter.commonMistakes.length > 0 ? (
                <div className="mt-4">
                  <SectionTitle icon={AlertTriangle} title="Common mistakes" />
                  <ul className="mt-2 space-y-1.5">
                    {chapter.commonMistakes.map((mistake) => (
                      <li
                        key={mistake}
                        className="flex gap-2 rounded-lg border border-warn/20 bg-warn/[0.05] px-3 py-2 text-[11.5px] leading-relaxed text-muted"
                      >
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warn" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {chapter.examTips && chapter.examTips.length > 0 ? (
                <div className="mt-4">
                  <SectionTitle icon={Target} title="Exam tips" />
                  <ul className="mt-2 space-y-1.5">
                    {chapter.examTips.map((tip) => (
                      <li key={tip} className="flex gap-2 text-[11.5px] leading-relaxed text-muted">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-cyan" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {chapter.source ? (
                <p className="mt-3 text-[10px] italic text-faint">{chapter.source}</p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function NotesView({
  study,
  onRegenerate,
  aiConfigured,
  regeneratingId,
  showOverview = true,
}: {
  study: StudyMaterial;
  onRegenerate?: (conceptId: string) => void;
  aiConfigured: boolean;
  regeneratingId?: string | null;
  showOverview?: boolean;
}) {
  const [openChapters, setOpenChapters] = useState<string[]>(() =>
    study.chapters.slice(0, 2).map((chapter) => chapter.id),
  );

  const allOpen = openChapters.length === study.chapters.length;

  function toggle(id: string) {
    setOpenChapters((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className="space-y-4">
      {showOverview ? <OverviewCard study={study} /> : null}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold text-ink">
          Chapter notes
        </h2>
        <button
          onClick={() =>
            setOpenChapters(allOpen ? [] : study.chapters.map((chapter) => chapter.id))
          }
          className="text-[11px] font-medium text-accent-2 hover:text-ink"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="space-y-2.5">
        {study.chapters.map((chapter, index) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            index={index}
            open={openChapters.includes(chapter.id)}
            onToggle={() => toggle(chapter.id)}
          />
        ))}
      </div>

      {study.difficultConcepts.length > 0 ? (
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-ink">
              Difficult concepts
            </h2>
            <span className="text-[10.5px] text-faint">
              Rewritten for understanding
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {study.difficultConcepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                onRegenerate={onRegenerate}
                aiConfigured={aiConfigured}
                busy={regeneratingId === concept.id}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ConceptCard({
  concept,
  onRegenerate,
  aiConfigured,
  busy,
}: {
  concept: DifficultConcept;
  onRegenerate?: (conceptId: string) => void;
  aiConfigured: boolean;
  busy?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line/70 bg-panel/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[13.5px] font-semibold text-ink">
          {concept.title}
        </h3>
        {onRegenerate ? (
          <button
            onClick={() => onRegenerate(concept.id)}
            disabled={!aiConfigured || busy}
            title={
              aiConfigured
                ? "Ask the model for a different explanation"
                : "Connect an AI model to regenerate explanations"
            }
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line/70 px-1.5 py-1 text-[10.5px] font-medium text-faint transition hover:border-accent/40 hover:text-accent-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Regenerate
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
        {concept.simpleExplanation}
      </p>

      {concept.steps.length > 0 ? (
        <ol className="mt-3 space-y-1.5">
          {concept.steps.map((step, index) => (
            <li key={step} className="flex gap-2 text-[12px] leading-relaxed text-muted">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded bg-accent/15 font-mono text-[9px] text-accent-2">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      ) : null}

      {concept.example ? (
        <div className="mt-3 rounded-lg border border-line/50 bg-base-soft/50 px-3 py-2">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-cyan">
            Worked example
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{concept.example}</p>
        </div>
      ) : null}

      {concept.analogy ? (
        <p className="mt-2 text-[11.5px] italic leading-relaxed text-faint">
          “{concept.analogy}”
        </p>
      ) : null}

      {concept.diagram ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-line/60 bg-base-soft/40">
          <Diagram spec={concept.diagram} compact />
        </div>
      ) : null}

      {concept.sourceNote ? (
        <p className="mt-2 text-[10px] leading-relaxed text-faint">{concept.sourceNote}</p>
      ) : null}
    </div>
  );
}

export function VisualView({ study }: { study: StudyMaterial }) {
  const diagrams = useMemo(() => {
    const conceptDiagrams = study.difficultConcepts
      .filter((concept) => concept.diagram)
      .map((concept) => ({
        diagram: concept.diagram!,
        caption: `From the concept: ${concept.title}`,
      }));
    return [
      ...study.diagrams.map((diagram) => ({
        diagram,
        caption: diagram.caption ?? "",
      })),
      ...conceptDiagrams,
    ];
  }, [study]);

  if (diagrams.length === 0) {
    return (
      <div className="rounded-2xl border border-line/70 bg-panel/40 p-10 text-center">
        <p className="text-[13px] text-muted">No diagrams were generated for this document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-[15px] font-semibold text-ink">
          Visual explanations
        </h2>
        <p className="mt-1 text-[12px] text-faint">
          Each diagram is built from the concept in your document — labels and
          connections come from the material.
        </p>
      </div>
      {diagrams.map((item, index) => (
        <div
          key={`${item.diagram.title}-${index}`}
          className="overflow-hidden rounded-2xl border border-line/70 bg-panel/40"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-4 py-3">
            <div>
              <p className="text-[12.5px] font-semibold text-ink">{item.diagram.title}</p>
              {item.caption ? (
                <p className="mt-0.5 text-[10.5px] text-faint">{item.caption}</p>
              ) : null}
            </div>
            <Badge tone="neutral">{item.diagram.type}</Badge>
          </div>
          <div className="bg-base-soft/40 p-3">
            <Diagram spec={item.diagram} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OriginalView({ text, name }: { text: string; name: string }) {
  const [query, setQuery] = useState("");
  const pages = useMemo(() => {
    const blocks = text.split(/---\s*(?:Page|Slide)\s+(\d+)\s*---/g);
    const parsed: { label: string; content: string }[] = [];
    if (blocks.length <= 1) return [{ label: "Extracted text", content: text }];
    for (let index = 1; index < blocks.length; index += 2) {
      parsed.push({
        label: `Page / slide ${blocks[index]}`,
        content: blocks[index + 1]?.trim() ?? "",
      });
    }
    return parsed;
  }, [text]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pages;
    return pages.filter((page) => page.content.toLowerCase().includes(needle));
  }, [pages, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[15px] font-semibold text-ink">
            Original extracted content
          </h2>
          <p className="mt-1 text-[11.5px] text-faint">
            {pages.length} sections extracted from {name}. Page references are preserved.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the text…"
          className="h-9 w-56 rounded-lg border border-line bg-base-soft/60 px-3 text-[12px] text-ink outline-none placeholder:text-faint focus:border-accent/50"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-line/60 bg-panel/40 p-6 text-center text-[12px] text-muted">
          Nothing in the extracted text matches “{query}”.
        </p>
      ) : (
        filtered.slice(0, 40).map((page) => (
          <div
            key={page.label}
            className="rounded-xl border border-line/60 bg-panel/30 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                {page.label}
              </p>
              <CopyButton text={page.content} label="Copy page" />
            </div>
            <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[11.5px] leading-relaxed text-muted">
              {page.content || "—"}
            </pre>
          </div>
        ))
      )}
    </div>
  );
}

export function QuestionsView({ study }: { study: StudyMaterial }) {
  const [open, setOpen] = useState<number[]>([]);

  if (study.questions.length === 0) {
    return (
      <div className="rounded-2xl border border-line/70 bg-panel/40 p-10 text-center">
        <p className="text-[13px] text-muted">
          No questions were generated. Process the document again to create them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-[15px] font-semibold text-ink">
            Important questions
          </h2>
          <p className="mt-1 text-[11.5px] text-faint">
            Reveal the answer, then try writing it from memory.
          </p>
        </div>
        <Badge tone="neutral">{study.questions.length} questions</Badge>
      </div>
      {study.questions.map((question, index) => {
        const expanded = open.includes(index);
        return (
          <div
            key={question.question}
            className="rounded-xl border border-line/70 bg-panel/40"
          >
            <button
              onClick={() =>
                setOpen((current) =>
                  current.includes(index)
                    ? current.filter((item) => item !== index)
                    : [...current, index],
                )
              }
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
              aria-expanded={expanded}
            >
              <span className="mt-0.5 font-mono text-[10.5px] text-accent-2">
                Q{index + 1}
              </span>
              <span className="flex-1 text-[12.5px] font-medium leading-relaxed text-ink">
                {question.question}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {question.marks ? (
                  <span className="rounded border border-line px-1.5 py-0.5 text-[9.5px] text-faint">
                    {question.marks} marks
                  </span>
                ) : null}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-faint transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-line-soft px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[12px] leading-relaxed text-muted">
                        {question.answer}
                      </p>
                      <CopyButton text={question.answer} label="Copy answer" />
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function RevisionView({ study }: { study: StudyMaterial }) {
  const revision = study.revision;
  const blocks = [
    {
      title: "Definitions to memorise",
      icon: BookOpen,
      count: revision.definitions.length,
      content: (
        <div className="space-y-1.5">
          {revision.definitions.map((definition) => (
            <div key={definition.term} className="rounded-lg border border-line/50 bg-white/[0.02] px-3 py-2">
              <p className="text-[11.5px] font-semibold text-ink">{definition.term}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                {definition.definition}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Formulas",
      icon: Sigma,
      count: revision.formulas.length,
      content: (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {revision.formulas.map((formula) => (
            <div key={formula.expression} className="rounded-lg border border-accent/20 bg-accent/[0.06] px-3 py-2">
              <p className="font-mono text-[11.5px] text-ink">{formula.expression}</p>
              <p className="mt-0.5 text-[10.5px] text-muted">{formula.meaning}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Points that earn marks",
      icon: Target,
      count: revision.keyPoints.length,
      content: (
        <ul className="space-y-1.5">
          {revision.keyPoints.map((point) => (
            <li key={point} className="flex gap-2 text-[12px] leading-relaxed text-muted">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-cyan" />
              {point}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Don't mix these up",
      icon: ListChecks,
      count: revision.differences.length,
      content: (
        <div className="space-y-2">
          {revision.differences.map((difference) => (
            <div key={`${difference.conceptA}-${difference.conceptB}`} className="overflow-hidden rounded-lg border border-line/50">
              <div className="grid grid-cols-2 border-b border-line/50 bg-white/[0.02]">
                <p className="px-3 py-2 text-[11px] font-semibold text-accent-2">
                  {difference.conceptA}
                </p>
                <p className="border-l border-line/50 px-3 py-2 text-[11px] font-semibold text-cyan">
                  {difference.conceptB}
                </p>
              </div>
              <ul className="px-3 py-2">
                {difference.points.map((point) => (
                  <li key={point} className="text-[11.5px] leading-relaxed text-muted">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Likely exam topics",
      icon: FileSearch,
      count: revision.examTopics.length,
      content: (
        <div className="flex flex-wrap gap-1.5">
          {revision.examTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-md border border-line/60 bg-white/[0.02] px-2 py-1 text-[10.5px] text-muted"
            >
              {topic}
            </span>
          ))}
        </div>
      ),
    },
  ].filter((block) => block.count > 0);

  if (blocks.length === 0) {
    return (
      <div className="rounded-2xl border border-line/70 bg-panel/40 p-10 text-center text-[13px] text-muted">
        No revision material was generated for this document.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-[15px] font-semibold text-ink">
          Quick revision
        </h2>
        <p className="mt-1 text-[11.5px] text-faint">
          Everything you need the night before — sourced from your document.
        </p>
      </div>
      {blocks.map((block) => {
        const Icon = block.icon;
        return (
          <div key={block.title} className="rounded-2xl border border-line/70 bg-panel/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-accent-2" />
              <h3 className="font-display text-[12.5px] font-semibold text-ink">
                {block.title}
              </h3>
              <span className="rounded border border-line px-1.5 py-0.5 text-[9.5px] text-faint">
                {block.count}
              </span>
            </div>
            {block.content}
          </div>
        );
      })}
      <p className="text-[10.5px] text-faint">
        Tip: use “Revision PDF” in the header to download this as a printable sheet.
      </p>
    </div>
  );
}

export function OriginalTableOfContents({
  study,
}: {
  study: StudyMaterial;
}) {
  return (
    <ul className="space-y-1">
      {study.chapters.map((chapter, index) => (
        <li key={chapter.id} className="text-[11.5px] text-muted">
          <a
            href={`#chapter-${chapter.id}`}
            className="flex gap-2 rounded px-1 py-1 hover:text-ink"
          >
            <span className="font-mono text-[10px] text-faint">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="truncate">{truncate(chapter.title, 42)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function CopyIconButton({ text }: { text: string }) {
  return (
    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(text)}>
      <CopyIcon className="h-3.5 w-3.5" />
      Copy
    </Button>
  );
}
