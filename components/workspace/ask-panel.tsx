"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, Loader2, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: "ai" | "local";
}

const SUGGESTIONS = [
  "Explain the hardest concept in this document simply.",
  "What is the difference between the two main methods?",
  "List the formulas I must memorise for the exam.",
];

export function AskPanel({
  documentId,
  aiConfigured,
  suggested = SUGGESTIONS,
}: {
  documentId: string;
  aiConfigured: boolean;
  suggested?: string[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setError(null);
    setInput("");
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setBusy(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: documentId, question: trimmed, history }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        answer?: string;
        mode?: "ai" | "local";
        error?: string;
      };
      if (!response.ok || !payload.answer) {
        throw new Error(payload.error ?? "The assistant could not answer.");
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.answer as string, mode: payload.mode },
      ]);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-accent/15 text-accent-2">
          <Bot className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-ink">Ask this document</p>
          <p className="text-[10.5px] text-faint">
            {aiConfigured ? "Answers from your file only" : "Local passage search"}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div>
            <p className="text-[12px] leading-relaxed text-muted">
              {aiConfigured
                ? "Ask anything about the uploaded material. NoteWise answers from the extracted text and says when something is missing."
                : "No AI model is connected. You will get the closest passages from your document, quoted directly."}
            </p>
            <div className="mt-3 space-y-1.5">
              {suggested.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  className="w-full rounded-lg border border-line/60 bg-white/[0.02] px-2.5 py-2 text-left text-[11px] leading-snug text-muted transition hover:border-accent/40 hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border",
                      message.role === "user"
                        ? "border-line bg-panel text-muted"
                        : "border-accent/30 bg-accent/10 text-accent-2",
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                  </span>
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-[11.5px] leading-relaxed",
                      message.role === "user"
                        ? "bg-accent/15 text-ink"
                        : "border border-line/60 bg-base-soft/70 text-muted",
                    )}
                  >
                    {message.content}
                    {message.mode === "local" ? (
                      <span className="mt-2 block text-[10px] font-medium uppercase tracking-wider text-warn">
                        local search
                      </span>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {busy ? (
              <div className="flex items-center gap-2 pl-8 text-[11px] text-faint">
                <Loader2 className="h-3 w-3 animate-spin" />
                Reading the document…
              </div>
            ) : null}
            {error ? (
              <p className="rounded-lg border border-danger/30 bg-danger/[0.07] px-2.5 py-2 text-[11px] text-danger">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="border-t border-line-soft p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-line/70 bg-base-soft/60 p-1.5 focus-within:border-accent/50">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask about this document…"
            className="max-h-28 min-h-[34px] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[11.5px] text-ink outline-none placeholder:text-faint"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent text-white transition hover:brightness-110 disabled:opacity-40"
            aria-label="Send question"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
