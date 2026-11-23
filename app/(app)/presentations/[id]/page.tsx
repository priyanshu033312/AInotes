import { notFound } from "next/navigation";
import { PresentationWorkbench } from "@/components/presentation/presentation-workbench";
import { aiStatus } from "@/lib/ai";
import { getDocument } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocument(id);
  return { title: doc?.study ? `${doc.study.title} · Deck` : "Presentation" };
}

export default async function PresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) notFound();
  if (!doc.study) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">
          No study material yet
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Generate the notes first — the presentation is built from them.
        </p>
        <a
          href={`/workspace/${id}`}
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white"
        >
          Open the workspace
        </a>
      </div>
    );
  }

  return (
    <PresentationWorkbench
      id={doc.id}
      study={doc.study}
      initialTheme={doc.presentation?.theme ?? "modern-professional"}
      initialOverrides={doc.presentation?.slideOverrides ?? {}}
      initialGeneratedAt={doc.presentation?.createdAt}
      aiConfigured={aiStatus().configured}
    />
  );
}
