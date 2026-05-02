"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  status: string;
  updatedAt: string;
  content?: { businessName?: string };
  ownerNumber?: string;
  ownerName?: string | null;
};

export default function AdminVizitkasPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await api<{ items: Row[] }>("/api/admin/vizitkas");
        setItems(r.items ?? []);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : "Xato");
      }
    })();
  }, []);

  if (err) return <p className="text-sm text-red-700">{err}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-black">Vizitkalar</h1>
      <p className="mt-1 text-sm text-neutral-600">Barcha saytlar, oxirgi yangilanish bo‘yicha.</p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Manzil</th>
              <th className="px-4 py-3">Nomi</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3">Ega (tel)</th>
              <th className="px-4 py-3">Yangilangan</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{v.slug}</td>
                <td className="px-4 py-3">{v.content?.businessName ?? "—"}</td>
                <td className="px-4 py-3 capitalize">{v.status}</td>
                <td className="px-4 py-3">{v.ownerNumber ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(v.updatedAt).toLocaleString("uz-UZ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/vizitkas/${encodeURIComponent(v.id)}`}
                    className="font-medium text-black underline-offset-2 hover:underline"
                  >
                    Tahrirlash
                  </Link>
                  {" · "}
                  <a
                    href={`/${encodeURIComponent(v.slug)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 hover:text-black"
                  >
                    Ochish
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">Hozircha vizitka yo‘q.</p>
        ) : null}
      </div>
    </div>
  );
}
