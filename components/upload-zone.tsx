"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Presentation,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/labels";
import type { ProcessingStage } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

const MAX_BYTES = 25 * 1024 * 1024;

const STEPS: { stage: ProcessingStage; label: string; hint: string }[] = [
  { stage: "extracting", label: "Uploading and extracting content", hint: "Text, headings and slide notes" },
  { stage: "organizing", label: "Identifying important topics", hint: "Chapters, definitions, formulas" },
  { stage: "simplifying", label: "Simplifying difficult concepts", hint: "Plain language, same physics" },
  { stage: "illustrating", label: "Generating visual explanations", hint: "Labelled flow, block and mind maps" },
  { stage: "preparing", label: "Preparing study material", hint: "Notes, questions and revision sheet" },
];

type Phase = "idle" | "ready" | "uploading" | "processing" | "done" | "error";

interface DocumentStatus {
  status: "uploaded" | "processing" | "ready" | "failed";
  stage: ProcessingStage;
  error?: string;
}

function uploadWithProgress(
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ id: string }> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      let payload: { id?: string; error?: string } = {};
      try {
        payload = JSON.parse(request.responseText) as typeof payload;
      } catch {
        payload = {};
      }
      if (request.status >= 200 && request.status < 300 && payload.id) {
        resolve({ id: payload.id });
      } else {
        reject(new Error(payload.error ?? "The upload failed. Is the server running?"));
      }
    });
    request.addEventListener("error", () =>
      reject(new Error("Network error while uploading. Check the server and try again.")),
    );
    request.addEventListener("abort", () => reject(new Error("Upload cancelled.")));

    const form = new FormData();
    form.append("file", file);
    request.send(form);
  });
}

export function UploadZone() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dragging, setDragging] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [stage, setStage] = useState<ProcessingStage>("queued");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    name: string;
    generatedBy?: "ai" | "local";
    warnings?: string[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<number | null>(null);
  const { push } = useToast();

  useEffect(
    () => () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    },
    [],
  );

  const validate = useCallback(
    (candidate: File) => {
      const extension = candidate.name.split(".").pop()?.toLowerCase() ?? "";
      if (extension === "ppt") {
        return "Legacy .ppt files cannot be read. Save it as .pptx in PowerPoint first.";
      }
      if (!["pdf", "pptx"].includes(extension)) {
        return "Only PDF and PPTX files are supported.";
      }
      if (candidate.size > MAX_BYTES) {
        return `That file is ${formatBytes(candidate.size)}. The limit is 25 MB.`;
      }
      if (candidate.size === 0) return "That file is empty.";
      return null;
    },
    [],
  );

  const accept = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;
      const problem = validate(candidate);
      if (problem) {
        setError(problem);
        push({ title: "File not accepted", description: problem, variant: "error" });
        return;
      }
      setError(null);
      setResult(null);
      setStage("queued");
      setUploadPercent(0);
      setFile(candidate);
      setPhase("ready");
    },
    [push, validate],
  );

  async function process() {
    if (!file) return;
    setError(null);
    setPhase("uploading");
    setUploadPercent(0);

    try {
      const { id } = await uploadWithProgress(file, setUploadPercent);
      setPhase("processing");
      setStage("extracting");

      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = window.setInterval(async () => {
        try {
          const response = await fetch(`/api/documents/${id}`, { cache: "no-store" });
          if (!response.ok) return;
          const data = (await response.json()) as { document: DocumentStatus };
          setStage(data.document.stage);
        } catch {
          /* polling is best-effort; the process call reports the real error */
        }
      }, 900);

      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        generatedBy?: "ai" | "local";
        warnings?: string[];
      };

      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }

      if (!response.ok) throw new Error(payload.error ?? "Processing failed.");

      setStage("done");
      setResult({
        id,
        name: file.name,
        generatedBy: payload.generatedBy,
        warnings: payload.warnings,
      });
      setPhase("done");
      push({
        title: "Study material ready",
        description:
          payload.generatedBy === "local"
            ? "Built with local rules — connect a model for richer explanations."
            : "Notes, diagrams and revision sheet are ready.",
        variant: "success",
      });
    } catch (caught) {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      const message =
        caught instanceof Error ? caught.message : "Something went wrong.";
      setError(message);
      setPhase("error");
      push({ title: "Processing stopped", description: message, variant: "error" });
    }
  }

  function reset() {
    if (pollRef.current) window.clearInterval(pollRef.current);
    setFile(null);
    setPhase("idle");
    setStage("queued");
    setError(null);
    setResult(null);
    setUploadPercent(0);
  }

  const activeStep = STAGE_ORDER.indexOf(stage);
  const busy = phase === "uploading" || phase === "processing";

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <div className="glass rounded-2xl p-5 shadow-panel sm:p-6">
        {phase === "done" && result ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-success/30 bg-success/12 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold text-ink">
              Study material is ready
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted">
              {result.name} was processed
              {result.generatedBy === "local"
                ? " with local rules. The notes quote your document — connect an AI model for step-by-step explanations."
                : " with AI. Notes, diagrams, questions and a revision sheet are waiting."}
            </p>
            {result.warnings?.length ? (
              <div className="mx-auto mt-4 max-w-lg rounded-xl border border-warn/25 bg-warn/[0.06] p-3 text-left">
                {result.warnings.map((warning) => (
                  <p key={warning} className="text-[11.5px] leading-relaxed text-warn">
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link href={`/workspace/${result.id}`} className={buttonClass("primary", "md")}>
                Open the study workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/presentations/${result.id}`}
                className={buttonClass("outline", "md")}
              >
                <Presentation className="h-4 w-4" />
                Build a presentation
              </Link>
              <Button variant="ghost" size="md" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Process another
              </Button>
            </div>
          </div>
        ) : busy ? (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-2">
                  {phase === "uploading" ? "Uploading" : "Processing"}
                </p>
                <h2 className="mt-1.5 font-display text-lg font-semibold text-ink">
                  {STAGE_LABELS[stage]}
                </h2>
              </div>
              <Badge tone="cyan">
                <Loader2 className="h-3 w-3 animate-spin" />
                live
              </Badge>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-line/60 bg-base-soft/50 p-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-panel text-accent-2">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-ink">{file?.name}</p>
                <p className="text-[11px] text-faint">
                  {file ? formatBytes(file.size) : ""}
                </p>
              </div>
              <span className="font-mono text-[11px] text-muted">
                {phase === "uploading" ? `${uploadPercent}%` : "reading"}
              </span>
            </div>

            <div className="mt-4">
              <Progress value={phase === "uploading" ? uploadPercent : undefined} />
            </div>

            <ol className="mt-6 space-y-3">
              {STEPS.map((step, index) => {
                const stepIndex = STAGE_ORDER.indexOf(step.stage);
                const complete = activeStep > stepIndex;
                const current = activeStep === stepIndex;
                return (
                  <li key={step.stage} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px]",
                        complete
                          ? "border-success/40 bg-success/12 text-success"
                          : current
                            ? "border-accent/50 bg-accent/12 text-accent-2"
                            : "border-line bg-white/[0.02] text-faint",
                      )}
                    >
                      {complete ? (
                        <Check className="h-3 w-3" />
                      ) : current ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div>
                      <p
                        className={cn(
                          "text-[12.5px] font-medium",
                          complete || current ? "text-ink" : "text-faint",
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-[11px] text-faint">{step.hint}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-5 rounded-lg border border-line/60 bg-white/[0.02] p-3 text-[11.5px] leading-relaxed text-muted">
              Status comes from the server while it works — this is not a fake
              progress animation. Long documents can take a minute.
            </p>
          </div>
        ) : (
          <div>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                accept(event.dataTransfer.files?.[0]);
              }}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
              }}
              className={cn(
                "relative cursor-pointer rounded-2xl border border-dashed p-8 text-center transition-all duration-200 sm:p-10",
                dragging
                  ? "border-accent bg-accent/10"
                  : "border-line bg-base-soft/40 hover:border-accent/50 hover:bg-accent/[0.04]",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                className="hidden"
                onChange={(event) => {
                  accept(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <span
                className={cn(
                  "mx-auto grid h-14 w-14 place-items-center rounded-2xl border transition-colors",
                  dragging
                    ? "border-accent/60 bg-accent/15 text-accent-2"
                    : "border-line bg-panel text-accent-2",
                )}
              >
                <UploadCloud className="h-6 w-6" />
              </span>
              <p className="mt-5 font-display text-[15px] font-semibold text-ink">
                {dragging ? "Drop it here" : "Drag a document here"}
              </p>
              <p className="mt-1.5 text-[12.5px] text-muted">
                or{" "}
                <span className="font-medium text-accent-2 underline decoration-accent/30 underline-offset-2">
                  browse your files
                </span>
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Badge tone="neutral">PDF</Badge>
                <Badge tone="neutral">PPTX</Badge>
                <Badge tone="neutral">Max 25 MB</Badge>
              </div>
            </div>

            {file ? (
              <div className="mt-4 rounded-xl border border-line/70 bg-panel/60 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-base-soft text-accent-2">
                    {file.name.toLowerCase().endsWith(".pdf") ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <Presentation className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink">{file.name}</p>
                    <p className="text-[11px] text-faint">
                      {formatBytes(file.size)} ·{" "}
                      {file.name.split(".").pop()?.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPhase("idle");
                      setError(null);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-white/[0.05] hover:text-danger"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  className="mt-3 w-full"
                  onClick={process}
                  disabled={!file}
                >
                  <UploadCloud className="h-4 w-4" />
                  Process this document
                </Button>
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/[0.07] p-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <div>
                  <p className="text-[12.5px] font-medium text-danger">
                    {error}
                  </p>
                  {phase === "error" ? (
                    <button
                      onClick={process}
                      className="mt-1.5 text-[11.5px] font-medium text-ink underline underline-offset-2 hover:text-accent-2"
                    >
                      Try processing again
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-2 border-t border-line-soft pt-4 text-[11.5px] text-faint sm:grid-cols-2">
              <p>· Text is extracted on this machine.</p>
              <p>· Nothing is executed from the file.</p>
              <p>· Scanned PDFs are reported, not guessed.</p>
              <p>· Files are deleted when you delete the document.</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-[14.5px] font-semibold text-ink">
            What happens after upload
          </h2>
          <ol className="mt-4 space-y-3.5">
            {[
              ["Structure", "Chapters, sections and slide order are preserved."],
              ["Simplification", "Hard parts are rebuilt with steps and analogies."],
              ["Visuals", "Diagrams are drawn from the concept, not stock images."],
              ["Exports", "Notes PDF, revision sheet PDF and an editable .pptx."],
            ].map(([title, body], index) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-line bg-base-soft font-mono text-[9.5px] text-accent-2">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[12.5px] font-medium text-ink">{title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-line/60 bg-panel/40 p-5">
          <h2 className="font-display text-[13.5px] font-semibold text-ink">
            Better results, faster
          </h2>
          <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-muted">
            <li>· Export slides with real text, not screenshots.</li>
            <li>· Keep formulas as text so they survive extraction.</li>
            <li>· Split a 400-page book into units of 30–60 pages.</li>
            <li>· Run OCR first if the PDF has no selectable text.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
