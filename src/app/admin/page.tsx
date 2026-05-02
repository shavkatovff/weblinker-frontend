"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

type Stats = {
  users: number;
  vizitkas: number;
  paymentsTotal: number;
  paymentsPaid: number;
  paidAmountSom: number;
};

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
    return <p className="text-sm text-red-700">{err}</p>;
  }

  if (!stats) {
    return <p className="text-sm text-neutral-500">Yuklanmoqda…</p>;
  }

  const cards = [
    { label: "Foydalanuvchilar", value: stats.users, href: "/admin/users" },
    { label: "Vizitkalar", value: stats.vizitkas, href: "/admin/vizitkas" },
    { label: "To‘lovlar (jami)", value: stats.paymentsTotal, href: "/admin/payments" },
    {
      label: "Muvaffaqiyatli to‘lovlar",
      value: stats.paymentsPaid,
      href: "/admin/payments",
    },
    {
      label: "Tushum (so‘m, PAID)",
      value: stats.paidAmountSom.toLocaleString("uz-UZ"),
      href: "/admin/payments",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-black">Admin panel</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Statistika va boshqaruv bo‘limlari.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-[color:var(--border)] bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {c.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-black">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
