"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Foydalanuvchilar"
        description="Ro‘yxatdan o‘tgan mijozlar: telefon, balans va vizitkalar soni."
      />

      {err ? <AdminAlert>{err}</AdminAlert> : null}

      <AdminTableWrap>
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/90">
              <th className={adminTh}>ID</th>
              <th className={adminTh}>Telefon</th>
              <th className={adminTh}>Ism</th>
              <th className={adminTh}>Balans</th>
              <th className={adminTh}>Vizitkalar</th>
              <th className={adminTh}>Ro‘yxatdan</th>
              <th className={`${adminTh} text-right`} />
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className={adminTr}>
                <td className={`${adminTd} font-mono text-xs text-zinc-500`}>{u.id}</td>
                <td className={`${adminTd} font-medium`}>{u.number}</td>
                <td className={adminTd}>{u.fullName ?? "—"}</td>
                <td className={`${adminTd} tabular-nums font-semibold text-zinc-900`}>
                  {u.balance.toLocaleString("uz-UZ")}{" "}
                  <span className="text-xs font-normal text-zinc-500">so‘m</span>
                </td>
                <td className={adminTd}>{u.vizitkaCount}</td>
                <td className={`${adminTd} text-xs text-zinc-500`}>
                  {new Date(u.createdAt).toLocaleString("uz-UZ")}
                </td>
                <td className={`${adminTd} text-right`}>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-sm font-semibold text-teal-800 underline-offset-2 hover:text-teal-950 hover:underline"
                  >
                    Batafsil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !err ? (
          <AdminEmpty title="Foydalanuvchi yo‘q" hint="Ro‘yxat bo‘sh." />
        ) : null}
      </AdminTableWrap>
    </div>
  );
}
