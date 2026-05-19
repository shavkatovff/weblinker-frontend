import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type PromoSiteKind = "vizitka" | "landing" | "generic";

const COPY: Record<
  PromoSiteKind,
  { headline: string; body: string; cta: string }
> = {
  vizitka: {
    headline: "Mobil vizitkangizni yarating",
    body: "Kontaktlar, ijtimoiy tarmoqlar va manzil — bitta sahifada, telefonga mos.",
    cta: "Vizitka yaratish",
  },
  landing: {
    headline: "Landing sahifangizni yarating",
    body: "Hero, menyu, FAQ va aloqa — biznesingiz uchun to‘liq brend sahifasi.",
    cta: "Landing yaratish",
  },
  generic: {
    headline: "O‘z biznes sahifangizni yarating",
    body: "15 daqiqada vizitka yoki landing — dasturchisiz, dizaynersiz, mobilga mos.",
    cta: "Boshlash",
  },
};

/** Jamoat sahifalari (404, expired) uchun Weblinker reklamasi */
export function WeblinkerPublicPromo({
  slug,
  siteKind = "generic",
  className,
}: {
  slug?: string;
  siteKind?: PromoSiteKind;
  className?: string;
}) {
  const ref = slug?.trim();
  const copy = COPY[siteKind];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl border border-black/10 text-white shadow-[0_28px_80px_-32px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800"
      />
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-amber-400/15 blur-3xl"
      />

      <div className="relative border-b border-white/10 px-5 py-6 sm:px-7">
        <div className="flex items-start gap-4">
          <Image
            src="/weblinker.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-2xl bg-white/10 object-contain p-1.5 ring-1 ring-white/10"
          />
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-300/90">
              Weblinker
            </p>
            <p className="mt-0.5 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {copy.headline}
            </p>
          </div>
        </div>
        <p className="mt-4 text-left text-sm leading-relaxed text-white/78">
          {copy.body}
        </p>
      </div>

      <div className="relative flex flex-col gap-2.5 p-5 sm:flex-row sm:p-6">
        <Link
          href="/dashboard/sites/new"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-neutral-100"
        >
          {copy.cta}
        </Link>
        <Link
          href={ref ? `/?ref=${encodeURIComponent(ref)}` : "/"}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-white/25 bg-white/8 px-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/14"
        >
          Batafsil
        </Link>
      </div>
    </div>
  );
}