"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteCardActions } from "@/components/dashboard/site-card-actions";
import { LandingSubscriptionPanel } from "@/components/dashboard/landing-subscription-panel";
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
  onUpdated?: (landing: LandingRecord) => void;
};

export function LandingSiteCard({ landing, onDeleted, onUpdated }: Props) {
  const [extendOpen, setExtendOpen] = useState(false);
  const [current, setCurrent] = useState(landing);

  useEffect(() => {
    setCurrent(landing);
  }, [landing]);

  const handleExtended = useCallback(
    (next: LandingRecord) => {
      setCurrent(next);
      onUpdated?.(next);
      setExtendOpen(false);
    },
    [onUpdated],
  );
  const days = landingDaysLeft(current);
  const initials = landingInitials(current.brandName, current.name);
  const title =
    current.brandName.trim() || current.name.replace(/-/g, " ");

  const obunaLabel =
    days === null ? "—" : days > 0 ? `${days} kun` : "Tugagan";

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-white p-4 transition-colors hover:border-black sm:gap-5 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#7e4312] text-sm font-semibold text-white"
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <h3 className="min-w-0 max-w-full truncate text-base font-semibold text-black">
              {title}
            </h3>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.12em]",
                "border-emerald-200 bg-emerald-50 text-emerald-900",
              )}
            >
              Landing
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-neutral-500">
            weblinker.uz/
            <span className="font-mono">{current.name}</span>
          </p>
          {current.category.trim() ? (
            <p className="mt-0.5 truncate text-xs font-medium text-neutral-700">
              {current.category}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-[color:var(--border)] bg-neutral-50 p-2.5 text-center sm:gap-3 sm:p-3">
        <Meta label="Tur" value="Landing" />
        <Meta label="Oxirgi" value={formatRelative(current.updatedAt)} />
        <Meta
          label="Obuna"
          value={obunaLabel}
          warning={days !== null && days <= 0}
        />
      </div>

      <SiteCardActions
        editHref={`/tahrir?id=${encodeURIComponent(current.id)}`}
        viewHref={`/${current.name}`}
        onExtend={() => setExtendOpen(true)}
        menu={<LandingMenu landing={current} onDeleted={onDeleted} />}
      />

      {extendOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="extend-landing-title">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Yopish"
            onClick={() => setExtendOpen(false)}
          />
          <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[color:var(--border)] bg-white p-4 shadow-xl sm:rounded-2xl sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id="extend-landing-title" className="text-lg font-semibold text-black">
                Obunani uzaytirish
              </h2>
              <button
                type="button"
                onClick={() => setExtendOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black"
                aria-label="Yopish"
              >
                ×
              </button>
            </div>
            <LandingSubscriptionPanel landing={current} onExtended={handleExtended} />
          </div>
        </div>
      ) : null}
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
      <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 sm:text-[10px] sm:tracking-[0.15em]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[11px] font-medium sm:text-xs",
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
