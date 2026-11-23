"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[notewise]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-danger/30 bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h1 className="mt-5 font-display text-xl font-semibold text-ink">
        Something went wrong on this page
      </h1>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
        {error.message || "An unexpected error occurred."} Your files are untouched.
      </p>
      <button
        onClick={reset}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
