import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  compact = false,
}: {
  className?: string;
  showWordmark?: boolean;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid place-items-center rounded-xl bg-gradient-to-br from-accent-deep via-accent to-cyan shadow-[0_10px_30px_-12px_rgba(139,92,246,0.9)]",
          compact ? "h-8 w-8" : "h-9 w-9",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={compact ? "h-4 w-4" : "h-[18px] w-[18px]"}
          aria-hidden
        >
          <path
            d="M6.5 4.5h8.2L18.5 8v11.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z"
            stroke="white"
            strokeWidth="1.4"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M14.2 4.7v3.6h3.9"
            stroke="white"
            strokeWidth="1.4"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M8.6 12.4h6.2M8.6 15.2h4.4"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="17.6" cy="6.4" r="2.2" fill="white" opacity="0.95" />
        </svg>
      </span>
      {showWordmark ? (
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
          NoteWise<span className="text-accent-2"> AI</span>
        </span>
      ) : null}
    </span>
  );
}
