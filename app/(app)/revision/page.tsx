import Link from "next/link";
import { ArrowRight, Download, ListChecks, Sigma, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listDocuments } from "@/lib/db";
import { formatDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Revision" };

export default async function RevisionPage() {
  const documents = await listDocuments();
  const withRevision = documents.filter((doc) => doc.study);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Night before the exam"
        title="Revision sheets"
        description="Definitions, formulas, mark-earning points, differences between similar concepts and likely exam topics — one printable page set per document."
        actions={
          <Link href="/upload" className={buttonClass("outline", "md")}>
            <ListChecks className="h-4 w-4" />
            Add a document
          </Link>
        }
      />

      {withRevision.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <h2 className="font-display text-lg font-semibold text-ink">
            No revision material yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted">
            Process a document and its revision sheet is generated automatically.
          </p>
          <Link href="/upload" className={buttonClass("primary", "md", "mt-5")}>
            Upload a document
          </Link>
        </Card>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {withRevision.map((doc) => {
            const revision = doc.study!.revision;
            return (
              <Card key={doc.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-[15px] font-semibold text-ink">
                      {truncate(doc.study!.title, 52)}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-faint">
                      {doc.study!.subject} · updated{" "}
                      {formatDate(doc.study!.generatedAt)}
                    </p>
                  </div>
                  {doc.isSample ? <Badge tone="neutral">sample</Badge> : null}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Definitions", value: revision.definitions.length, icon: ListChecks },
                    { label: "Formulas", value: revision.formulas.length, icon: Sigma },
                    { label: "Exam topics", value: revision.examTopics.length, icon: Target },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-line/60 bg-white/[0.02] px-2.5 py-2"
                      >
                        <Icon className="h-3 w-3 text-accent-2" />
                        <p className="mt-1.5 font-mono text-[15px] font-semibold text-ink">
                          {stat.value}
                        </p>
                        <p className="text-[9.5px] text-faint">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {revision.keyPoints.length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {revision.keyPoints.slice(0, 3).map((point) => (
                      <li
                        key={point}
                        className="flex gap-2 text-[11.5px] leading-relaxed text-muted"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                        {truncate(point, 110)}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/workspace/${doc.id}?tab=revision`}
                    className={buttonClass("primary", "sm")}
                  >
                    Open revision
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <a
                    href={`/api/export/${doc.id}?mode=revision`}
                    className={buttonClass("outline", "sm")}
                    download
                  >
                    <Download className="h-3.5 w-3.5" />
                    Revision PDF
                  </a>
                  <Link
                    href={`/workspace/${doc.id}?tab=questions`}
                    className={buttonClass("ghost", "sm")}
                  >
                    Questions
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
