"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  expiryParts,
  formatTodayUz,
  planLabel,
} from "@/components/admin/admin-expiry";
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
  name: string;
  brandName: string;
  category: string;
  plan: string;
  expiredAt: string | null;
  updatedAt: string;
  ownerNumber?: string;
  ownerName?: string | null;
};

export default function AdminLandingsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dayInputs, setDayInputs] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    const r = await api<{ items: Row[] }>("/api/admin/landings");
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

  const summary = useMemo(() => {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    let trial = 0;
    let paid = 0;
    for (const l of items) {
      const exp = l.expiredAt ? new Date(l.expiredAt).getTime() : null;
      if (exp == null || exp > now) active += 1;
      if (exp != null && exp <= now) expired += 1;
      if (l.plan === "10kun") trial += 1;
      if (l.plan === "6oy" || l.plan === "12oy") paid += 1;
    }
    return { total: items.length, active, expired, trial, paid };
  }, [items]);

  async function patchRow(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setErr(null);
    try {
      await api(`/api/admin/landings/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (body.extendByDays != null) {
        setDayInputs((m) => ({ ...m, [id]: "0" }));
      }
      await reload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Xato");
    } finally {
      setBusyId(null);
    }
  }

  async function removeRow(id: string, name: string) {
    if (
      !window.confirm(
        `“${name}” landingini o‘chirish? Bu amal qaytarilmaydi.`,
      )
    ) {
      return;
    }
    setBusyId(id);
    setErr(null);
    try {
      await api(`/api/admin/landings/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await reload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "O‘chirishda xato");
    } finally {
      setBusyId(null);
    }
  }

  const inpDays =
    "h-9 w-14 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium tabular-nums outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50";

  const btnMini =
    "rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-teal-50 hover:border-teal-200 hover:text-teal-900 disabled:opacity-50";

  const linkPrimary =
    "font-semibold text-teal-800 underline-offset-2 hover:text-teal-950 hover:underline";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Landinglar"
        description="Barcha landing sahifalar: obuna, tugash sanasi va muddatni uzaytirish."
        actions={
          <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white px-4 py-3 text-right shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Bugungi sana
            </p>
            <p className="mt-1 max-w-[240px] text-sm font-semibold leading-snug text-zinc-900">
              {formatTodayUz()}
            </p>
          </div>
        }
      />

      {err ? <AdminAlert>{err}</AdminAlert> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Jami", value: summary.total },
          { label: "Faol obuna", value: summary.active },
          { label: "Muddati tugagan", value: summary.expired },
          { label: "Sinov (10 kun)", value: summary.trial },
          { label: "To‘langan paket", value: summary.paid },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {items.length === 0 && !err ? (
        <AdminEmpty title="Landing yo‘q" hint="Foydalanuvchilar landing yaratganda bu yerda ko‘rinadi." />
      ) : (
        <AdminTableWrap>
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className={adminTh}>Manzil</th>
                <th className={adminTh}>Brend</th>
                <th className={adminTh}>Paket</th>
                <th className={adminTh}>Tugash</th>
                <th className={adminTh}>+ kun</th>
                <th className={adminTh}>Ega</th>
                <th className={`${adminTh} text-right`}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => {
                const busy = busyId === l.id;
                const daysVal = dayInputs[l.id] ?? "0";
                const daysNum = parseInt(daysVal, 10);
                const canAddDays =
                  Number.isFinite(daysNum) && daysNum >= 1 && daysNum <= 3650;
                const exp = expiryParts(l.expiredAt ?? undefined);
                return (
                  <tr key={l.id} className={cn(adminTr, busy && "opacity-70")}>
                    <td className={`${adminTd} font-mono text-xs text-zinc-600`}>
                      {l.name}
                    </td>
                    <td className={`${adminTd} max-w-[140px] truncate font-medium`}>
                      {l.brandName || "—"}
                    </td>
                    <td className={adminTd}>
                      <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800">
                        {planLabel(l.plan)}
                      </span>
                    </td>
                    <td className={adminTd}>
                      <p className="text-xs tabular-nums text-zinc-700">{exp.dateLine}</p>
                      {exp.daysLine ? (
                        <p className={cn("mt-0.5 text-[11px] font-medium", exp.daysClass)}>
                          {exp.daysLine}
                        </p>
                      ) : null}
                    </td>
                    <td className={adminTd}>
                      <div className="flex items-center gap-1.5">
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
                              [l.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className={btnMini}
                          disabled={busy || !canAddDays}
                          onClick={() =>
                            void patchRow(l.id, { extendByDays: daysNum })
                          }
                        >
                          Qo‘shish
                        </button>
                      </div>
                    </td>
                    <td className={`${adminTd} max-w-[120px] text-xs text-zinc-600`}>
                      <p className="truncate">{l.ownerNumber ?? "—"}</p>
                      {l.ownerName ? (
                        <p className="truncate text-zinc-500">{l.ownerName}</p>
                      ) : null}
                    </td>
                    <td className={`${adminTd} text-right`}>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/${l.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkPrimary}
                        >
                          Ko‘rish
                        </Link>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-700 hover:underline"
                          disabled={busy}
                          onClick={() => void removeRow(l.id, l.name)}
                        >
                          O‘chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTableWrap>
      )}
    </div>
  );
}
