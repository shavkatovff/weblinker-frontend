"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import { cn } from "@/lib/cn";

type MeUser = { balance: number };

function formatUzs(n: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)).replace(/\s/g, " ");
}

/** Saytlar boshidagi balans (billing) va yangi sayt uchun «+» */
export function TopbarWalletActions({
  className,
}: {
  className?: string;
}) {
  const pathname = usePathname();
  const hideNewPlus = pathname === "/dashboard/sites/new";
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !getAccessToken()) return;
    void (async () => {
      try {
        const r = await api<{ user: MeUser }>("/auth/me");
        setBalance(r.user.balance);
      } catch {
        setBalance(null);
      }
    })();
  }, []);

  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-2.5", className)}>
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-neutral-50 px-3 py-2 text-sm shadow-sm transition-colors hover:bg-neutral-100"
      >
        <WalletGlyph className="h-4 w-4 shrink-0 text-neutral-600" />
        <span className="tabular-nums font-semibold tracking-tight text-neutral-900">
          {balance != null ? (
            <>
              {formatUzs(balance)}{" "}
              <span className="text-xs font-normal text-neutral-500">so&apos;m</span>
            </>
          ) : (
            <span className="inline-block h-4 w-16 animate-pulse rounded bg-neutral-200/90" />
          )}
        </span>
      </Link>
      {!hideNewPlus ? (
        <Link
          href="/dashboard/sites/new"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-sm transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
          aria-label="Yangi sayt yaratish"
          title="Yangi sayt"
        >
          <PlusGlyph className="h-5 w-5" />
        </Link>
      ) : null}
    </div>
  );
}

function WalletGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect
        x="2.5"
        y="5.5"
        width="15"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M2.5 9h15" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

function PlusGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
