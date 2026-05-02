"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  AdminAlert,
  AdminEmpty,
  AdminPageHeader,
  AdminTableWrap,
  StatusBadge,
  adminTd,
  adminTh,
  adminTr,
} from "@/components/admin/admin-ui";

type PayRow = {
  id: number;
  amount: number;
  status: string;
  merchantTransId: string;
  clickTransId: string | null;
  createdAt: string;
  paidAt: string | null;
  user: {
    id: number;
    number: string;
    fullName: string | null;
    publicId: string;
  };
};

const PAGE = 50;

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<PayRow[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await api<{ items: PayRow[]; total: number }>(
          `/api/admin/payments?take=${PAGE}&skip=${skip}`,
        );
        setItems(r.items ?? []);
        setTotal(r.total ?? 0);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : "Xato");
      }
    })();
  }, [skip]);

  const start = total === 0 ? 0 : skip + 1;
  const end = Math.min(skip + items.length, total);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="To‘lovlar"
        description={`CLICK tranzaksiyalari. Jami yozuvlar: ${total}.`}
      />

      {err ? <AdminAlert>{err}</AdminAlert> : null}

      <AdminTableWrap>
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/90">
              <th className={adminTh}>Vaqt</th>
              <th className={adminTh}>So‘m</th>
              <th className={adminTh}>Holat</th>
              <th className={adminTh}>Foydalanuvchi</th>
              <th className={adminTh}>merchant_trans_id</th>
              <th className={adminTh}>click_trans_id</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className={adminTr}>
                <td className={`${adminTd} whitespace-nowrap text-zinc-700`}>
                  {new Date(p.createdAt).toLocaleString("uz-UZ")}
                  {p.paidAt ? (
                    <span className="mt-1 block text-[11px] text-zinc-500">
                      To‘langan: {new Date(p.paidAt).toLocaleString("uz-UZ")}
                    </span>
                  ) : null}
                </td>
                <td className={`${adminTd} tabular-nums text-base font-semibold text-zinc-900`}>
                  {p.amount.toLocaleString("uz-UZ")}
                </td>
                <td className={adminTd}>
                  <StatusBadge status={p.status} />
                </td>
                <td className={adminTd}>
                  <span className="font-medium">{p.user.number}</span>
                  {p.user.fullName ? (
                    <span className="text-zinc-600"> — {p.user.fullName}</span>
                  ) : null}
                  <div className="mt-1">
                    <Link
                      href={`/gradeadmin/users/${p.user.id}`}
                      className="text-xs font-semibold text-teal-800 underline-offset-2 hover:underline"
                    >
                      Profil
                    </Link>
                  </div>
                </td>
                <td className={`max-w-[180px] truncate ${adminTd} font-mono text-xs text-zinc-600`}>
                  {p.merchantTransId}
                </td>
                <td className={`max-w-[120px] truncate ${adminTd} font-mono text-xs text-zinc-600`}>
                  {p.clickTransId ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !err ? (
          <AdminEmpty title="To‘lovlar yo‘q" hint="CLICK orqali to‘lov kelganda bu yerda ko‘rinadi." />
        ) : null}
      </AdminTableWrap>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-zinc-600">
          {total > 0 ? (
            <>
              Ko‘rsatilmoqda <span className="font-semibold tabular-nums text-zinc-900">{start}–{end}</span> /{" "}
              <span className="font-semibold tabular-nums text-zinc-900">{total}</span>
            </>
          ) : (
            "0 ta yozuv"
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={skip <= 0}
            onClick={() => setSkip((s) => Math.max(0, s - PAGE))}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40"
          >
            Oldingi
          </button>
          <button
            type="button"
            disabled={skip + PAGE >= total}
            onClick={() => setSkip((s) => s + PAGE)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40"
          >
            Keyingi
          </button>
        </div>
      </div>
    </div>
  );
}
