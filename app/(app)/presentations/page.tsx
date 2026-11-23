import Link from "next/link";
import { Download, MonitorPlay, Presentation, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listDocuments } from "@/lib/db";
import { buildDeck, THEMES } from "@/lib/slides";
import { formatDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Presentations" };

export default async function PresentationsPage() {
  const documents = await listDocuments();
  const ready = documents.filter((doc) => doc.study);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Presentation studio"
        title="Presentations"
        description="Decks are generated from the same study material as the notes — chapters, simplified explanations, diagrams and formulas. Every download is a real, editable .pptx."
        actions={
          <Link href="/upload" className={buttonClass("outline", "md")}>
            <Presentation className="h-4 w-4" />
            New from a document
          </Link>
        }
      />

      {ready.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-line bg-panel text-accent-2">
            <MonitorPlay className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            No decks to build yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted">
            Process a document first. The presentation is assembled from the notes
            and diagrams, so it stays accurate.
          </p>
          <Link href="/upload" className={buttonClass("primary", "md", "mt-5")}>
            Upload a document
          </Link>
        </Card>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ready.map((doc) => {
            const study = doc.study!;
            const deck = buildDeck(study, doc.presentation?.slideOverrides ?? {});
            const theme = THEMES[doc.presentation?.theme ?? "modern-professional"];
            return (
              <Card key={doc.id} className="flex flex-col overflow-hidden">
                <div
                  className="relative flex h-28 items-end p-4"
                  style={{ background: `#${theme.background}` }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1.5"
                    style={{
                      background: `linear-gradient(90deg, #${theme.accent}, #${theme.secondary})`,
                    }}
                  />
                  <div className="absolute inset-0 dot-bg opacity-30" />
                  <div className="relative">
                    <p
                      className="font-display text-[13px] font-semibold leading-snug"
                      style={{ color: `#${theme.ink}` }}
                    >
                      {truncate(study.title, 44)}
                    </p>
                    <p className="mt-0.5 text-[10px]" style={{ color: `#${theme.muted}` }}>
                      {deck.length} slides · {theme.name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between">
                    <Badge tone={doc.presentation ? "success" : "neutral"}>
                      {doc.presentation ? "generated" : "not built"}
                    </Badge>
                    <span className="text-[10px] text-faint">
                      {doc.presentation
                        ? formatDate(doc.presentation.createdAt)
                        : "preview ready"}
                    </span>
                  </div>
                  <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
                    {study.chapters.length} chapter slides,{" "}
                    {Math.min(study.diagrams.length, 4)} diagram slides,{" "}
                    {study.revision.formulas.length} formulas.
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
                    <Link
                      href={`/presentations/${doc.id}`}
                      className={buttonClass("primary", "sm")}
                    >
                      Open studio
                    </Link>
                    <a
                      href={`/api/presentations/${doc.id}?theme=${
                        doc.presentation?.theme ?? "modern-professional"
                      }`}
                      className={buttonClass("outline", "sm")}
                      download
                    >
                      <Download className="h-3.5 w-3.5" />
                      .pptx
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-line/60 bg-panel/40 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-2" />
        <p className="text-[11.5px] leading-relaxed text-muted">
          Four themes ship with NoteWise: minimal academic, modern professional,
          colorful educational and engineering technical. Diagrams are drawn as
          editable PowerPoint shapes, so you can still fix a label before presenting.
        </p>
      </div>
    </div>
  );
}
