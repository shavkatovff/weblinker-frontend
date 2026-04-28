"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UnknownSite } from "@/lib/store/types";
import { trialDaysLeft, deleteSite, duplicateSite } from "@/lib/store/store";
import { downloadSiteQRCode } from "@/components/editor/qr-code";
import { cn } from "@/lib/cn";

export function SiteCard({ site }: { site: UnknownSite }) {
  const days = trialDaysLeft(site);
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-[color:var(--border)] bg-white p-5 transition-colors hover:border-black">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white"
          >
            {site.content.accentInitials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-black">
              {site.content.businessName}
            </h3>
            <p className="truncate text-xs text-neutral-500">
              weblinker.uz/<span className="font-mono">{site.slug}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={site.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-lg border border-[color:var(--border)] bg-neutral-50 p-3 text-center">
        <Meta
          label="Tarif"
          value={site.type === "vizitka" ? "Vizitka" : "Landing"}
        />
        <Meta
          label="Oxirgi"
          value={formatRelative(site.updatedAt)}
        />
        <Meta
          label="Obuna"
          value={days > 0 ? `${days} kun` : "Tugagan"}
          warning={days <= 0}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button href={`/dashboard/sites/${site.id}`} size="sm" className="flex-1">
          Tahrirlash
        </Button>
        <Link
          href={`/${site.slug}`}
          target="_blank"
          className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-[color:var(--border)] px-3 text-sm font-medium text-black transition-colors hover:border-black"
        >
          Ko&apos;rish
        </Link>
        <Menu site={site} />
      </div>
    </article>
  );
}

function Meta({
  label,
  value,
  warning,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xs font-medium",
          warning ? "text-red-700" : "text-black",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: UnknownSite["status"] }) {
  const map: Record<UnknownSite["status"], { label: string; cls: string }> = {
    draft: {
      label: "Qoralama",
      cls: "border-[color:var(--border)] text-neutral-700 bg-white",
    },
    published: {
      label: "Nashrda",
      cls: "border-black bg-black text-white",
    },
    paused: {
      label: "Pauza",
      cls: "border-[color:var(--border)] text-neutral-500 bg-neutral-100",
    },
  };
  const info = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        info.cls,
      )}
    >
      {info.label}
    </span>
  );
}

function Menu({ site }: { site: UnknownSite }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleDuplicate = () => {
    const copy = duplicateSite(site.id);
    setOpen(false);
    if (copy) router.push(`/dashboard/sites/${copy.id}`);
  };

  const handleDownloadQR = () => {
    setOpen(false);
    const url = `${window.location.origin}/${site.slug}`;
    downloadSiteQRCode(url, `weblinker-${site.slug}`).catch(() => {});
  };

  const handleDelete = () => {
    if (
      confirm(
        `"${site.content.businessName}" saytini o'chirib yubormoqchimisiz? Bu amalni qaytarib bo'lmaydi.`,
      )
    ) {
      deleteSite(site.id);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Qo'shimcha amallar"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--border)] text-black transition-colors hover:border-black"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="4" cy="8" r="1.2" fill="currentColor" />
          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
          <circle cx="12" cy="8" r="1.2" fill="currentColor" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-10 w-44 overflow-hidden rounded-lg border border-[color:var(--border)] bg-white shadow-[0_14px_40px_-18px_rgba(0,0,0,0.3)]">
          <MenuButton onClick={handleDownloadQR}>QR yuklash</MenuButton>
          <div className="h-px bg-[color:var(--border)]" />
          <MenuButton onClick={handleDuplicate}>Nusxa olish</MenuButton>
          <div className="h-px bg-[color:var(--border)]" />
          <MenuButton destructive onClick={handleDelete}>
            O&apos;chirish
          </MenuButton>
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({
  onClick,
  destructive,
  children,
}: {
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full px-3 py-2.5 text-left text-sm transition-colors",
        destructive
          ? "text-red-700 hover:bg-red-50"
          : "text-black hover:bg-neutral-50",
      )}
    >
      {children}
    </button>
  );
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "bugun";
  if (days === 1) return "kecha";
  if (days < 7) return `${days} kun oldin`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} hafta oldin`;
  const months = Math.floor(days / 30);
  return `${months} oy oldin`;
}
