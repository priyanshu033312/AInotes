"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function DeleteDocumentButton({
  id,
  name,
  variant = "icon",
  className,
  redirectTo,
}: {
  id: string;
  name: string;
  variant?: "icon" | "text";
  className?: string;
  redirectTo?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [armed, setArmed] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  async function remove() {
    if (!armed) {
      setArmed(true);
      window.setTimeout(() => setArmed(false), 4000);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not delete the document.");
      }
      push({ title: "Document deleted", description: name, variant: "success" });
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (error) {
      push({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      title={armed ? "Click again to confirm" : `Delete ${name}`}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border transition-colors disabled:opacity-50",
        armed
          ? "border-danger/50 bg-danger/15 text-danger"
          : "border-line/70 text-faint hover:border-danger/40 hover:text-danger",
        variant === "icon" ? "h-8 w-8" : "h-8 px-2.5 text-[12px]",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {variant === "text" ? (armed ? "Confirm" : "Delete") : null}
    </button>
  );
}
