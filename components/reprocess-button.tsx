"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * Rebuilds the study material for a document that already has notes. Existing
 * documents were generated with the old, shallow prompt, so this is how they
 * pick up the in-depth pipeline without being deleted and uploaded again.
 */
export function ReprocessButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  async function rebuild() {
    setBusy(true);
    push({
      title: "Rebuilding notes in depth",
      description:
        "Writing full explanations, derivations and solved examples for every chapter. This can take a few minutes — keep this tab open.",
      variant: "info",
    });
    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        aiError?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not rebuild the notes.");
      }
      push({
        title: "Notes rebuilt",
        description: payload.aiError
          ? payload.aiError
          : "Open a chapter to read the deeper explanations.",
        variant: payload.aiError ? "warn" : "success",
      });
      router.refresh();
    } catch (error) {
      push({
        title: "Rebuild failed",
        description:
          error instanceof Error ? error.message : "Check your AI settings and retry.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={rebuild}
      disabled={busy}
      title="Rewrite this document's notes with full explanations, derivations and solved examples"
      className={buttonClass("outline", "sm")}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {busy ? "Rebuilding…" : "Rebuild notes"}
    </button>
  );
}
