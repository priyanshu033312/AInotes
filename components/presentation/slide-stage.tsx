"use client";

import { Diagram } from "@/components/diagram";
import { THEMES } from "@/lib/slides";
import type { DeckSlide } from "@/lib/slides";
import type { SlideTheme } from "@/lib/types";
import { cn, truncate } from "@/lib/utils";

export function SlideStage({
  slide,
  theme,
  index,
  total,
  compact = false,
  className,
}: {
  slide: DeckSlide;
  theme: SlideTheme;
  index: number;
  total: number;
  compact?: boolean;
  className?: string;
}) {
  const t = THEMES[theme];
  const dark = t.dark;
  const accent = `#${t.accent}`;
  const secondary = `#${t.secondary}`;
  const ink = `#${t.ink}`;
  const muted = `#${t.muted}`;
  const surface = `#${t.surface}`;
  const isCover = slide.kind === "title" || slide.kind === "closing";

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        aspectRatio: "16 / 9",
        background: `#${t.background}`,
        color: ink,
        containerType: "inline-size",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* backdrop accents */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          right: "-8%",
          top: "-22%",
          width: "46%",
          height: "62%",
          background: accent,
          opacity: dark ? 0.18 : 0.09,
          filter: "blur(38px)",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          left: "-10%",
          bottom: "-30%",
          width: "36%",
          height: "52%",
          background: secondary,
          opacity: dark ? 0.14 : 0.08,
          filter: "blur(42px)",
        }}
      />

      {isCover ? (
        <>
          <div
            className="absolute left-0 top-0 h-[1.2cqw] w-full"
            style={{ background: `linear-gradient(90deg, ${accent}, ${secondary})` }}
          />
          <div className="relative flex h-full flex-col justify-center px-[7cqw]">
            <p
              className="font-semibold uppercase"
              style={{ fontSize: "1.05cqw", letterSpacing: "0.24em", color: accent }}
            >
              {slide.kind === "title" ? "NoteWise AI" : "Learn less complicated"}
            </p>
            <h2
              className="mt-[2cqw] max-w-[80%] font-display font-semibold leading-[1.08]"
              style={{ fontSize: slide.kind === "closing" ? "5.4cqw" : "4.6cqw" }}
            >
              {slide.title}
            </h2>
            {slide.subtitle ? (
              <p
                className="mt-[1.6cqw] max-w-[70%] font-medium"
                style={{ fontSize: "1.65cqw", color: secondary }}
              >
                {slide.subtitle}
              </p>
            ) : null}
            {slide.body ? (
              <p
                className="mt-[1.4cqw] max-w-[62%] leading-relaxed"
                style={{ fontSize: "1.15cqw", color: muted }}
              >
                {truncate(slide.body, compact ? 120 : 220)}
              </p>
            ) : null}
            <p
              className="mt-[3cqw]"
              style={{ fontSize: "0.95cqw", color: muted }}
            >
              {slide.footnote}
            </p>
          </div>
        </>
      ) : (
        <>
          <div
            className="absolute left-0 top-0 h-[0.9cqw] w-full"
            style={{ background: accent }}
          />
          <div className="flex h-full flex-col px-[6cqw] pb-[3.4cqw] pt-[4.2cqw]">
            <div className="flex items-start justify-between gap-4">
              <h3
                className="max-w-[78%] font-display font-semibold leading-[1.14]"
                style={{ fontSize: slide.title.length > 58 ? "2.6cqw" : "3.1cqw" }}
              >
                {slide.title}
              </h3>
              <span style={{ fontSize: "0.9cqw", color: muted }}>
                {index + 1} / {total}
              </span>
            </div>
            <div
              className="mt-[1.2cqw] h-[0.3cqw] w-[9cqw] rounded-full"
              style={{ background: secondary }}
            />

            {slide.subtitle ? (
              <p
                className="mt-[1.2cqw]"
                style={{ fontSize: "1.05cqw", color: secondary }}
              >
                {slide.subtitle}
              </p>
            ) : null}

            {slide.kind === "diagram" && slide.diagram ? (
              <div className="mt-[1.2cqw] min-h-0 flex-1 overflow-hidden">
                <Diagram spec={slide.diagram} compact />
              </div>
            ) : (
              <div className="mt-[1.6cqw] flex min-h-0 flex-1 flex-col">
                {slide.body ? (
                  <p
                    className="mb-[1.2cqw] leading-relaxed"
                    style={{
                      fontSize: "1.12cqw",
                      color: dark ? ink : "#334155",
                      opacity: dark ? 0.85 : 1,
                    }}
                  >
                    {truncate(slide.body, compact ? 200 : 420)}
                  </p>
                ) : null}

                {slide.bullets && slide.bullets.length > 0 ? (
                  <ul className="space-y-[0.85cqw]">
                    {slide.bullets.slice(0, 6).map((bullet, bulletIndex) => (
                      <li
                        key={bullet}
                        className="flex gap-[0.9cqw] leading-snug"
                        style={{ fontSize: "1.1cqw" }}
                      >
                        {slide.kind === "questions" ? (
                          <span
                            className="shrink-0 font-mono"
                            style={{ color: accent, fontSize: "0.95cqw" }}
                          >
                            {String(bulletIndex + 1).padStart(2, "0")}
                          </span>
                        ) : (
                          <span
                            className="mt-[0.55cqw] h-[0.32cqw] w-[0.32cqw] shrink-0 rounded-full"
                            style={{ background: accent }}
                          />
                        )}
                        <span style={{ color: dark ? ink : "#334155" }}>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}

            {slide.footnote && !compact ? (
              <p
                className="mt-[1cqw]"
                style={{ fontSize: "0.85cqw", color: muted, fontStyle: "italic" }}
              >
                {truncate(slide.footnote, 140)}
              </p>
            ) : null}
          </div>
          <div
            className="absolute bottom-0 left-0 flex w-full items-center justify-between px-[6cqw] py-[1.4cqw]"
            style={{ fontSize: "0.8cqw", color: muted, background: `${surface}66` }}
          >
            <span>NoteWise AI</span>
            <span>{slide.kind.replace("-", " ")}</span>
          </div>
        </>
      )}
    </div>
  );
}
