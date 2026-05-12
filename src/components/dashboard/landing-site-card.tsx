"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteLanding } from "@/lib/landings/client";
import type { LandingRecord } from "@/lib/landings/types";
import {
  landingDaysLeft,
  landingInitials,
} from "@/lib/landings/dashboard-utils";
import { cn } from "@/lib/cn";

type Props = {
  landing: LandingRecord;
  onDeleted?: () => void;
};

export function LandingSiteCard({ landing, onDeleted }: Props) {
  const days = landingDaysLeft(landing);
  const initials = landingInitials(landing.brandName, landing.name);
  const title =
    landing.brandName.trim() || landing.name.replace(/-/g, " ");

  const obunaLabel =
    days === null ? "—" : days > 0 ? `${days} kun` : "Tugagan";

  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-[color:var(--border)] bg-white p-5 transition-colors hover:border-black">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#7e4312] text-sm font-semibold text-white"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-black">
              {title}
            </h3>
            <p className="truncate text-xs text-neutral-500">
              weblinker.uz/
              <span className="font-mono">{landing.name}</span>
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
            "border-emerald-200 bg-emerald-50 text-emerald-900",
          )}
        >
          Landing
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-lg border border-[color:var(--border)] bg-neutral-50 p-3 text-center">
        <Meta label="Tur" value="Landing sahifa" />
        <Meta label="Oxirgi" value={formatRelative(landing.updatedAt)} />
        <Meta
          label="Obuna"
          value={obunaLabel}
          warning={days !== null && days <= 0}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          href={`/tahrir?id=${encodeURIComponent(landing.id)}`}
          size="sm"
          className="flex-1"
        >
          Tahrirlash
        </Button>
        <Link
          href={`/${landing.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-[color:var(--border)] px-3 text-sm font-medium text-black transition-colors hover:border-black"
        >
          Ko&apos;rish
        </Link>
        <LandingMenu landing={landing} onDeleted={onDeleted} />
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

function LandingMenu({ landing, onDeleted }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!deleteOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setDeleteOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [deleteOpen, deleting]);

  const runDelete = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteLanding(landing.id);
      setDeleteOpen(false);
      onDeleted?.();
      router.refresh();
    } catch (e) {
      setDeleteError(
        e instanceof Error ? e.message : "O'chirishda xato yuz berdi.",
      );
    } finally {
      setDeleting(false);
    }
  }, [landing.id, onDeleted, router]);

  const title =
    landing.brandName.trim() || landing.name.replace(/-/g, " ");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Qo'shimcha amallar"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--border)] text-black transition-colors hover:border-black"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="4" cy="8" r="1.2" fill="currentColor" />
          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
          <circle cx="12" cy="8" r="1.2" fill="currentColor" />
        </svg>
      </button>
      {open ? (
        <div
          className="absolute right-0 top-11 z-10 w-44 overflow-hidden rounded-lg border border-[color:var(--border)] bg-white shadow-[0_14px_40px_-18px_rgba(0,0,0,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="block w-full px-3 py-2.5 text-left text-sm text-red-700 transition-colors hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              setDeleteError(null);
              setDeleteOpen(true);
            }}
          >
            O&apos;chirish
          </button>
        </div>
      ) : null}

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Bekor qilish"
            disabled={deleting}
            onClick={() => !deleting && setDeleteOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-black">
              Landingni o&apos;chirish
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              <span className="font-semibold text-black">{title}</span> (
              <span className="font-mono text-neutral-800">{landing.name}</span>)
              bazadan olib tashlanadi. Keyin bu manzilni boshqa sayt olishi mumkin.
            </p>
            {deleteError ? (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
                className="inline-flex h-10 items-center rounded-md border border-[color:var(--border)] bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void runDelete()}
                className="inline-flex h-10 items-center rounded-md bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "O'chirilmoqda…" : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
