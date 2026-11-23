"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  ListChecks,
  Network,
  Presentation,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AskPanel } from "@/components/workspace/ask-panel";
import {
  NotesView,
  OriginalView,
  QuestionsView,
  RevisionView,
  VisualView,
} from "@/components/workspace/study-views";
import { DeleteDocumentButton } from "@/components/delete-document-button";
import type { StudyMaterial, StudyTab } from "@/lib/types";
import { cn, formatBytes, truncate } from "@/lib/utils";

const TABS: { id: StudyTab; label: string; icon: typeof BookOpen }[] = [
  { id: "notes", label: "Notes", icon: BookOpen },
  { id: "original", label: "Original", icon: FileText },
  { id: "visual", label: "Visual", icon: Network },
  { id: "revision", label: "Revision", icon: ListChecks },
  { id: "questions", label: "Questions", icon: Sparkles },
];

export function WorkspaceShell({
  id,
  name,
  kind,
  pages,
  size,
  createdAt,
  isSample,
  text,
  initialStudy,
  aiConfigured,
  hasPresentation,
  initialTab = "notes",
}: {
  id: string;
  name: string;
  kind: "pdf" | "pptx";
  pages: number;
  size: number;
  createdAt: string;
  isSample?: boolean;
  text: string;
  initialStudy: StudyMaterial;
  aiConfigured: boolean;
  hasPresentation: boolean;
  initialTab?: StudyTab;
}) {
  const [tab, setTab] = useState<StudyTab>(initialTab);
  const [study, setStudy] = useState(initialStudy);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { push } = useToast();

  const counts: Record<StudyTab, number | undefined> = {
    notes: study.chapters.length,
    original: pages,
    visual: study.diagrams.length,
    revision: study.revision.formulas.length + study.revision.definitions.length,
    questions: study.questions.length,
  };

  async function regenerate(conceptId: string) {
    setRegeneratingId(conceptId);
    try {
      const response = await fetch(`/api/documents/${id}/concept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        concept?: StudyMaterial["difficultConcepts"][number];
        error?: string;
      };
      if (!response.ok || !payload.concept) {
        throw new Error(payload.error ?? "Could not regenerate the explanation.");
      }
      setStudy((current) => ({
        ...current,
        difficultConcepts: current.difficultConcepts.map((concept) =>
          concept.id === conceptId ? payload.concept! : concept,
        ),
      }));
      push({
        title: "Explanation regenerated",
        description: "The new version replaced the old one in this workspace.",
        variant: "success",
      });
    } catch (error) {
      push({
        title: "Regeneration failed",
        description:
          error instanceof Error ? error.message : "Check your AI settings.",
        variant: "error",
      });
    } finally {
      setRegeneratingId(null);
    }
  }

  function jumpToChapter(chapterId: string) {
    setTab("notes");
    window.setTimeout(() => {
      document
        .getElementById(`chapter-${chapterId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  return (
    <div>
      {/* header */}
      <div className="sticky top-0 z-30 border-b border-line/60 bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <Link
                href="/documents"
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-faint transition hover:border-accent/40 hover:text-ink"
                aria-label="Back to documents"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate font-display text-[15px] font-semibold text-ink sm:text-base">
                    {truncate(study.title, 70)}
                  </h1>
                  {isSample ? <Badge tone="neutral">sample</Badge> : null}
                  <Badge tone={study.generatedBy === "ai" ? "accent" : "warn"}>
                    {study.generatedBy === "ai" ? "AI notes" : "Local"}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-[10.5px] text-faint">
                  {name} · {kind.toUpperCase()} · {pages} {kind === "pdf" ? "pages" : "slides"} ·{" "}
                  {formatBytes(size)} · added {new Date(createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <a
                href={`/api/export/${id}`}
                className={buttonClass("outline", "sm")}
                download
              >
                <Download className="h-3.5 w-3.5" />
                Notes PDF
              </a>
              <a
                href={`/api/export/${id}?mode=revision`}
                className={buttonClass("ghost", "sm")}
                download
              >
                Revision PDF
              </a>
              <Link
                href={`/presentations/${id}`}
                className={buttonClass("primary", "sm")}
              >
                <Presentation className="h-3.5 w-3.5" />
                {hasPresentation ? "Deck" : "Build deck"}
              </Link>
              <DeleteDocumentButton
                id={id}
                name={name}
                variant="icon"
                redirectTo="/documents"
                className="ml-1"
              />
            </div>
          </div>

          <div className="mt-3 flex gap-0.5 overflow-x-auto pb-0.5">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition",
                    active
                      ? "bg-accent/15 text-ink"
                      : "text-muted hover:bg-white/[0.04] hover:text-ink",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", active ? "text-accent-2" : "text-faint")} />
                  {item.label}
                  {counts[item.id] ? (
                    <span className="rounded bg-white/[0.06] px-1 text-[9.5px] text-faint">
                      {counts[item.id]}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-4 py-5 sm:px-6 xl:grid-cols-[200px_minmax(0,1fr)_320px]">
        {/* outline */}
        <aside className="hidden xl:block">
          <div className="sticky top-[124px] space-y-4">
            <div>
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Outline
              </p>
              <nav className="mt-2 space-y-0.5">
                {study.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => jumpToChapter(chapter.id)}
                    className="flex w-full gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] text-muted transition hover:bg-white/[0.04] hover:text-ink"
                  >
                    <span className="font-mono text-[9.5px] text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="line-clamp-2 leading-snug">
                      {truncate(chapter.title, 46)}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {study.difficultConcepts.length > 0 ? (
              <div>
                <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                  Hard parts
                </p>
                <nav className="mt-2 space-y-0.5">
                  {study.difficultConcepts.map((concept) => (
                    <button
                      key={concept.id}
                      onClick={() => setTab("visual")}
                      className="flex w-full gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] text-muted transition hover:bg-white/[0.04] hover:text-ink"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warn" />
                      <span className="line-clamp-2 leading-snug">
                        {truncate(concept.title, 46)}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            ) : null}

            <div className="rounded-xl border border-line/60 bg-panel/40 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                Document
              </p>
              <dl className="mt-2 space-y-1 text-[10.5px]">
                {[
                  ["Chapters", study.chapters.length],
                  ["Definitions", study.revision.definitions.length],
                  ["Formulas", study.revision.formulas.length],
                  ["Questions", study.questions.length],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between">
                    <dt className="text-faint">{label}</dt>
                    <dd className="font-mono text-muted">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </aside>

        {/* main */}
        <div className="min-w-0">
          {tab === "notes" ? (
            <NotesView
              study={study}
              onRegenerate={regenerate}
              aiConfigured={aiConfigured}
              regeneratingId={regeneratingId}
            />
          ) : null}
          {tab === "original" ? <OriginalView text={text} name={name} /> : null}
          {tab === "visual" ? <VisualView study={study} /> : null}
          {tab === "revision" ? <RevisionView study={study} /> : null}
          {tab === "questions" ? <QuestionsView study={study} /> : null}

          <div className="mt-5 xl:hidden">
            <div className="h-[460px] overflow-hidden rounded-2xl border border-line/70 bg-panel/40">
              <AskPanel documentId={id} aiConfigured={aiConfigured} />
            </div>
          </div>
        </div>

        {/* right rail */}
        <aside className="hidden xl:block">
          <div className="sticky top-[124px] space-y-3">
            <div className="h-[420px] overflow-hidden rounded-2xl border border-line/70 bg-panel/40">
              <AskPanel documentId={id} aiConfigured={aiConfigured} />
            </div>

            <div className="rounded-2xl border border-line/70 bg-panel/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Quick revision
              </p>
              <div className="mt-2 space-y-1.5">
                {study.revision.keyPoints.slice(0, 3).map((point) => (
                  <p key={point} className="flex gap-2 text-[11px] leading-relaxed text-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                    {point}
                  </p>
                ))}
              </div>
              <button
                onClick={() => setTab("revision")}
                className="mt-3 text-[10.5px] font-medium text-accent-2 hover:text-ink"
              >
                Open the full revision sheet →
              </button>
            </div>

            <div className="rounded-2xl border border-line/70 bg-panel/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Export
              </p>
              <div className="mt-2 space-y-1.5">
                <a
                  href={`/api/export/${id}`}
                  className="flex items-center justify-between rounded-lg border border-line/60 px-2.5 py-2 text-[11px] text-muted hover:border-accent/40 hover:text-ink"
                  download
                >
                  Notes PDF <Download className="h-3 w-3" />
                </a>
                <a
                  href={`/api/export/${id}?mode=revision`}
                  className="flex items-center justify-between rounded-lg border border-line/60 px-2.5 py-2 text-[11px] text-muted hover:border-accent/40 hover:text-ink"
                  download
                >
                  Revision PDF <Download className="h-3 w-3" />
                </a>
                <Link
                  href={`/presentations/${id}`}
                  className="flex items-center justify-between rounded-lg border border-line/60 px-2.5 py-2 text-[11px] text-muted hover:border-accent/40 hover:text-ink"
                >
                  PowerPoint deck <Presentation className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
