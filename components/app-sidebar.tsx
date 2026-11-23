"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  ListChecks,
  Menu,
  MonitorPlay,
  Settings,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "My Documents", icon: FileText },
  { href: "/notes", label: "My Notes", icon: BookOpen },
  { href: "/presentations", label: "Presentations", icon: MonitorPlay },
  { href: "/revision", label: "Revision", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  aiConfigured,
  aiLabel,
}: {
  aiConfigured: boolean;
  aiLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all",
              active
                ? "bg-accent/12 text-ink"
                : "text-muted hover:bg-white/[0.04] hover:text-ink",
            )}
          >
            {active ? (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
            ) : null}
            <Icon
              className={cn(
                "h-[17px] w-[17px] shrink-0 transition-colors",
                active ? "text-accent-2" : "text-faint group-hover:text-muted",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="px-3 pb-3">
      <Link
        href="/upload"
        className={buttonClass("primary", "md", "mb-3 w-full")}
      >
        <UploadCloud className="h-4 w-4" />
        New upload
      </Link>
      <div className="rounded-xl border border-line-soft bg-white/[0.02] p-3">
        <div className="flex items-center gap-2">
          <BellDot active={aiConfigured} />
          <p className="text-[11.5px] font-medium text-ink">
            {aiConfigured ? "AI connected" : "Local mode"}
          </p>
        </div>
        <p className="mt-1 truncate text-[10.5px] text-faint" title={aiLabel}>
          {aiLabel}
        </p>
        <Link
          href="/settings"
          className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-medium text-accent-2 hover:text-ink"
        >
          <Sparkles className="h-3 w-3" />
          {aiConfigured ? "Manage providers" : "Connect a model"}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line/60 bg-canvas/85 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/dashboard">
          <Logo compact />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/upload" className={buttonClass("primary", "sm")}>
            <UploadCloud className="h-3.5 w-3.5" />
            Upload
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 flex w-[272px] flex-col border-r border-line bg-canvas">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      ) : null}

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line/60 bg-base-soft/30 lg:flex">
        <div className="flex h-[72px] items-center px-5">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}

function BellDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {active ? (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
      ) : null}
      <span
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          active ? "bg-success" : "bg-warn",
        )}
      />
    </span>
  );
}
