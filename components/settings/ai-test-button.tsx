"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, PlugZap, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiTestButton() {
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "running" }
    | { kind: "ok"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function test() {
    setState({ kind: "running" });
    try {
      const response = await fetch("/api/ai/test", { method: "POST" });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        model?: string;
        latencyMs?: number;
        reply?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Connection failed.");
      }
      setState({
        kind: "ok",
        message: `${payload.model} replied in ${payload.latencyMs} ms${
          payload.reply ? ` · “${payload.reply}”` : ""
        }`,
      });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Connection failed.",
      });
    }
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={test}
        disabled={state.kind === "running"}
      >
        {state.kind === "running" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <PlugZap className="h-3.5 w-3.5" />
        )}
        Test connection
      </Button>
      {state.kind === "ok" ? (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-success">
          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
          {state.message}
        </p>
      ) : null}
      {state.kind === "error" ? (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-danger">
          <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
