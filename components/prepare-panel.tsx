"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { STAGE_COPY, STAGE_LABELS, STAGE_ORDER } from "@/lib/labels";
import type { DocStatus, ProcessingStage } from "@/lib/types";

export function PreparePanel({
  id,
  name,
  status,
  stage,
  error,
  isSample,
}: {
  id: string;
  name: string;
  status: DocStatus;
  stage: ProcessingStage;
  error?: string;
  isSample?: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentStage, setCurrentStage] = useState(stage);
  const [currentError, setCurrentError] = useState(error);
  const [busy, setBusy] = useState(status === "processing");
  const pollRef = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (currentStatus !== "processing" && !busy) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/documents/${id}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          document: { status: DocStatus; stage: ProcessingStage; error?: string };
        };
        setCurrentStatus(data.document.status);
        setCurrentStage(data.document.stage);
        setCurrentError(data.document.error);
        if (data.document.status === "ready") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          router.refresh();
        }
      } catch {
        /* keep polling */
      }
    }, 1000);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [busy, currentStatus, id, router]);

  async function start() {
    setBusy(true);
    setCurrentStatus("processing");
    setCurrentStage("extracting");
    setCurrentError(undefined);
    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Processing failed.");
      setCurrentStatus("ready");
      router.refresh();
    } catch (caught) {
      setCurrentStatus("failed");
      setCurrentError(caught instanceof Error ? caught.message : "Processing failed.");
    } finally {
      setBusy(false);
    }
  }

  const activeIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href="/documents"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to documents
      </Link>

      <div className="mt-6 rounded-2xl border border-line/70 bg-panel/50 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={currentStatus === "processing" ? "cyan" : currentStatus === "failed" ? "danger" : "accent"}>
            {currentStatus}
          </Badge>
          {isSample ? <Badge tone="neutral">sample</Badge> : null}
        </div>
        <h1 className="mt-3 font-display text-xl font-semibold text-ink">
          {busy ? "Building your study material" : "This document has no study material yet"}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {busy
            ? STAGE_COPY[currentStage]
            : "Generate the notes, diagrams and revision sheet from the text that was already extracted from this file."}
        </p>
        <p className="mt-3 truncate font-mono text-[11px] text-faint">{name}</p>

        {busy ? (
          <div className="mt-6">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-muted">{STAGE_LABELS[currentStage]}</span>
              <span className="flex items-center gap-1.5 text-accent-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                working
              </span>
            </div>
            <Progress className="mt-2" indeterminate />
            <ol className="mt-5 grid gap-1.5 sm:grid-cols-2">
              {STAGE_ORDER.slice(0, 5).map((item, index) => (
                <li
                  key={item}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] ${
                    index < activeIndex
                      ? "border-success/25 bg-success/[0.05] text-success"
                      : index === activeIndex
                        ? "border-accent/30 bg-accent/[0.07] text-ink"
                        : "border-line/50 text-faint"
                  }`}
                >
                  {index < activeIndex ? "✓" : index === activeIndex ? "…" : index + 1}
                  {STAGE_LABELS[item]}
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="mt-6">
            {currentError ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/[0.07] p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <p className="text-[12px] leading-relaxed text-danger">{currentError}</p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button onClick={start} disabled={busy}>
                <Wand2 className="h-4 w-4" />
                Generate study material
              </Button>
              <Link
                href="/settings"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-line px-4 text-sm text-muted hover:text-ink"
              >
                <Sparkles className="h-4 w-4" />
                AI settings
              </Link>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              If no API key is configured, NoteWise falls back to local rule-based
              extraction so the document is still usable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
