"use client";

import { useState } from "react";

export function DemoContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    setName("");
    setPhone("");
    setMessage("");
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-emerald-900">Rahmat! So‘rovingiz qabul qilindi.</p>
        <p className="mt-1 text-xs text-emerald-800">Tez orada siz bilan bog‘lanamiz.</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-xs font-medium text-emerald-900 underline-offset-2 hover:underline"
        >
          Yana yuborish
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-[#20140c]">Ism</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#b56b25]"
            placeholder="Ismingiz"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-[#20140c]">Telefon</span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#b56b25]"
            placeholder="+998 …"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-[#20140c]">Xabar</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1.5 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#b56b25]"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-full bg-[#b56b25] px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(181,107,37,.28)] transition hover:bg-[#7e4312]"
      >
        Yuborish
      </button>
    </form>
  );
}
