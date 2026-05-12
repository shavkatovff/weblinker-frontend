"use client";

import { useState } from "react";

const inputBase =
  "mt-1.5 w-full rounded-xl border border-[#20140c]/10 bg-[var(--c-bg)]/60 px-3.5 py-2.5 text-sm text-[#20140c] outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-[#a08c75] focus:border-[var(--c-p-solid)] focus:bg-white focus:ring-2 focus:ring-[var(--c-p-tint)]";

export function DemoContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    setName("");
    setPhone("");
    setTelegram("");
    setMessage("");
  }

  if (done) {
    return (
      <div className="choy-anim-zoom-in rounded-2xl border border-emerald-200 bg-emerald-50/90 px-5 py-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,.35)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m5 12 4.5 4.5L19 7" />
          </svg>
        </div>
        <p className="text-base font-bold text-emerald-900">
          Rahmat! So‘rovingiz qabul qilindi.
        </p>
        <p className="mt-1 text-[13px] text-emerald-800">
          Tez orada siz bilan bog‘lanamiz.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-white/80 px-4 text-xs font-bold text-emerald-900 transition-colors hover:bg-white"
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
          <span className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--c-p-strong)]">
            Ism
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputBase}
            placeholder="Ismingiz"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--c-p-strong)]">
            Telefon
          </span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputBase}
            placeholder="+998 …"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--c-p-strong)]">
          Telegram
        </span>
        <input
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          className={inputBase}
          placeholder="@username yoki username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </label>
      <label className="block text-sm">
        <span className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--c-p-strong)]">
          Xabar
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className={`${inputBase} resize-y leading-relaxed`}
          placeholder="Savol yoki band qilish vaqti…"
        />
      </label>
      <button
        type="submit"
        className="choy-cta inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-extrabold text-white transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] sm:h-[52px] sm:w-auto sm:min-w-[200px] sm:text-[15px]"
        style={{
          background:
            "linear-gradient(135deg, var(--c-p-from), var(--c-p-to))",
          boxShadow: "0 14px 30px var(--c-p-glow)",
        }}
      >
        Yuborish
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}
