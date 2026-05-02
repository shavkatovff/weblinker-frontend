"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { AdminAlert, AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";

type VizRow = {
  id: string;
  name: string;
  headline: string | null;
  category: string | null;
  plan: string;
  status: string;
  expiredAt?: string | null;
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

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function AdminVizitkaEditPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<VizRow>>({});
  const [dtLocal, setDtLocal] = useState("");

  useEffect(() => {
    if (!id) return;
    let c = true;
    void (async () => {
      try {
        const r = await api<{ vizitka: VizRow }>(`/api/admin/vizitkas/${encodeURIComponent(id)}`);
        if (c) {
          setForm(r.vizitka);
          setDtLocal(toDatetimeLocalValue(r.vizitka.expiredAt));
        }
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
      const { id: _rowId, ...fields } = form as VizRow & { id?: string };
      void _rowId;
      const payload = {
        ...fields,
        expiredAt:
          dtLocal === "" ? null : new Date(dtLocal).toISOString(),
      };
      await api(`/api/admin/vizitkas/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const r = await api<{ vizitka: VizRow }>(
        `/api/admin/vizitkas/${encodeURIComponent(id)}`,
      );
      setForm(r.vizitka);
      setDtLocal(toDatetimeLocalValue(r.vizitka.expiredAt));
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  }

  async function extendDays(days: number) {
    setSaving(true);
    setErr(null);
    try {
      await api(`/api/admin/vizitkas/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ extendByDays: days }),
      });
      const r = await api<{ vizitka: VizRow }>(
        `/api/admin/vizitkas/${encodeURIComponent(id)}`,
      );
      setForm(r.vizitka);
      setDtLocal(toDatetimeLocalValue(r.vizitka.expiredAt));
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Xato");
    } finally {
      setSaving(false);
    }
  }

  async function clearExpiry() {
    setDtLocal("");
    setSaving(true);
    setErr(null);
    try {
      await api(`/api/admin/vizitkas/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ expiredAt: null }),
      });
      const r = await api<{ vizitka: VizRow }>(
        `/api/admin/vizitkas/${encodeURIComponent(id)}`,
      );
      setForm(r.vizitka);
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Xato");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Vizitka" description="Yuklanmoqda…" />
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }
  if (err && !form.name && !loading) return <AdminAlert>{err}</AdminAlert>;

  const inp =
    "mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/gradeadmin/vizitkas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:text-teal-950"
        >
          <span aria-hidden>←</span> Vizitkalar
        </Link>
        <AdminPageHeader
          title="Vizitka tahriri"
          description={form.name ? `/${form.name}` : undefined}
        />
      </div>

      {err ? <AdminAlert>{err}</AdminAlert> : null}

      <AdminCard>
      <div className="space-y-4">
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
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-4">
          <p className="text-sm font-semibold text-zinc-900">Obuna muddati</p>
          <p className="mt-1 text-xs text-zinc-500">
            Aniq sana yoki tezkun: joriy tugashdan (yoki hozirdan) kun qo‘shiladi.
          </p>
          <label className="mt-3 block text-sm">
            <span className="font-medium text-neutral-700">Tugash vaqti</span>
            <input
              type="datetime-local"
              className={inp}
              value={dtLocal}
              onChange={(e) => setDtLocal(e.target.value)}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void extendDays(7)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50"
            >
              +7 kun
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void extendDays(30)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50"
            >
              +30 kun
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void extendDays(90)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50"
            >
              +90 kun
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void clearExpiry()}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
            >
              Cheksiz (sana yo‘q)
            </button>
          </div>
        </div>
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

      <div className="mt-8 flex gap-3 border-t border-zinc-100 pt-8">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saqlanmoqda…" : "Saqlash"}
        </Button>
      </div>
      </AdminCard>
    </div>
  );
}
