"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles, Wand2 } from "lucide-react";
import { Diagram } from "@/components/diagram";
import type { DiagramSpec } from "@/lib/types";

const miniDiagram: DiagramSpec = {
  type: "flow",
  title: "Counter-flow energy balance",
  nodes: [
    { id: "a", label: "Hot in", note: "120 °C" },
    { id: "b", label: "Exchanger", note: "U · A · ΔT" },
    { id: "c", label: "Cold out", note: "55 °C" },
  ],
  edges: [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
  ],
};

const notes = [
  "Parallel flow: outlets converge, so the cold stream can never pass the hot stream.",
  "Counter flow keeps the end differences large — bigger ΔT_lm, less area.",
  "Fouling adds a resistance: 1/U_dirty = 1/U_clean + R_f.",
];

const docLines = [
  { width: "92%", dim: false },
  { width: "78%", dim: true },
  { width: "86%", dim: true },
  { width: "64%", dim: false, highlight: true },
  { width: "88%", dim: true },
  { width: "72%", dim: true },
  { width: "90%", dim: false, highlight: true },
  { width: "58%", dim: true },
];

export function HeroVisual() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="glass relative overflow-hidden rounded-3xl p-3 shadow-panel sm:p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger/70" />
            <span className="h-2 w-2 rounded-full bg-warn/70" />
            <span className="h-2 w-2 rounded-full bg-success/70" />
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md bg-white/[0.03] px-2.5 py-1">
            <FileText className="h-3 w-3 shrink-0 text-muted" />
            <span className="truncate text-[10.5px] text-muted">
              Thermal-Engineering-Unit-3.pdf
            </span>
          </div>
          <motion.span
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success sm:flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            ready
          </motion.span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.82fr_auto_1.18fr]">
          {/* Original document */}
          <div className="rounded-2xl border border-line/70 bg-base-soft/70 p-3.5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Source · 24 pages
              </span>
            </div>
            <div className="space-y-[9px]">
              {docLines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.07, duration: 0.4 }}
                  className={`h-[7px] rounded-full ${
                    line.highlight
                      ? "bg-accent/45"
                      : line.dim
                        ? "bg-white/[0.09]"
                        : "bg-white/[0.16]"
                  }`}
                  style={{ width: line.width }}
                />
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-line/60 bg-white/[0.02] px-2.5 py-2">
              <p className="font-mono text-[9.5px] leading-relaxed text-muted">
                ΔT<sub>lm</sub> = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)
              </p>
            </div>
          </div>

          {/* Flow arrow */}
          <div className="relative hidden w-11 flex-col items-center justify-center sm:flex">
            <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent/40 to-transparent" />
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="absolute h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(139,92,246,0.9)]"
                style={{ left: "calc(50% - 3px)" }}
                animate={{ top: ["18%", "78%"], opacity: [0, 1, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: dot * 0.7,
                  ease: "easeInOut",
                }}
              />
            ))}
            <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-accent/40 bg-canvas text-accent">
              <Wand2 className="h-3.5 w-3.5" />
            </span>
            <ArrowRight className="mt-2 h-3 w-3 text-accent/60" />
          </div>

          {/* Generated notes */}
          <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.12] via-panel/70 to-cyan/[0.06] p-3.5">
            <div className="mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-accent-2" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-2">
                Simplified notes
              </span>
            </div>
            <h4 className="font-display text-[13px] font-semibold leading-snug text-ink">
              3.2 Flow arrangements
            </h4>
            <ul className="mt-2.5 space-y-2">
              {notes.map((note, index) => (
                <motion.li
                  key={note}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 1.0 + index * 0.45,
                    duration: 0.45,
                    ease: "easeOut",
                  }}
                  className="flex gap-2 text-[10.5px] leading-relaxed text-muted"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                  {note}
                </motion.li>
              ))}
            </ul>
            <div className="mt-3 overflow-hidden rounded-lg border border-line/60 bg-base-soft/60 p-1.5">
              <Diagram spec={miniDiagram} compact className="[&_text]:!text-[10px]" />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line/60 bg-white/[0.02] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="text-[10.5px] text-muted">
              Generating diagrams for 4 difficult concepts…
            </span>
          </div>
          <span className="text-[10px] font-medium text-accent-2">72%</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-3 -top-5 hidden rounded-xl border border-cyan/30 bg-panel/90 px-3 py-2 shadow-panel backdrop-blur sm:block"
      >
        <p className="text-[10px] font-semibold text-cyan">Diagram generated</p>
        <p className="text-[9.5px] text-muted">Counter flow vs parallel</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-6 -left-4 hidden rounded-xl border border-accent/30 bg-panel/90 px-3 py-2 shadow-panel backdrop-blur sm:block"
      >
        <p className="text-[10px] font-semibold text-accent-2">Revision sheet ready</p>
        <p className="text-[9.5px] text-muted">6 formulas · 5 definitions</p>
      </motion.div>
    </div>
  );
}
