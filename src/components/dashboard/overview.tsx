"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSites } from "@/lib/store/hooks";
import { trialDaysLeft } from "@/lib/store/store";

export function Overview() {
  const { sites, ready } = useSites();

  if (!ready) {
    return <OverviewSkeleton />;
  }

  if (sites.length === 0) {
    return <EmptyOverview />;
  }

  const publishedCount = sites.filter((s) => s.status === "published").length;
  const totalServices = sites.reduce(
    (acc, s) => acc + (s.type === "landing" ? s.content.services.length : 0),
    0,
  );
  const mostRecent = sites[0];
  const avgDaysLeft =
    Math.round(
      sites.reduce((acc, s) => acc + trialDaysLeft(s), 0) / sites.length,
    ) || 0;

  return (
    <div className="space-y-6 px-5 py-6 lg:px-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Saytlar" value={sites.length} />
        <Stat label="Nashr qilingan" value={publishedCount} />
        <Stat label="Xizmatlar" value={totalServices} />
        <Stat
          label="Obuna qolgan"
          value={avgDaysLeft > 0 ? `${avgDaysLeft} kun` : "Tugagan"}
          muted
        />
      </div>

      <TrialBanner />

      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
              Oxirgi tahrirlangan
            </p>
            <p className="mt-1 text-lg font-semibold text-black">
              {mostRecent.content.businessName}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              weblinker.uz/<span className="font-mono">{mostRecent.slug}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              href={`/${mostRecent.slug}`}
              variant="secondary"
              size="sm"
              target="_blank"
            >
              Ko&apos;rish
            </Button>
            <Button href={`/dashboard/sites/${mostRecent.id}`} size="sm">
              Tahrirlash
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickAction
          href="/dashboard/sites/new"
          title="Yangi sayt yaratish"
          hint="Vizitka yoki Landing"
          primary
        />
        <QuickAction
          href="/dashboard/sites"
          title="Saytlarimni boshqarish"
          hint={`${sites.length} ta sayt`}
        />
        <QuickAction
          href="/dashboard/inbox"
          title="Aloqa so'rovlari"
          hint="Telegram'ga yuboriladi"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: number | string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>
      <p
        className={`mt-3 text-3xl font-semibold tracking-tight tabular-nums ${muted ? "text-neutral-700" : "text-black"}`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  hint,
  primary,
}: {
  href: string;
  title: string;
  hint: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "group flex items-start justify-between rounded-2xl border p-5 transition-colors " +
        (primary
          ? "border-black bg-black text-white hover:bg-neutral-800"
          : "border-[color:var(--border)] bg-white text-black hover:border-black")
      }
    >
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p
          className={
            "mt-1 text-xs " +
            (primary ? "text-neutral-300" : "text-neutral-500")
          }
        >
          {hint}
        </p>
      </div>
      <span aria-hidden className="mt-1 text-lg transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

function EmptyOverview() {
  return (
    <div className="px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-[color:var(--border)] bg-white p-8 text-center">
        <div
          aria-hidden
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 10h10M10 5v10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-black">
          Birinchi saytingizni yarating
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          15 daqiqada oddiy vizitka yoki kengaytirilgan landing page'ni ishga
          tushiring. 1 hafta bepul sinov davri ochiladi.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button href="/dashboard/sites/new" size="lg">
            Yangi sayt yaratish
          </Button>
        </div>
      </div>
    </div>
  );
}

function TrialBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black bg-black p-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-neutral-300">
          Bepul sinov
        </p>
        <p className="mt-1 text-sm">
          Sinov davomida barcha imkoniyatlar ochiq. Yoqsa — Click orqali to&apos;laysiz,
          yoqmasa — hech narsa.
        </p>
      </div>
      <Button href="/dashboard/billing" variant="inverse" size="sm">
        To&apos;lovni sozlash
      </Button>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-4 px-5 py-6 lg:px-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-[color:var(--border)] bg-white"
          />
        ))}
      </div>
      <div className="h-20 rounded-2xl border border-[color:var(--border)] bg-white" />
    </div>
  );
}

