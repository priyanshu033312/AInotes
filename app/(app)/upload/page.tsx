import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { UploadZone } from "@/components/upload-zone";
import { buttonClass } from "@/components/ui/button";
import { aiStatus } from "@/lib/ai";

export const metadata = { title: "Upload a document" };
export const dynamic = "force-dynamic";

export default function UploadPage() {
  const status = aiStatus();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="New study material"
        title="Upload a document"
        description="Drop a PDF or PowerPoint. NoteWise extracts the content, finds the structure, then writes notes, diagrams and a revision sheet you can study from."
        actions={
          <Link href="/dashboard" className={buttonClass("ghost", "md")}>
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        }
      />

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-line/60 bg-panel/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p className="text-[12px] leading-relaxed text-muted">
            Files are validated before anything else happens, stored under{" "}
            <span className="font-mono text-[11px] text-ink">storage/uploads</span>, and
            never executed. Only extracted text is sent to your AI provider.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[11.5px]">
          <Sparkles className="h-3.5 w-3.5 text-accent-2" />
          <span className="text-muted">{status.configured ? "AI mode" : "Local mode"}</span>
          <span className="text-faint">·</span>
          <span className="font-mono text-[11px] text-accent-2">
            {status.configured ? status.model : "rules"}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <UploadZone />
      </div>
    </div>
  );
}
