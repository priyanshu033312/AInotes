import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "cyan" | "success" | "warn" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  accent: "border-accent/30 bg-accent/12 text-accent-2",
  cyan: "border-cyan/30 bg-cyan/10 text-cyan",
  success: "border-success/30 bg-success/10 text-success",
  warn: "border-warn/30 bg-warn/10 text-warn",
  danger: "border-danger/30 bg-danger/10 text-danger",
  neutral: "border-line bg-white/[0.04] text-muted",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
