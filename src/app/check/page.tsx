"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Field, Section, TextInput } from "@/components/editor/fields";
import { cn } from "@/lib/cn";

type NetworkId =
  | "instagram"
  | "telegram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "x"
  | "threads"
  | "whatsapp"
  | "website";

type Network = {
  id: NetworkId;
  name: string;
  prefix: string;
  placeholder: string;
  domains: string[];
};

const NETWORKS: Network[] = [
  { id: "instagram", name: "Instagram", prefix: "instagram.com/",   placeholder: "username",     domains: ["instagram.com"] },
  { id: "telegram",  name: "Telegram",  prefix: "t.me/",             placeholder: "username",     domains: ["t.me", "telegram.me"] },
  { id: "tiktok",    name: "TikTok",    prefix: "tiktok.com/@",      placeholder: "username",     domains: ["tiktok.com"] },
  { id: "youtube",   name: "YouTube",   prefix: "youtube.com/@",     placeholder: "kanal",        domains: ["youtube.com", "youtu.be"] },
  { id: "facebook",  name: "Facebook",  prefix: "facebook.com/",     placeholder: "sahifa",       domains: ["facebook.com", "fb.com"] },
  { id: "linkedin",  name: "LinkedIn",  prefix: "linkedin.com/in/",  placeholder: "username",     domains: ["linkedin.com"] },
  { id: "x",         name: "X",         prefix: "x.com/",            placeholder: "username",     domains: ["x.com", "twitter.com"] },
  { id: "threads",   name: "Threads",   prefix: "threads.net/@",     placeholder: "username",     domains: ["threads.net"] },
  { id: "whatsapp",  name: "WhatsApp",  prefix: "+",                 placeholder: "998901234567", domains: ["wa.me", "whatsapp.com"] },
  { id: "website",   name: "Veb-sayt",  prefix: "https://",          placeholder: "mysite.uz",    domains: [] },
];

const NETWORK_MAP = Object.fromEntries(NETWORKS.map((n) => [n.id, n])) as Record<
  NetworkId,
  Network
>;

function Glyph({ id, className }: { id: NetworkId | "link" | "plus" | "close"; className?: string }) {
  const p = (d: string) => (
    <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  );
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": true as const,
    className,
  };
  switch (id) {
    case "instagram":
      return (
        <svg {...props}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="11" cy="5" r="0.7" fill="currentColor" />
        </svg>
      );
    case "telegram":
      return <svg {...props}>{p("M2.5 8L13.5 3.5L11.5 13L7 10.3L5.2 12L5.7 9L11.8 4.5")}</svg>;
    case "tiktok":
      return (
        <svg {...props}>
          {p("M9.5 2.5V10.2C9.5 11.5 8.4 12.6 7 12.6C5.7 12.6 4.6 11.6 4.6 10.3C4.6 9 5.7 7.9 7 7.9")}
          {p("M9.5 2.5C9.5 4 10.7 5.2 12.3 5.2")}
        </svg>
      );
    case "youtube":
      return (
        <svg {...props}>
          <rect x="1.5" y="4" width="13" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 6.5L10 8L7 9.5V6.5Z" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return <svg {...props}>{p("M10 4h1.5V2H10c-1.5 0-2.5 1-2.5 2.5V6.5h-1.8v2h1.8v5h2v-5h2L12 6.5h-2V5c0-.5.5-1 1-1")}</svg>;
    case "linkedin":
      return (
        <svg {...props}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          {p("M5 6.5V11M5 4.7V4.8M8 11V7.5C8 6.5 9 6 10 6.5S11 8 11 8V11")}
        </svg>
      );
    case "x":
      return <svg {...props}>{p("M3 3L13 13M13 3L3 13")}</svg>;
    case "threads":
      return <svg {...props}>{p("M4 8C4 5 6 3 8 3S12 4.5 12 7C12 9 10 10.5 8 10C6 9.5 6 7.5 8 7C10 6.5 11 8 11 10C11 12 9 13 7.5 12.5")}</svg>;
    case "whatsapp":
      return <svg {...props}>{p("M3 13L4 10C3 8 3 6 4.5 4.5S8 3 10 4.5S11.5 8 10 9.5S6 10.5 4 10")}</svg>;
    case "website":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
          {p("M2.5 8H13.5M8 2.5C10 5 10 11 8 13.5C6 11 6 5 8 2.5")}
        </svg>
      );
    case "link":
      return <svg {...props}>{p("M6.5 8.5C6 9 6 10 6.5 10.5C7 11 8 11 8.5 10.5L10.5 8.5C11 8 11 7 10.5 6.5M9.5 7.5C10 7 10 6 9.5 5.5C9 5 8 5 7.5 5.5L5.5 7.5C5 8 5 9 5.5 9.5")}</svg>;
    case "plus":
      return <svg {...props}>{p("M8 3.5V12.5M3.5 8H12.5")}</svg>;
    case "close":
      return <svg {...props}>{p("M4 4L12 12M12 4L4 12")}</svg>;
  }
}

function detectNetwork(input: string): NetworkId | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  for (const n of NETWORKS) {
    if (n.id === "website") continue;
    for (const d of n.domains) {
      if (trimmed.includes(d)) return n.id;
    }
  }
  if (/^https?:\/\//.test(trimmed) || /\.[a-z]{2,}/.test(trimmed)) return "website";
  return null;
}

export default function CheckPage() {
  return (
    <main className="bg-neutral-50 pb-24">
      <header className="border-b border-[color:var(--border)] bg-white">
        <Container className="py-10">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 hover:text-black"
          >
            ← Bosh sahifa
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Ijtimoiy tarmoq qo&apos;shish — 5 variant
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
            Har bir variant ishlaydigan prototip sifatida ko&apos;rsatilgan.
            Kerakli UX yondashuvini tanlash uchun sinab ko&apos;ring.
          </p>
        </Container>
      </header>

      <Container className="mt-10 space-y-10">
        <VariantCard
          index={1}
          title="Dinamik ro'yxat + tarmoq tanlash"
          tagline="Tarmoq tanlanadi, keyin handle yoziladi. Cheksiz element."
          pros={["Moslashuvchan", "Qo'shish tartibi saqlanadi", "Ko'p tarmoq qo'llab-quvvatlanadi"]}
          cons={["Ikki bosish kerak", "Bo'sh holatda empty state dizayn qilish kerak"]}
        >
          <VariantOne />
        </VariantCard>

        <VariantCard
          index={2}
          title="Ikonka grid + inline input"
          tagline="Barcha tarmoqlar ikonka tarzida, bosilsa input ochiladi."
          pros={["Vizual", "Bir bosishda tanlash", "Aralash holat ko'rinadi"]}
          cons={["Ekranda joy oladi", "Cheklangan tarmoq ro'yxati"]}
        >
          <VariantTwo />
        </VariantCard>

        <VariantCard
          index={3}
          title="Smart URL input"
          tagline="URL yopishtiriladi — tarmoq domen orqali avto-aniqlanadi."
          pros={["Eng tezkor", "Yopishtirish-odatli foydalanuvchilar uchun ideal"]}
          cons={["Faqat @username qiyin", "Noma'lum domen fallback'ga ketadi"]}
        >
          <VariantThree />
        </VariantCard>

        <VariantCard
          index={4}
          title="Top-4 prefix + Ko'proq"
          tagline="Eng ko'p ishlatiladigan 4 tasi har doim ochiq. Qolganlari yashirin."
          pros={["Tezkor yozish", "Hozirgi UX'ga yaqin", "Asta-sekin murakkablik"]}
          cons={["Tartib qat'iy", "Top-4 ni tanlash muhokama qilinadi"]}
        >
          <VariantFour />
        </VariantCard>

        <VariantCard
          index={5}
          title="Umumiy link list"
          tagline="Ijtimoiy tarmoq ≠ alohida tushuncha. Har qanday havola — sarlavha + URL."
          pros={["Linktree uslubi", "Menyu PDF, xarita, bron linki — bir joyda", "Tartibni almashtirish"]}
          cons={["Struktura yo'qoladi", "Boshqa template'larga moslash qiyinroq"]}
        >
          <VariantFive />
        </VariantCard>
      </Container>
    </main>
  );
}

function VariantCard({
  index,
  title,
  tagline,
  pros,
  cons,
  children,
}: {
  index: number;
  title: string;
  tagline: string;
  pros: string[];
  cons: string[];
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.12)]">
      <header className="flex flex-col gap-2 border-b border-[color:var(--border)] p-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Variant {index}
          </span>
          <h2 className="mt-1 text-xl font-semibold text-black">{title}</h2>
          <p className="mt-1.5 max-w-xl text-sm text-neutral-600">{tagline}</p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-[260px]">
          <div className="flex flex-wrap gap-1.5">
            {pros.map((p) => (
              <span key={p} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                {p}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cons.map((c) => (
              <span key={c} className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600">
                −  {c}
              </span>
            ))}
          </div>
        </div>
      </header>
      <div className="bg-neutral-50 p-6">
        <div className="mx-auto max-w-xl rounded-xl border border-[color:var(--border)] bg-white">
          {children}
        </div>
      </div>
    </article>
  );
}

function VariantOne() {
  type Item = { id: string; network: NetworkId; value: string };
  const [items, setItems] = useState<Item[]>([
    { id: "a", network: "instagram", value: "katov_brand" },
    { id: "b", network: "telegram", value: "katov_brand" },
  ]);
  const [picking, setPicking] = useState(false);

  const available = NETWORKS.filter((n) => !items.find((i) => i.network === n.id));

  return (
    <Section title="Ijtimoiy tarmoqlar">
      <div className="space-y-2">
        {items.map((item) => {
          const net = NETWORK_MAP[item.network];
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-white p-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded border border-[color:var(--border)] text-black">
                <Glyph id={net.id} />
              </span>
              <div className="flex flex-1 items-center overflow-hidden rounded-md border border-[color:var(--border)] focus-within:border-black">
                <span className="bg-neutral-50 px-2 font-mono text-[11px] text-neutral-500">
                  {net.prefix}
                </span>
                <input
                  value={item.value}
                  onChange={(e) =>
                    setItems((arr) =>
                      arr.map((i) => (i.id === item.id ? { ...i, value: e.target.value } : i)),
                    )
                  }
                  placeholder={net.placeholder}
                  className="h-8 flex-1 bg-transparent px-2 text-sm text-black focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setItems((arr) => arr.filter((i) => i.id !== item.id))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--border)] text-neutral-500 hover:border-red-700 hover:text-red-700"
                aria-label="O'chirish"
              >
                <Glyph id="close" />
              </button>
            </div>
          );
        })}
      </div>

      {picking ? (
        <div className="rounded-md border border-[color:var(--border)] bg-white p-2">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Tarmoq tanlang
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {available.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setItems((arr) => [
                    ...arr,
                    { id: Math.random().toString(36).slice(2), network: n.id, value: "" },
                  ]);
                  setPicking(false);
                }}
                className="flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-white px-2 py-1.5 text-xs font-medium text-black transition-colors hover:border-black"
              >
                <Glyph id={n.id} />
                {n.name}
              </button>
            ))}
          </div>
        </div>
      ) : available.length > 0 ? (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[color:var(--border)] text-sm font-medium text-black hover:border-black"
        >
          <Glyph id="plus" />
          Ijtimoiy tarmoq qo&apos;shish
        </button>
      ) : null}
    </Section>
  );
}

function VariantTwo() {
  const [values, setValues] = useState<Partial<Record<NetworkId, string>>>({
    instagram: "katov_brand",
  });
  const [active, setActive] = useState<NetworkId | null>("instagram");

  return (
    <Section title="Ijtimoiy tarmoqlar">
      <div className="grid grid-cols-5 gap-1.5">
        {NETWORKS.map((n) => {
          const selected = values[n.id] !== undefined;
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                setActive(n.id);
                if (!selected) setValues((v) => ({ ...v, [n.id]: "" }));
              }}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border transition-colors",
                isActive
                  ? "border-black bg-black text-white"
                  : selected
                  ? "border-black text-black"
                  : "border-[color:var(--border)] text-neutral-400 hover:border-black hover:text-black",
              )}
              aria-pressed={isActive}
              aria-label={n.name}
            >
              <Glyph id={n.id} />
            </button>
          );
        })}
      </div>

      {active ? (
        <Field label={NETWORK_MAP[active].name}>
          <div className="flex items-center gap-2">
            <TextInput
              prefix={NETWORK_MAP[active].prefix}
              placeholder={NETWORK_MAP[active].placeholder}
              value={values[active] ?? ""}
              onChange={(v) => setValues((old) => ({ ...old, [active]: v }))}
            />
            {values[active] !== undefined ? (
              <button
                type="button"
                onClick={() => {
                  setValues((old) => {
                    const next = { ...old };
                    delete next[active];
                    return next;
                  });
                  setActive(null);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[color:var(--border)] text-neutral-500 hover:border-red-700 hover:text-red-700"
                aria-label="Olib tashlash"
              >
                <Glyph id="close" />
              </button>
            ) : null}
          </div>
        </Field>
      ) : (
        <p className="rounded-md border border-dashed border-[color:var(--border)] p-4 text-center text-xs text-neutral-500">
          Ikonka ustiga bosing
        </p>
      )}
    </Section>
  );
}

function VariantThree() {
  type Entry = { id: string; network: NetworkId | null; raw: string };
  const [entries, setEntries] = useState<Entry[]>([
    { id: "a", network: "instagram", raw: "instagram.com/katov_brand" },
  ]);
  const [draft, setDraft] = useState("");
  const detected = useMemo(() => detectNetwork(draft), [draft]);

  const add = () => {
    if (!draft.trim()) return;
    setEntries((arr) => [
      ...arr,
      { id: Math.random().toString(36).slice(2), network: detected, raw: draft.trim() },
    ]);
    setDraft("");
  };

  return (
    <Section title="Havola qo'shish">
      <Field
        label="URL yoki username"
        hint={
          draft
            ? detected
              ? `${NETWORK_MAP[detected].name} aniqlandi`
              : "Tarmoq aniqlanmadi — umumiy havola sifatida saqlanadi"
            : "instagram.com/username · t.me/... · https://..."
        }
      >
        <div className="flex gap-2">
          <TextInput value={draft} onChange={setDraft} placeholder="instagram.com/katov_brand" />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-black px-4 text-sm font-medium text-white disabled:opacity-40"
          >
            <Glyph id="plus" />
            Qo&apos;shish
          </button>
        </div>
      </Field>

      {detected && draft ? (
        <div className="flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-neutral-50 p-2 text-xs">
          <Glyph id={detected} />
          <span className="font-medium">{NETWORK_MAP[detected].name}</span>
          <span className="text-neutral-500">aniqlandi</span>
        </div>
      ) : null}

      {entries.length ? (
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-white p-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded border border-[color:var(--border)]">
                <Glyph id={e.network ?? "link"} />
              </span>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-semibold text-black">
                  {e.network ? NETWORK_MAP[e.network].name : "Havola"}
                </p>
                <p className="truncate font-mono text-[11px] text-neutral-500">{e.raw}</p>
              </div>
              <button
                type="button"
                onClick={() => setEntries((arr) => arr.filter((x) => x.id !== e.id))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--border)] text-neutral-500 hover:border-red-700 hover:text-red-700"
                aria-label="O'chirish"
              >
                <Glyph id="close" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}

function VariantFour() {
  const TOP: NetworkId[] = ["instagram", "telegram", "youtube", "whatsapp"];
  const REST: NetworkId[] = NETWORKS.map((n) => n.id).filter((id) => !TOP.includes(id));
  const [values, setValues] = useState<Partial<Record<NetworkId, string>>>({
    instagram: "katov_brand",
    telegram: "katov_brand",
  });
  const [expanded, setExpanded] = useState(false);

  const field = (id: NetworkId) => {
    const n = NETWORK_MAP[id];
    return (
      <Field key={id} label={n.name}>
        <TextInput
          prefix={n.prefix}
          placeholder={n.placeholder}
          value={values[id] ?? ""}
          onChange={(v) => setValues((old) => ({ ...old, [id]: v }))}
        />
      </Field>
    );
  };

  return (
    <Section title="Ijtimoiy tarmoqlar">
      {TOP.map(field)}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between rounded-md border border-[color:var(--border)] bg-neutral-50 px-3 py-2 text-xs font-medium text-black hover:border-black"
      >
        <span>{expanded ? "Kamroq" : `Boshqa tarmoqlar (${REST.length})`}</span>
        <span
          className={cn(
            "inline-block transition-transform",
            expanded ? "rotate-180" : "rotate-0",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {expanded ? REST.map(field) : null}
    </Section>
  );
}

function VariantFive() {
  type LinkItem = { id: string; network: NetworkId | "link"; title: string; url: string };
  const [items, setItems] = useState<LinkItem[]>([
    { id: "1", network: "instagram", title: "Instagram", url: "instagram.com/katov_brand" },
    { id: "2", network: "telegram", title: "Telegram kanal", url: "t.me/katov_brand" },
    { id: "3", network: "link", title: "Menyu PDF", url: "katov.uz/menu.pdf" },
  ]);

  const move = (id: string, dir: -1 | 1) => {
    setItems((arr) => {
      const idx = arr.findIndex((x) => x.id === id);
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      const next = [...arr];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const add = () => {
    setItems((arr) => [
      ...arr,
      { id: Math.random().toString(36).slice(2), network: "link", title: "Yangi havola", url: "" },
    ]);
  };

  return (
    <Section title="Havolalar">
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="rounded-md border border-[color:var(--border)] bg-white p-2"
          >
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(item.id, -1)}
                  disabled={idx === 0}
                  className="flex h-4 w-6 items-center justify-center text-neutral-400 hover:text-black disabled:opacity-30"
                  aria-label="Yuqoriga"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M2 6L5 3L8 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => move(item.id, 1)}
                  disabled={idx === items.length - 1}
                  className="flex h-4 w-6 items-center justify-center text-neutral-400 hover:text-black disabled:opacity-30"
                  aria-label="Pastga"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded border border-[color:var(--border)]">
                <Glyph id={item.network} />
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <input
                  value={item.title}
                  onChange={(e) =>
                    setItems((arr) =>
                      arr.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x)),
                    )
                  }
                  placeholder="Sarlavha"
                  className="rounded border border-[color:var(--border)] px-2 py-1 text-sm font-medium text-black placeholder:text-neutral-400 focus:border-black focus:outline-none"
                />
                <input
                  value={item.url}
                  onChange={(e) =>
                    setItems((arr) =>
                      arr.map((x) =>
                        x.id === item.id
                          ? { ...x, url: e.target.value, network: detectNetwork(e.target.value) ?? "link" }
                          : x,
                      ),
                    )
                  }
                  placeholder="URL"
                  className="rounded border border-[color:var(--border)] px-2 py-1 font-mono text-[11px] text-neutral-600 focus:border-black focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setItems((arr) => arr.filter((x) => x.id !== item.id))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[color:var(--border)] text-neutral-500 hover:border-red-700 hover:text-red-700"
                aria-label="O'chirish"
              >
                <Glyph id="close" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[color:var(--border)] text-sm font-medium text-black hover:border-black"
      >
        <Glyph id="plus" />
        Havola qo&apos;shish
      </button>
    </Section>
  );
}
