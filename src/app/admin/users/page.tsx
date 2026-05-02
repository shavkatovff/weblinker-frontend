"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

type Row = {
  id: number;
  publicId: string;
  number: string;
  fullName: string | null;
  username: string | null;
  balance: number;
  createdAt: string;
  vizitkaCount: number;
};

export default function AdminUsersPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await api<{ items: Row[] }>("/api/admin/users");
        setItems(r.items ?? []);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : "Xato");
      }
    })();
  }, []);

  if (err) return <p className="text-sm text-red-700">{err}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-black">
        Foydalanuvchilar
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Ro‘yxat, balans va vizitkalar soni.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Ism</th>
              <th className="px-4 py-3">Balans (so‘m)</th>
              <th className="px-4 py-3">Vizitkalar</th>
              <th className="px-4 py-3">Ro‘yxatdan</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{u.id}</td>
                <td className="px-4 py-3">{u.number}</td>
                <td className="px-4 py-3">{u.fullName ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">{u.balance.toLocaleString("uz-UZ")}</td>
                <td className="px-4 py-3">{u.vizitkaCount}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(u.createdAt).toLocaleString("uz-UZ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="font-medium text-black underline-offset-2 hover:underline"
                  >
                    Batafsil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">
            Foydalanuvchi yo‘q.
          </p>
        ) : null}
      </div>
    </div>
  );
}
