"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

type VizRow = {
  id: string;
  name: string;
  headline: string | null;
  category: string | null;
  plan: string;
  status: string;
  photoUrl: string | null;
  logoUrl: string | null;
  contactNumber: string | null;
  address: string | null;
  workHour: string | null;
  shortDescription: string | null;
  description: string | null;
  templateId: string | null;
  colorThemeId: string | null;
  patternId: string | null;
  mapLink: string | null;
  instagramLink: string | null;
  telegramLink: string | null;
};

const STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED"] as const;

export default function AdminVizitkaEditPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<VizRow>>({});

  useEffect(() => {
    if (!id) return;
    let c = true;
    void (async () => {
      try {
        const r = await api<{ vizitka: VizRow }>(`/api/admin/vizitkas/${encodeURIComponent(id)}`);
        if (c) setForm(r.vizitka);
      } catch (e) {
        if (c) setErr(e instanceof ApiError ? e.message : "Xato");
      } finally {
        if (c) setLoading(false);
      }
    })();
    return () => {
      c = false;
    };
  }, [id]);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      await api(`/api/admin/vizitkas/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      const r = await api<{ vizitka: VizRow }>(
        `/api/admin/vizitkas/${encodeURIComponent(id)}`,
      );
      setForm(r.vizitka);
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Yuklanmoqda…</p>;
  if (err && !form.name) return <p className="text-sm text-red-700">{err}</p>;

  const inp =
    "mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-black";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/vizitkas" className="text-sm text-neutral-600 hover:text-black">
        ← Vizitkalar
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-black">
        Vizitka tahriri
      </h1>
      {err ? <p className="mt-2 text-sm text-red-700">{err}</p> : null}

      <div className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Slug (manzil)</span>
          <input
            className={inp}
            value={form.name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Sarlavha (headline)</span>
          <input
            className={inp}
            value={form.headline ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Holat</span>
          <select
            className={inp}
            value={form.status ?? "DRAFT"}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Kategoriya</span>
          <input
            className={inp}
            value={form.category ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Plan</span>
          <input
            className={inp}
            value={form.plan ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Telefon</span>
          <input
            className={inp}
            value={form.contactNumber ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Manzil</span>
          <input
            className={inp}
            value={form.address ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Ish vaqti</span>
          <input
            className={inp}
            value={form.workHour ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, workHour: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Qisqa tavsif</span>
          <textarea
            className={`${inp} min-h-[72px] py-2`}
            value={form.shortDescription ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Tavsif</span>
          <textarea
            className={`${inp} min-h-[120px] py-2`}
            value={form.description ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">photoUrl (hero)</span>
          <input
            className={inp}
            value={form.photoUrl ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">logoUrl</span>
          <input
            className={inp}
            value={form.logoUrl ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">templateId</span>
          <input
            className={inp}
            value={form.templateId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">colorThemeId</span>
          <input
            className={inp}
            value={form.colorThemeId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, colorThemeId: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">patternId</span>
          <input
            className={inp}
            value={form.patternId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, patternId: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Xarita (mapLink)</span>
          <input
            className={inp}
            value={form.mapLink ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, mapLink: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Instagram</span>
          <input
            className={inp}
            value={form.instagramLink ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, instagramLink: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Telegram</span>
          <input
            className={inp}
            value={form.telegramLink ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, telegramLink: e.target.value }))}
          />
        </label>
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saqlanmoqda…" : "Saqlash"}
        </Button>
      </div>
    </div>
  );
}
