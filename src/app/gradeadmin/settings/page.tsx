"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { AdminAlert, AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";

type SettingsRow = {
  freePublishDays: number;
  paket3Som: number;
  paket6Som: number;
  paket12Som: number;
  updatedAt: string;
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [s, setS] = useState<SettingsRow | null>(null);
  const [form, setForm] = useState({
    freePublishDays: "10",
    paket3Som: "37000",
    paket6Som: "57000",
    paket12Som: "97000",
  });

  const load = useCallback(async () => {
    setErr(null);
    try {
      const r = await api<SettingsRow>("/api/admin/settings");
      setS(r);
      setForm({
        freePublishDays: String(r.freePublishDays),
        paket3Som: String(r.paket3Som),
        paket6Som: String(r.paket6Som),
        paket12Som: String(r.paket12Som),
      });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Yuklashda xato");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    const freePublishDays = parseInt(form.freePublishDays, 10);
    const paket3Som = parseInt(form.paket3Som, 10);
    const paket6Som = parseInt(form.paket6Som, 10);
    const paket12Som = parseInt(form.paket12Som, 10);
    if (
      ![freePublishDays, paket3Som, paket6Som, paket12Som].every(
        (n) => Number.isFinite(n) && n >= 1,
      )
    ) {
      setErr("Barcha maydonlar musbat butun son bo‘lishi kerak");
      return;
    }
    if (freePublishDays > 365) {
      setErr("Bepul kunlar 365 dan oshmasin");
      return;
    }
    if (Math.min(paket3Som, paket6Som, paket12Som) < 1000) {
      setErr("Har bir paket narxi kamida 1000 so‘m");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const r = await api<SettingsRow>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          freePublishDays,
          paket3Som,
          paket6Som,
          paket12Som,
        }),
      });
      setS(r);
      setForm({
        freePublishDays: String(r.freePublishDays),
        paket3Som: String(r.paket3Som),
        paket6Som: String(r.paket6Som),
        paket12Som: String(r.paket12Som),
      });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "mt-1.5 h-11 w-full max-w-md rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Sozlamalar" description="Yuklanmoqda…" />
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (err && !s) {
    return <AdminAlert>{err}</AdminAlert>;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Platforma sozlamalari"
        description="Bepul nashr muddati va vizitka obuna paketlari narxlari (so‘m). O‘zgarishlar yangi yaratiladigan vizitka va to‘lovlarda qo‘llanadi."
      />

      {err ? <AdminAlert>{err}</AdminAlert> : null}

      <AdminCard>
        <div className="grid max-w-lg gap-5 sm:grid-cols-1">
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Bepul sinov (kun)</span>
            <input
              className={inp}
              type="number"
              min={1}
              max={365}
              value={form.freePublishDays}
              onChange={(e) => setForm((f) => ({ ...f, freePublishDays: e.target.value }))}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Yangi vizitka uchun bepul muddati shu kunlarda belgilanadi.
            </p>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">3 oylik paket (so‘m)</span>
            <input
              className={inp}
              type="number"
              min={1000}
              value={form.paket3Som}
              onChange={(e) => setForm((f) => ({ ...f, paket3Som: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">6 oylik paket (so‘m)</span>
            <input
              className={inp}
              type="number"
              min={1000}
              value={form.paket6Som}
              onChange={(e) => setForm((f) => ({ ...f, paket6Som: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">12 oylik paket (so‘m)</span>
            <input
              className={inp}
              type="number"
              min={1000}
              value={form.paket12Som}
              onChange={(e) => setForm((f) => ({ ...f, paket12Som: e.target.value }))}
            />
          </label>
        </div>
        {s ? (
          <p className="mt-4 text-xs text-zinc-500">
            So‘nggi yangilanish: {new Date(s.updatedAt).toLocaleString("uz-UZ")}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => void save()} disabled={saving}>
            {saving ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        </div>
      </AdminCard>
    </div>
  );
}
