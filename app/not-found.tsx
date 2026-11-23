import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <Logo />
      <span className="mt-10 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-panel text-accent-2">
        <FileQuestion className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
        This page or document does not exist
      </h1>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
        It may have been deleted, or the link is wrong. Your other documents are
        still in the library.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/dashboard" className={buttonClass("primary", "md")}>
          Go to dashboard
        </Link>
        <Link href="/documents" className={buttonClass("outline", "md")}>
          <ArrowLeft className="h-4 w-4" />
          My documents
        </Link>
      </div>
    </div>
  );
}
