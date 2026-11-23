import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  MonitorPlay,
  Network,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteDocumentButton } from "@/components/delete-document-button";
import { aiStatus } from "@/lib/ai";
import { listDocuments } from "@/lib/db";
import { formatBytes, formatDate, truncate } from "@/lib/utils";
import { kindLabel, statusTone } from "@/lib/labels";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Still studying";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const documents = await listDocuments();
  const status = aiStatus();

  const ready = documents.filter((doc) => doc.status === "ready" && doc.study);
  const chapters = ready.reduce((total, doc) => total + (doc.study?.chapters.length ?? 0), 0);
  const diagrams = ready.reduce((total, doc) => total + (doc.study?.diagrams.length ?? 0), 0);
  const withDecks = ready.filter((doc) => doc.presentation).length;

  const recent = documents.slice(0, 4);
  const recentNotes = ready.slice(0, 3);

  const stats = [
    {
      label: "Documents",
      value: documents.length,
      hint: `${documents.filter((doc) => doc.status === "processing").length} processing`,
      icon: FileText,
    },
    {
      label: "Chapters simplified",
      value: chapters,
      hint: `${ready.length} documents ready`,
      icon: BookOpen,
    },
    {
      label: "Diagrams generated",
      value: diagrams,
      hint: "Flow, mind map, block, compare",
      icon: Network,
    },
    {
      label: "Presentations",
      value: withDecks,
      hint: "Editable .pptx files",
      icon: MonitorPlay,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Workspace"
        title={`${greeting()}.`}
        description={
          documents.length === 0
            ? "Upload your first document and NoteWise will build the notes, diagrams and revision sheet for you."
            : `You have ${ready.length} document${ready.length === 1 ? "" : "s"} with generated study material. Pick up where you left off, or drop a new file.`
        }
        actions={
          <>
            <Link href="/upload" className={buttonClass("primary", "md")}>
              <UploadCloud className="h-4 w-4" />
              Upload document
            </Link>
            {ready[0] ? (
              <Link
                href={`/workspace/${ready[0].id}`}
                className={buttonClass("outline", "md")}
              >
                Resume studying
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </>
        }
      />

      {!status.configured ? (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-warn/25 bg-warn/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            <div>
              <p className="text-[13px] font-medium text-ink">
                Local mode is active — no AI model is connected.
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                NoteWise still extracts and organises your documents, but real
                explanations, analogies and richer diagrams need a model.
              </p>
            </div>
          </div>
          <Link href="/settings" className={buttonClass("outline", "sm", "shrink-0")}>
            Connect a model
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}

      {/* stats */}
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-start justify-between">
                <p className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-faint">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 text-accent-2/80" />
              </div>
              <p className="mt-3 font-display text-[28px] font-semibold leading-none text-ink">
                {stat.value}
              </p>
              <p className="mt-2 text-[11.5px] text-muted">{stat.hint}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        {/* recent documents */}
        <Card>
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-ink">
                Recent documents
              </h2>
              <p className="mt-0.5 text-[11.5px] text-faint">
                Everything you have uploaded on this machine
              </p>
            </div>
            <Link
              href="/documents"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent-2 hover:text-ink"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] text-muted">No documents yet.</p>
              <Link href="/upload" className={buttonClass("primary", "sm", "mt-4")}>
                Upload your first PDF
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {recent.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-base-soft font-mono text-[9.5px] font-semibold text-accent-2">
                    {kindLabel(doc.kind)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {doc.study?.title ?? doc.name}
                      </p>
                      {doc.isSample ? <Badge tone="neutral">sample</Badge> : null}
                    </div>
                    <p className="mt-0.5 truncate text-[11.5px] text-faint">
                      {formatBytes(doc.size)} · {doc.pages}{" "}
                      {doc.kind === "pdf" ? "pages" : "slides"} · {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <Badge tone={statusTone(doc.status)}>{doc.status}</Badge>
                  {doc.study ? (
                    <Link
                      href={`/workspace/${doc.id}`}
                      className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}
                    >
                      Open
                    </Link>
                  ) : null}
                  <DeleteDocumentButton id={doc.id} name={doc.name} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* right rail */}
        <div className="space-y-5">
          <Card className="panel-gradient overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-accent-2" />
                <h2 className="font-display text-[14.5px] font-semibold text-ink">
                  Add study material
                </h2>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                PDF or PPTX up to 25 MB. Extraction happens locally, then your
                configured model writes the notes.
              </p>
              <Link
                href="/upload"
                className={buttonClass("primary", "sm", "mt-4 w-full")}
              >
                Choose a file
              </Link>
              <p className="mt-3 text-center text-[10.5px] text-faint">
                Scanned PDFs need a text layer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-display text-[14.5px] font-semibold text-ink">
                Quick access
              </h2>
              <div className="mt-3 grid gap-2">
                {[
                  { href: "/revision", label: "Revision sheets", icon: Layers },
                  { href: "/notes", label: "Generated notes", icon: BookOpen },
                  { href: "/presentations", label: "Presentations", icon: MonitorPlay },
                  { href: "/documents", label: "All documents", icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between rounded-lg border border-line-soft bg-white/[0.02] px-3 py-2.5 text-[12.5px] text-muted transition hover:border-accent/40 hover:text-ink"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 text-faint group-hover:text-accent-2" />
                        {item.label}
                      </span>
                      <ArrowRight className="h-3 w-3 text-faint" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* notes + presentations */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-ink">
              Previously generated notes
            </h2>
            <Link
              href="/notes"
              className="text-[11.5px] font-medium text-accent-2 hover:text-ink"
            >
              All notes
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-[12.5px] text-muted">
                Notes appear here after a document is processed.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentNotes.map((doc) => (
                <Link key={doc.id} href={`/workspace/${doc.id}`} className="group">
                  <Card className="h-full transition hover:border-accent/40">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone={doc.study?.generatedBy === "ai" ? "accent" : "warn"}>
                          {doc.study?.generatedBy === "ai" ? "AI notes" : "Local"}
                        </Badge>
                        <span className="text-[10.5px] text-faint">
                          {doc.study?.chapters.length} chapters
                        </span>
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-[13.5px] font-medium leading-snug text-ink group-hover:text-accent-2">
                        {doc.study?.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-muted">
                        {truncate(doc.study?.overview ?? "", 120)}
                      </p>
                      <p className="mt-3 flex items-center gap-1 text-[11px] font-medium text-accent-2">
                        Open notes <ArrowRight className="h-3 w-3" />
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-ink">
              Presentations
            </h2>
            <Link
              href="/presentations"
              className="text-[11.5px] font-medium text-accent-2 hover:text-ink"
            >
              All decks
            </Link>
          </div>
          <Card>
            <CardContent className="p-4">
              {ready.length === 0 ? (
                <p className="py-4 text-center text-[12.5px] text-muted">
                  Generate notes first — decks are built from them.
                </p>
              ) : (
                <div className="space-y-2">
                  {ready.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line-soft bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink">
                          {doc.study?.title}
                        </p>
                        <p className="text-[10.5px] text-faint">
                          {doc.presentation
                            ? `${doc.presentation.theme.replace("-", " ")} · ready`
                            : "not generated yet"}
                        </p>
                      </div>
                      <Link
                        href={`/presentations/${doc.id}`}
                        className="shrink-0 rounded-md border border-line px-2 py-1 text-[10.5px] font-medium text-accent-2 hover:border-accent/40"
                      >
                        {doc.presentation ? "Open" : "Build"}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
