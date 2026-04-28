"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSites } from "@/lib/store/hooks";
import { SiteCard } from "./site-card";

export function SitesList() {
  const { sites, ready } = useSites();

  if (!ready) {
    return (
      <div className="grid grid-cols-1 gap-4 px-5 py-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-56 rounded-2xl border border-[color:var(--border)] bg-white"
          />
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="px-5 py-16 lg:px-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-[color:var(--border)] bg-white p-8 text-center">
          <div
            aria-hidden
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 10h10M10 5v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-black">
            Hozircha saytlar yo&apos;q
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Yangi sayt yaratish uchun pastdagi tugmani bosing.
          </p>
          <div className="mt-6">
            <Button href="/dashboard/sites/new" size="lg">
              Birinchi saytni yaratish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 lg:px-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
        <Link
          href="/dashboard/sites/new"
          className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[color:var(--border)] bg-white p-5 text-center transition-colors hover:border-black"
        >
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black text-black"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 9h8M9 5v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-sm font-medium text-black">Yangi sayt yaratish</span>
          <span className="text-xs text-neutral-500">Vizitka yoki Landing</span>
        </Link>
      </div>
    </div>
  );
}
