"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

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

  if (err) return <p className="text-sm text-red-700">{err}</p>;

  const start = total === 0 ? 0 : skip + 1;
  const end = Math.min(skip + items.length, total);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-black">To‘lovlar</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Oxirgi tranzaksiyalar (CLICK). Jami: {total}.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Vaqt</th>
              <th className="px-4 py-3">So‘m</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3">Foydalanuvchi</th>
              <th className="px-4 py-3">merchant_trans_id</th>
              <th className="px-4 py-3">click_trans_id</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                  {new Date(p.createdAt).toLocaleString("uz-UZ")}
                  {p.paidAt ? (
                    <span className="block text-xs text-neutral-500">
                      To‘langan: {new Date(p.paidAt).toLocaleString("uz-UZ")}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums font-medium">
                  {p.amount.toLocaleString("uz-UZ")}
                </td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">
                  <span>{p.user.number}</span>
                  {p.user.fullName ? (
                    <span className="text-neutral-600"> — {p.user.fullName}</span>
                  ) : null}
                  <div className="mt-0.5">
                    <Link
                      href={`/admin/users/${p.user.id}`}
                      className="text-xs text-black underline-offset-2 hover:underline"
                    >
                      Profil
                    </Link>
                  </div>
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs">
                  {p.merchantTransId}
                </td>
                <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs">
                  {p.clickTransId ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">
            To‘lovlar yo‘q.
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-neutral-600">
          {total > 0 ? (
            <>
              {start}–{end} / {total}
            </>
          ) : (
            "0 ta"
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={skip <= 0}
            onClick={() => setSkip((s) => Math.max(0, s - PAGE))}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-medium disabled:opacity-40"
          >
            Oldingi
          </button>
          <button
            type="button"
            disabled={skip + PAGE >= total}
            onClick={() => setSkip((s) => s + PAGE)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-medium disabled:opacity-40"
          >
            Keyingi
          </button>
        </div>
      </div>
    </div>
  );
}
