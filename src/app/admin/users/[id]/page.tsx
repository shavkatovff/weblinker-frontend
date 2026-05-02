"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
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
  const id =
    typeof params.id === "string" ? parseInt(params.id, 10) : NaN;
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
        const r = await api<{ user: UserRow }>(
          `/api/admin/users/${id}`,
        );
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

  if (!Number.isFinite(id)) {
    return <p className="text-sm text-red-700">Noto‘g‘ri ID</p>;
  }
  if (loading) return <p className="text-sm text-neutral-500">Yuklanmoqda…</p>;
  if (err && !user) return <p className="text-sm text-red-700">{err}</p>;
  if (!user) return null;

  const inp =
    "mt-1 h-10 w-full max-w-xs rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-black";

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/users" className="text-sm text-neutral-600 hover:text-black">
        ← Foydalanuvchilar
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-black">
        Foydalanuvchi
      </h1>
      {err ? <p className="mt-2 text-sm text-red-700">{err}</p> : null}

      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-neutral-500">ID</dt>
          <dd className="mt-0.5 font-mono">{user.id}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">publicId</dt>
          <dd className="mt-0.5 font-mono text-xs break-all">{user.publicId}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Telefon</dt>
          <dd className="mt-0.5">{user.number}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Ism</dt>
          <dd className="mt-0.5">{user.fullName ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Username</dt>
          <dd className="mt-0.5">{user.username ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Telegram ID</dt>
          <dd className="mt-0.5 font-mono">{user.telegramId ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Ro‘yxatdan</dt>
          <dd className="mt-0.5 text-neutral-700">
            {new Date(user.createdAt).toLocaleString("uz-UZ")}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Vizitkalar / to‘lovlar</dt>
          <dd className="mt-0.5">
            {user.vizitkaCount} / {user.paymentCount}
          </dd>
        </div>
      </dl>

      <div className="mt-10 rounded-2xl border border-[color:var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-black">Balansni o‘zgartirish</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Yangi qiymat so‘mda, butun son.
        </p>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-neutral-700">Balans (so‘m)</span>
          <input
            type="number"
            min={0}
            step={1}
            className={inp}
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
          />
        </label>
        <div className="mt-4">
          <Button type="button" onClick={() => void saveBalance()} disabled={saving}>
            {saving ? "Saqlanmoqda…" : "Balansni saqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
