"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Presentation,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { SlideStage } from "@/components/presentation/slide-stage";
import { buildDeck, THEME_LIST, THEMES } from "@/lib/slides";
import type { SlideOverride, SlideTheme, StudyMaterial } from "@/lib/types";
import { cn, formatDate, truncate } from "@/lib/utils";

export function PresentationWorkbench({
  id,
  study,
  initialTheme,
  initialOverrides,
  aiConfigured,
  initialGeneratedAt,
}: {
  id: string;
  study: StudyMaterial;
  initialTheme: SlideTheme;
  initialOverrides: Record<number, SlideOverride>;
  aiConfigured: boolean;
  initialGeneratedAt?: string;
}) {
  const [theme, setTheme] = useState<SlideTheme>(initialTheme);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [selected, setSelected] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt);
  const { push } = useToast();

  const deck = useMemo(() => buildDeck(study, overrides), [study, overrides]);
  const slide = deck[Math.min(selected, deck.length - 1)];

  async function download() {
    setDownloading(true);
    try {
      const response = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, theme }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        downloadUrl?: string;
        error?: string;
      };
      if (!response.ok || !payload.downloadUrl) {
        throw new Error(payload.error ?? "Could not build the presentation.");
      }
      const anchor = document.createElement("a");
      anchor.href = payload.downloadUrl;
      anchor.download = "";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setGeneratedAt(new Date().toISOString());
      push({
        title: "Presentation ready",
        description: "Your .pptx download has started.",
        variant: "success",
      });
    } catch (error) {
      push({
        title: "Generation failed",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
        variant: "error",
      });
    } finally {
      setDownloading(false);
    }
  }

  async function regenerateSlide() {
    setRegenerating(true);
    try {
      const response = await fetch(`/api/presentations/${id}/slide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: selected, theme }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        overrides?: Record<number, SlideOverride>;
        error?: string;
      };
      if (!response.ok || !payload.overrides) {
        throw new Error(payload.error ?? "Could not regenerate this slide.");
      }
      setOverrides(payload.overrides);
      push({
        title: "Slide rewritten",
        description: "The deck file was rebuilt with the new wording.",
        variant: "success",
      });
    } catch (error) {
      push({
        title: "Slide regeneration failed",
        description:
          error instanceof Error ? error.message : "Check your AI settings.",
        variant: "error",
      });
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            href={`/workspace/${id}`}
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-faint hover:text-ink"
            aria-label="Back to workspace"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-accent-2">
              Presentation studio
            </p>
            <h1 className="mt-1 font-display text-lg font-semibold text-ink">
              {truncate(study.title, 70)}
            </h1>
            <p className="mt-0.5 text-[11px] text-faint">
              {deck.length} slides · {THEMES[theme].name} ·{" "}
              {generatedAt ? `built ${formatDate(generatedAt)}` : "not built yet"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={regenerateSlide}
            disabled={!aiConfigured || regenerating}
            title={
              aiConfigured
                ? "Ask the AI to rewrite this slide"
                : "Connect an AI model to rewrite slides"
            }
          >
            {regenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Regenerate slide
          </Button>
          <Button size="sm" onClick={download} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {downloading ? "Building…" : "Download .pptx"}
          </Button>
        </div>
      </div>

      {!aiConfigured ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-warn/25 bg-warn/[0.06] px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-warn" />
          <p className="text-[11.5px] text-warn">
            Slide regeneration needs an AI model. Theme changes and downloads work
            with local content.
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,1fr)_270px]">
        {/* thumbnails */}
        <div className="order-2 lg:order-1">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[calc(100vh-200px)] lg:flex-col lg:overflow-y-auto lg:pr-1">
            {deck.map((item, index) => (
              <button
                key={`${item.kind}-${index}`}
                onClick={() => setSelected(index)}
                className={cn(
                  "group relative w-[168px] shrink-0 overflow-hidden rounded-lg border-2 transition lg:w-full",
                  selected === index
                    ? "border-accent shadow-[0_0_0_3px_rgba(139,92,246,0.18)]"
                    : "border-transparent hover:border-line",
                )}
              >
                <SlideStage
                  slide={item}
                  theme={theme}
                  index={index}
                  total={deck.length}
                  compact
                />
                <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1 py-0.5 font-mono text-[8.5px] text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {overrides[index] ? (
                  <span className="absolute right-1 top-1 rounded bg-accent px-1 py-0.5 text-[8px] font-semibold text-white">
                    edited
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* stage */}
        <div className="order-1 lg:order-2">
          <div className="overflow-hidden rounded-2xl border border-line/70 shadow-panel">
            <SlideStage
              slide={slide}
              theme={theme}
              index={selected}
              total={deck.length}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelected((value) => Math.max(0, value - 1))}
                disabled={selected === 0}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted disabled:opacity-40"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-mono text-[11px] text-muted">
                {selected + 1} / {deck.length}
              </span>
              <button
                onClick={() =>
                  setSelected((value) => Math.min(deck.length - 1, value + 1))
                }
                disabled={selected === deck.length - 1}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted disabled:opacity-40"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Badge tone="neutral">{slide.kind.replace("-", " ")}</Badge>
          </div>

          <div className="mt-4 rounded-xl border border-line/60 bg-panel/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              About this slide
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              {slide.kind === "diagram"
                ? "Diagram slides are rebuilt as editable PowerPoint shapes with the same labels and arrows you see here."
                : slide.kind === "title"
                  ? "Cover slide generated from the document title, subject and overview."
                  : "Content comes from the generated study material. Use Regenerate slide to ask the model for clearer wording."}
            </p>
          </div>
        </div>

        {/* theme panel */}
        <div className="order-3 space-y-3">
          <div className="rounded-2xl border border-line/70 bg-panel/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              Theme
            </p>
            <div className="mt-2.5 space-y-2">
              {THEME_LIST.map((item) => {
                const active = item.id === theme;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id)}
                    className={cn(
                      "w-full rounded-xl border p-2.5 text-left transition",
                      active
                        ? "border-accent/50 bg-accent/[0.08]"
                        : "border-line/60 hover:border-line",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11.5px] font-semibold text-ink">{item.name}</p>
                      {active ? <Check className="h-3 w-3 text-accent-2" /> : null}
                    </div>
                    <div className="mt-1.5 flex gap-1">
                      {[item.background, item.surface, item.accent, item.secondary].map(
                        (color) => (
                          <span
                            key={color}
                            className="h-3 w-3 rounded-full border border-white/10"
                            style={{ background: `#${color}` }}
                          />
                        ),
                      )}
                    </div>
                    <p className="mt-1.5 text-[10px] leading-snug text-faint">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-line/70 bg-panel/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              Export
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              A real .pptx file with editable text and shapes — not screenshots.
            </p>
            <Button
              className="mt-3 w-full"
              size="sm"
              onClick={download}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Presentation className="h-3.5 w-3.5" />
              )}
              {downloading ? "Building…" : "Download .pptx"}
            </Button>
            <Link
              href={`/workspace/${id}`}
              className={buttonClass("ghost", "sm", "mt-1.5 w-full")}
            >
              Back to notes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
