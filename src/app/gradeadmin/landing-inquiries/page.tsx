"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  AdminAlert,
  AdminEmpty,
  AdminPageHeader,
  AdminTableWrap,
  adminTd,
  adminTh,
  adminTr,
} from "@/components/admin/admin-ui";

type Row = {
  id: number;
  createdAt: string;
  visitorName: string;
  visitorPhone: string;
  visitorTelegram: string | null;
  message: string;
  landingSlug: string;
  landingId: string;
  owner: {
    id: number;
    publicId: string;
    number: string;
    fullName: string | null;
    telegramId: string | null;
  };
};

const PAGE = 50;

export default function AdminLandingInquiriesPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await api<{ items: Row[]; total: number }>(
          `/api/admin/landing-inquiries?take=${PAGE}&skip=${skip}`,
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
        title="Landing arizalari"
        description={`Sayt orqali qoldirilgan arizalar. Jami: ${total}. Egaga Telegram orqali ham yuboriladi.`}
      />

      {err ? <AdminAlert>{err}</AdminAlert> : null}

      {items.length === 0 && !err ? (
        <AdminEmpty
          title="Hali yozuv yo‘q"
          hint="Landing forma orqali birinchi ariza kelganda shu yerda chiqadi."
        />
      ) : null}

      <AdminTableWrap>
        <table className="w-full min-w-[960px] text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/90">
              <th className={adminTh}>Vaqt</th>
              <th className={adminTh}>Sayt</th>
              <th className={adminTh}>Ega</th>
              <th className={adminTh}>Ism</th>
              <th className={adminTh}>Telefon</th>
              <th className={adminTh}>Telegram</th>
              <th className={adminTh}>Izoh</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className={adminTr}>
                <td className={adminTd}>
                  {new Date(r.createdAt).toLocaleString("uz-UZ")}
                </td>
                <td className={adminTd}>
                  <span className="font-mono text-xs">{r.landingSlug}</span>
                </td>
                <td className={adminTd}>
                  <div className="text-xs">
                    <div>{r.owner.fullName ?? "—"}</div>
                    <div className="text-zinc-500">{r.owner.number}</div>
                    <div className="font-mono text-[10px] text-zinc-400">
                      id:{r.owner.id}
                    </div>
                  </div>
                </td>
                <td className={adminTd}>{r.visitorName}</td>
                <td className={adminTd}>{r.visitorPhone}</td>
                <td className={adminTd}>
                  {r.visitorTelegram ? `@${r.visitorTelegram.replace(/^@/, "")}` : "—"}
                </td>
                <td className={cn(adminTd, "max-w-xs truncate text-xs text-zinc-700")}>
                  {r.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableWrap>

      {total > PAGE ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <span>
            {start}–{end} / {total}
          </span>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-40"
            disabled={skip === 0}
            onClick={() => setSkip((s) => Math.max(0, s - PAGE))}
          >
            Oldingi
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-40"
            disabled={skip + PAGE >= total}
            onClick={() => setSkip((s) => s + PAGE)}
          >
            Keyingi
          </button>
        </div>
      ) : null}
    </div>
  );
}
