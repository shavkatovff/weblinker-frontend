"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { AdminAlert, AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";

type UserRow = {
  id: number;
  publicId: string;
  number: string;
  fullName: string | null;
  username: string | null;
  telegramId: string | null;
  balance: number;
  createdAt: string;
  vizitkaCount: number;
  paymentCount: number;
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? parseInt(params.id, 10) : NaN;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [user, setUser] = useState<UserRow | null>(null);
  const [balanceInput, setBalanceInput] = useState("");

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let c = true;
    void (async () => {
      try {
        const r = await api<{ user: UserRow }>(`/api/admin/users/${id}`);
        if (c) {
          setUser(r.user);
          setBalanceInput(String(r.user.balance));
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

  async function saveBalance() {
    const n = Number(balanceInput);
    if (!Number.isFinite(n) || n < 0) {
      setErr("Balans 0 yoki undan katta bo‘lishi kerak");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const r = await api<{ user: { balance: number } }>(
        `/api/admin/users/${id}/balance`,
        {
          method: "PATCH",
          body: JSON.stringify({ balance: Math.round(n) }),
        },
      );
      setUser((u) => (u ? { ...u, balance: r.user.balance } : u));
      setBalanceInput(String(r.user.balance));
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "mt-1.5 h-11 w-full max-w-xs rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

  if (!Number.isFinite(id)) {
    return (
      <AdminAlert>
        Noto‘g‘ri foydalanuvchi ID.
      </AdminAlert>
    );
  }
  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Foydalanuvchi" description="Ma’lumotlar yuklanmoqda…" />
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }
  if (err && !user) return <AdminAlert>{err}</AdminAlert>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div>
        <Link
          href="/gradeadmin/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:text-teal-950"
        >
          <span aria-hidden>←</span> Foydalanuvchilar ro‘yxati
        </Link>
        <AdminPageHeader
          title={user.fullName ?? user.number}
          description={`ID ${user.id} · ${user.number}`}
        />
      </div>

      {err ? <AdminAlert>{err}</AdminAlert> : null}

      <AdminCard>
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Profil
        </h2>
        <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-zinc-500">publicId</dt>
            <dd className="mt-1 break-all font-mono text-xs text-zinc-900">{user.publicId}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">Username</dt>
            <dd className="mt-1 text-zinc-900">{user.username ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">Telegram ID</dt>
            <dd className="mt-1 font-mono text-zinc-900">{user.telegramId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">Ro‘yxatdan</dt>
            <dd className="mt-1 text-zinc-800">
              {new Date(user.createdAt).toLocaleString("uz-UZ")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-zinc-500">Vizitkalar / to‘lovlar</dt>
            <dd className="mt-1 font-semibold tabular-nums text-zinc-900">
              {user.vizitkaCount} / {user.paymentCount}
            </dd>
          </div>
        </dl>
      </AdminCard>

      <AdminCard>
        <h2 className="text-sm font-semibold text-zinc-900">Balansni o‘zgartirish</h2>
        <p className="mt-1 text-xs text-zinc-500">Qiymat so‘mda, butun son.</p>
        <label className="mt-5 block text-sm">
          <span className="font-medium text-zinc-700">Balans (so‘m)</span>
          <input
            type="number"
            min={0}
            step={1}
            className={inp}
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
          />
        </label>
        <div className="mt-5">
          <Button type="button" onClick={() => void saveBalance()} disabled={saving}>
            {saving ? "Saqlanmoqda…" : "Balansni saqlash"}
          </Button>
        </div>
      </AdminCard>
    </div>
  );
}
