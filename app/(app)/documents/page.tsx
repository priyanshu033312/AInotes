import Link from "next/link";
import {
  ArrowRight,
  Download,
  FileText,
  MonitorPlay,
  Plus,
  UploadCloud,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteDocumentButton } from "@/components/delete-document-button";
import { listDocuments } from "@/lib/db";
import { kindLabel, statusTone } from "@/lib/labels";
import { formatBytes, formatDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My documents" };

export default async function DocumentsPage() {
  const documents = await listDocuments();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Library"
        title="My documents"
        description="Every PDF and PowerPoint uploaded to this machine, with its real processing state. Deleting a document removes its stored file and generated material."
        actions={
          <Link href="/upload" className={buttonClass("primary", "md")}>
            <Plus className="h-4 w-4" />
            Upload document
          </Link>
        }
      />

      {documents.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-line bg-panel text-accent-2">
            <UploadCloud className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            Nothing uploaded yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted">
            Add a PDF or PPTX and NoteWise will build the notes, diagrams and
            revision sheet from it.
          </p>
          <Link href="/upload" className={buttonClass("primary", "md", "mt-5")}>
            Upload your first document
          </Link>
        </Card>
      ) : (
        <div className="mt-6 space-y-2.5">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-base-soft font-mono text-[9.5px] font-semibold text-accent-2">
                  {kindLabel(doc.kind)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={
                        doc.study ? `/workspace/${doc.id}` : `/workspace/${doc.id}`
                      }
                      className="truncate text-[13.5px] font-medium text-ink hover:text-accent-2"
                    >
                      {doc.study?.title ?? doc.name}
                    </Link>
                    {doc.isSample ? <Badge tone="neutral">sample</Badge> : null}
                    <Badge tone={statusTone(doc.status)}>{doc.status}</Badge>
                    {doc.presentation ? <Badge tone="cyan">deck</Badge> : null}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-faint">
                    {doc.name} · {formatBytes(doc.size)} · {doc.pages}{" "}
                    {doc.kind === "pdf" ? "pages" : "slides"} · added{" "}
                    {formatDate(doc.createdAt)}
                    {doc.study
                      ? ` · ${doc.study.chapters.length} chapters, ${doc.study.diagrams.length} diagrams`
                      : ""}
                  </p>
                  {doc.error ? (
                    <p className="mt-1 text-[11px] text-danger">
                      {truncate(doc.error, 140)}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/workspace/${doc.id}`}
                    className={buttonClass("outline", "sm")}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {doc.study ? "Notes" : "Process"}
                  </Link>
                  {doc.study ? (
                    <>
                      <Link
                        href={`/presentations/${doc.id}`}
                        className={buttonClass("ghost", "sm")}
                      >
                        <MonitorPlay className="h-3.5 w-3.5" />
                        Deck
                      </Link>
                      <a
                        href={`/api/export/${doc.id}`}
                        className={buttonClass("ghost", "sm")}
                        download
                        title="Download notes PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    </>
                  ) : null}
                  <DeleteDocumentButton id={doc.id} name={doc.name} />
                </div>
              </div>
            </Card>
          ))}

          <Link
            href="/upload"
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line/70 py-4 text-[12px] text-faint transition hover:border-accent/40 hover:text-accent-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another document
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
