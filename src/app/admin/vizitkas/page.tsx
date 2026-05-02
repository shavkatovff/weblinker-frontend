"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  AdminAlert,
  AdminEmpty,
  AdminPageHeader,
  AdminTableWrap,
  adminTd,
  adminTh,
  adminTr,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/cn";

type Row = {
  id: string;
  slug: string;
  status: string;
  vizitkaStatus?: string;
  expiredAt?: string | null;
  updatedAt: string;
  content?: { businessName?: string };
  ownerNumber?: string;
  ownerName?: string | null;
};

const STATUS_OPTS = [
  { v: "DRAFT", label: "Qoralama" },
  { v: "ACTIVE", label: "Faol" },
  { v: "PAUSED", label: "Pauza" },
  { v: "EXPIRED", label: "Tugagan" },
] as const;

function formatEnd(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("uz-UZ", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export default function AdminVizitkasPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dayInputs, setDayInputs] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    const r = await api<{ items: Row[] }>("/api/admin/vizitkas");
    setItems(r.items ?? []);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await reload();
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : "Xato");
      }
    })();
  }, [reload]);

  async function patchRow(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setErr(null);
    try {
      await api(`/api/admin/vizitkas/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await reload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Xato");
    } finally {
      setBusyId(null);
    }
  }

  async function removeRow(id: string, slug: string) {
    if (
      !window.confirm(
        `“${slug}” vizitkasini o‘chirish? Bu amal qaytarilmaydi.`,
      )
    ) {
      return;
    }
    setBusyId(id);
    setErr(null);
    try {
      await api(`/api/admin/vizitkas/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await reload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "O‘chirishda xato");
    } finally {
      setBusyId(null);
    }
  }

  const selCls =
    "h-9 max-w-[148px] rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-800 shadow-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50";

  const inpDays =
    "h-9 w-14 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium tabular-nums outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50";

  const btnMini =
    "rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-teal-50 hover:border-teal-200 hover:text-teal-900 disabled:opacity-50";

  const linkPrimary =
    "font-semibold text-teal-800 underline-offset-2 hover:text-teal-950 hover:underline";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Vizitkalar"
        description="Barcha saytlar: holat, obuna tugashi, muddatni uzaytirish va o‘chirish."
      />

      {err ? <AdminAlert>{err}</AdminAlert> : null}

      <AdminTableWrap>
        <table className="w-full min-w-[880px] text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/90">
              <th className={adminTh}>Manzil</th>
              <th className={adminTh}>Nomi</th>
              <th className={adminTh}>Holat</th>
              <th className={adminTh}>Tugash</th>
              <th className={adminTh}>+ kun</th>
              <th className={adminTh}>Yangilangan</th>
              <th className={`${adminTh} text-right`}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => {
              const st = v.vizitkaStatus ?? v.status;
              const busy = busyId === v.id;
              const daysVal = dayInputs[v.id] ?? "30";
              return (
                <tr key={v.id} className={cn(adminTr, busy && "opacity-70")}>
                  <td className={`${adminTd} font-mono text-xs text-zinc-600`}>{v.slug}</td>
                  <td className={`${adminTd} max-w-[160px] truncate font-medium`}>
                    {v.content?.businessName ?? "—"}
                  </td>
                  <td className={adminTd}>
                    <select
                      className={selCls}
                      disabled={busy}
                      value={
                        STATUS_OPTS.some((o) => o.v === st) ? st : "DRAFT"
                      }
                      onChange={(e) =>
                        void patchRow(v.id, { status: e.target.value })
                      }
                    >
                      {STATUS_OPTS.map((o) => (
                        <option key={o.v} value={o.v}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={`${adminTd} whitespace-nowrap text-zinc-600`}>
                    {formatEnd(v.expiredAt ?? undefined)}
                  </td>
                  <td className={adminTd}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        className={inpDays}
                        disabled={busy}
                        value={daysVal}
                        onChange={(e) =>
                          setDayInputs((m) => ({
                            ...m,
                            [v.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          const n = parseInt(daysVal, 10);
                          if (!Number.isFinite(n) || n < 1) return;
                          void patchRow(v.id, { extendByDays: n });
                        }}
                        className={btnMini}
                      >
                        Qo‘shish
                      </button>
                    </div>
                  </td>
                  <td className={`${adminTd} whitespace-nowrap text-xs text-zinc-500`}>
                    {new Date(v.updatedAt).toLocaleString("uz-UZ")}
                  </td>
                  <td className={`${adminTd} text-right text-xs`}>
                    <Link
                      href={`/admin/vizitkas/${encodeURIComponent(v.id)}`}
                      className={linkPrimary}
                    >
                      Tahrir
                    </Link>
                    <span className="mx-1.5 text-zinc-300">·</span>
                    <a
                      href={`/${encodeURIComponent(v.slug)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
                    >
                      Sayt
                    </a>
                    <span className="mx-1.5 text-zinc-300">·</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeRow(v.id, v.slug)}
                      className="font-semibold text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 ? (
          <AdminEmpty
            title="Hozircha vizitka yo‘q"
            hint="Mijozlar yangi sayt yaratganda bu yerda ko‘rinadi."
          />
        ) : null}
      </AdminTableWrap>
    </div>
  );
}
