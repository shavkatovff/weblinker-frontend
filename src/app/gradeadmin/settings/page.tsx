"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { AdminAlert, AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";

type SettingsRow = {
  freePublishDays: number;
  paket6Som: number;
  paket12Som: number;
  landingPaket6Som: number;
  landingPaket12Som: number;
  updatedAt: string;
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [s, setS] = useState<SettingsRow | null>(null);
  const [form, setForm] = useState({
    freePublishDays: "10",
    paket6Som: "75000",
    paket12Som: "125000",
    landingPaket6Som: "780000",
    landingPaket12Som: "1180000",
  });

  const load = useCallback(async () => {
    setErr(null);
    try {
      const r = await api<SettingsRow>("/api/admin/settings");
      setS(r);
      setForm({
        freePublishDays: String(r.freePublishDays),
        paket6Som: String(r.paket6Som),
        paket12Som: String(r.paket12Som),
        landingPaket6Som: String(r.landingPaket6Som),
        landingPaket12Som: String(r.landingPaket12Som),
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
    const paket6Som = parseInt(form.paket6Som, 10);
    const paket12Som = parseInt(form.paket12Som, 10);
    const landingPaket6Som = parseInt(form.landingPaket6Som, 10);
    const landingPaket12Som = parseInt(form.landingPaket12Som, 10);
    const nums = [
      freePublishDays,
      paket6Som,
      paket12Som,
      landingPaket6Som,
      landingPaket12Som,
    ];
    if (!nums.every((n) => Number.isFinite(n) && n >= 1)) {
      setErr("Barcha maydonlar musbat butun son bo‘lishi kerak");
      return;
    }
    if (freePublishDays > 365) {
      setErr("Bepul kunlar 365 dan oshmasin");
      return;
    }
    if (Math.min(paket6Som, paket12Som, landingPaket6Som, landingPaket12Som) < 1000) {
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
          paket6Som,
          paket12Som,
          landingPaket6Som,
          landingPaket12Som,
        }),
      });
      setS(r);
      setForm({
        freePublishDays: String(r.freePublishDays),
        paket6Som: String(r.paket6Som),
        paket12Som: String(r.paket12Som),
        landingPaket6Som: String(r.landingPaket6Som),
        landingPaket12Som: String(r.landingPaket12Som),
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
        description="Bepul sinov muddati, vizitka va landing obuna paketlari (6 va 12 oy, so‘m). Yangi yaratish va to‘lovlarda qo‘llanadi."
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
              Yangi vizitka va landing sinov muddati shu kunlarda belgilanadi.
            </p>
          </label>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Vizitka paketlari
          </p>
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

          <p className="border-t border-zinc-100 pt-5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Landing paketlari
          </p>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">6 oylik paket (so‘m)</span>
            <input
              className={inp}
              type="number"
              min={1000}
              value={form.landingPaket6Som}
              onChange={(e) =>
                setForm((f) => ({ ...f, landingPaket6Som: e.target.value }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">12 oylik paket (so‘m)</span>
            <input
              className={inp}
              type="number"
              min={1000}
              value={form.landingPaket12Som}
              onChange={(e) =>
                setForm((f) => ({ ...f, landingPaket12Som: e.target.value }))
              }
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
