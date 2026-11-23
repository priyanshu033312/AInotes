import { AppSidebar } from "@/components/app-sidebar";
import { aiStatus } from "@/lib/ai";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = aiStatus();
  const label = status.configured
    ? `${status.provider} · ${status.model}`
    : "Rule-based analysis (no API key)";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <AppSidebar aiConfigured={status.configured} aiLabel={label} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
