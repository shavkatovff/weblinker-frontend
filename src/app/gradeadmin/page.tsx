"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  AdminAlert,
  AdminCard,
  AdminLoadingLine,
  AdminPageHeader,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/cn";

type Stats = {
  users: number;
  vizitkas: number;
  paymentsTotal: number;
  paymentsPaid: number;
  paidAmountSom: number;
};

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 18.5c1-2.5 4.5-4 7-4s6 1.5 7 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSites({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9.5h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconReceipt({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M6 3h10v16l-2-1.5L11 19l-3 1.5L6 19V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 8h6M8 11h6M8 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 11l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSom({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="2" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 9.5h18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const s = await api<Stats>("/api/admin/stats");
        setStats(s);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : "Xato");
      }
    })();
  }, []);

  if (err) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Admin panel" description="Statistika va boshqaruv." />
        <AdminAlert>{err}</AdminAlert>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Admin panel" description="Statistika yuklanmoqda…" />
        <AdminCard>
          <AdminLoadingLine />
        </AdminCard>
      </div>
    );
  }

  const cards = [
    {
      label: "Foydalanuvchilar",
      value: stats.users,
      href: "/gradeadmin/users",
      icon: IconUsers,
      accent: "bg-teal-500/15 text-teal-700 ring-teal-500/20",
    },
    {
      label: "Vizitkalar",
      value: stats.vizitkas,
      href: "/gradeadmin/vizitkas",
      icon: IconSites,
      accent: "bg-violet-500/15 text-violet-700 ring-violet-500/20",
    },
    {
      label: "To‘lovlar (jami)",
      value: stats.paymentsTotal,
      href: "/gradeadmin/payments",
      icon: IconReceipt,
      accent: "bg-sky-500/15 text-sky-800 ring-sky-500/20",
    },
    {
      label: "Muvaffaqiyatli to‘lovlar",
      value: stats.paymentsPaid,
      href: "/gradeadmin/payments",
      icon: IconCheck,
      accent: "bg-emerald-500/15 text-emerald-800 ring-emerald-500/20",
    },
    {
      label: "Tushum (so‘m, PAID)",
      value: stats.paidAmountSom.toLocaleString("uz-UZ"),
      href: "/gradeadmin/payments",
      icon: IconSom,
      accent: "bg-amber-500/15 text-amber-900 ring-amber-500/25",
    },
  ] as const;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Umumiy ko‘rinish"
        description="Platformadagi foydalanuvchilar, vizitkalar va CLICK orqali tushgan to‘lovlar."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:border-teal-300/40 hover:shadow-md",
                i === cards.length - 1 && "sm:col-span-2 xl:col-span-3",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {c.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                    {c.value}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
                    c.accent,
                  )}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
              </div>
              <p className="mt-4 text-xs font-medium text-teal-700 opacity-0 transition-opacity group-hover:opacity-100">
                Batafsil →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
