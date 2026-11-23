import { notFound } from "next/navigation";
import { PreparePanel } from "@/components/prepare-panel";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { aiStatus } from "@/lib/ai";
import { getDocument } from "@/lib/db";
import type { StudyTab } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocument(id);
  return { title: doc?.study?.title ?? "Study workspace" };
}

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const doc = await getDocument(id);
  if (!doc) notFound();

  if (!doc.study || doc.status !== "ready") {
    return (
      <PreparePanel
        id={doc.id}
        name={doc.name}
        status={doc.status}
        stage={doc.stage}
        error={doc.error}
        isSample={doc.isSample}
      />
    );
  }

  const validTabs: StudyTab[] = ["notes", "original", "visual", "revision", "questions"];
  const initialTab = validTabs.includes(tab as StudyTab) ? (tab as StudyTab) : "notes";

  return (
    <WorkspaceShell
      id={doc.id}
      name={doc.name}
      kind={doc.kind}
      pages={doc.pages}
      size={doc.size}
      createdAt={doc.createdAt}
      isSample={doc.isSample}
      text={doc.text}
      initialStudy={doc.study}
      aiConfigured={aiStatus().configured}
      hasPresentation={Boolean(doc.presentation)}
      initialTab={initialTab}
    />
  );
}
