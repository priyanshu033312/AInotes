import Link from "next/link";
import { ArrowRight, BookOpen, Download, FileText, Network } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listDocuments } from "@/lib/db";
import { formatDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My notes" };

export default async function NotesPage() {
  const documents = await listDocuments();
  const withNotes = documents.filter((doc) => doc.study);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Study material"
        title="My notes"
        description="Every generated set of notes, grouped by document. Open the workspace to read, ask questions or regenerate an explanation."
        actions={
          <Link href="/upload" className={buttonClass("outline", "md")}>
            <FileText className="h-4 w-4" />
            Process a new document
          </Link>
        }
      />

      {withNotes.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-line bg-panel text-accent-2">
            <BookOpen className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            No notes yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted">
            Upload a document and choose “Process this document”. Notes appear here
            as soon as the pipeline finishes.
          </p>
          <Link href="/upload" className={buttonClass("primary", "md", "mt-5")}>
            Upload a document
          </Link>
        </Card>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {withNotes.map((doc) => (
            <Card key={doc.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={doc.study?.generatedBy === "ai" ? "accent" : "warn"}>
                    {doc.study?.generatedBy === "ai" ? "AI notes" : "Local"}
                  </Badge>
                  {doc.isSample ? <Badge tone="neutral">sample</Badge> : null}
                </div>
                <span className="text-[10.5px] text-faint">
                  {formatDate(doc.study?.generatedAt ?? doc.createdAt)}
                </span>
              </div>

              <h2 className="mt-3 font-display text-[15px] font-semibold leading-snug text-ink">
                {doc.study?.title}
              </h2>
              <p className="mt-0.5 text-[11px] text-faint">{doc.study?.subject}</p>
              <p className="mt-2.5 line-clamp-3 text-[12px] leading-relaxed text-muted">
                {truncate(doc.study?.overview ?? "", 220)}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md border border-line/60 px-1.5 py-1 text-[10px] text-faint">
                  <BookOpen className="h-3 w-3" />
                  {doc.study?.chapters.length} chapters
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-line/60 px-1.5 py-1 text-[10px] text-faint">
                  <Network className="h-3 w-3" />
                  {doc.study?.diagrams.length} diagrams
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-line/60 px-1.5 py-1 text-[10px] text-faint">
                  {doc.study?.questions.length} questions
                </span>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                <Link
                  href={`/workspace/${doc.id}`}
                  className={buttonClass("primary", "sm")}
                >
                  Open notes
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/workspace/${doc.id}?tab=revision`}
                  className={buttonClass("outline", "sm")}
                >
                  Revision
                </Link>
                <a
                  href={`/api/export/${doc.id}`}
                  className={buttonClass("ghost", "sm")}
                  download
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
