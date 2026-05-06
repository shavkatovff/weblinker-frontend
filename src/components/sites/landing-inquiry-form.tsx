"use client";

import { useState } from "react";
import { apiBaseUrl } from "@/lib/api-base";

type Props = {
  slug: string;
};

export function LandingInquiryForm({ slug }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const base = apiBaseUrl();
      const r = await fetch(
        `${base}/landing/public/${encodeURIComponent(slug)}/inquiry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorName: name.trim(),
            visitorPhone: phone.trim(),
            visitorTelegram: telegram.trim() || undefined,
            message: message.trim(),
          }),
        },
      );
      if (!r.ok) {
        let m = await r.text();
        try {
          const j = JSON.parse(m) as { message?: string | string[] };
          if (j.message) {
            m = Array.isArray(j.message) ? j.message.join(", ") : j.message;
          }
        } catch {
          /* raw */
        }
        throw new Error(m || `HTTP ${r.status}`);
      }
      setDone(true);
      setName("");
      setPhone("");
      setTelegram("");
      setMessage("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Yuborilmadi");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-emerald-900">Rahmat! Ariza qabul qilindi.</p>
        <p className="mt-1 text-xs text-emerald-800">
          Tez orada siz bilan bog‘lanamiz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-neutral-800">Ism</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            autoComplete="name"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-800">Telefon</span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            placeholder="+998 …"
            autoComplete="tel"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-neutral-800">Telegram username</span>
        <input
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
          placeholder="@username (ixtiyoriy)"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-neutral-800">Izoh</span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1.5 w-full resize-y rounded-xl border border-[color:var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
        />
      </label>
      {err ? (
        <p className="text-sm text-amber-800" role="alert">
          {err}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-black text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
      >
        {loading ? "Yuborilmoqda…" : "Yuborish"}
      </button>
    </form>
  );
}
