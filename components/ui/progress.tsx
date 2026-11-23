import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
  indeterminate = false,
}: {
  value?: number;
  className?: string;
  barClassName?: string;
  indeterminate?: boolean;
}) {
  const isIndeterminate = indeterminate || typeof value !== "number";
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]", className)}
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : Math.round(value ?? 0)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {isIndeterminate ? (
        <div className="shimmer h-full w-full rounded-full" />
      ) : (
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-accent-deep via-accent to-cyan transition-all duration-500 ease-out",
            barClassName,
          )}
          style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
        />
      )}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white",
        className,
      )}
    />
  );
}
