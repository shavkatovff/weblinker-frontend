"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/marketing/logo";
import type { UnknownSite } from "@/lib/store/types";
import { SiteRenderer } from "./site-renderer";

function PausedSiteBackdrop({ preview }: { preview?: ReactNode }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {preview ? (
        <div className="absolute inset-[-12%] scale-[1.08] blur-[32px] saturate-[1.12] brightness-[0.92]">
          {preview}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-teal-50/80 to-neutral-100" />
      )}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/82 to-white/94" />
    </div>
  );
}

export function PausedSitePreview({ site }: { site: UnknownSite }) {
  return (
    <div className="min-h-[120vh] w-full bg-white">
      <SiteRenderer site={site} />
    </div>
  );
}

function WeblinkerPromo({ slug }: { slug?: string }) {
  return (
    <div className="mt-6 w-full max-w-md overflow-hidden rounded-3xl border border-black/10 bg-black text-white shadow-[0_20px_60px_-24px_rgba(0,0,0,0.55)]">
      <div className="relative border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/weblinker.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl bg-white/10 object-contain p-1"
          />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Taklif
            </p>
            <p className="text-lg font-semibold tracking-tight">Weblinker</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          15 daqiqada biznes vizitkangiz — kontaktlar, ijtimoiy tarmoqlar va manzil
          bitta sahifada, mobilga mos.
        </p>
      </div>
      <div className="flex flex-col gap-2.5 px-6 py-5 sm:flex-row">
        <Link
          href="/dashboard/sites/new"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-neutral-100"
        >
          O&apos;z saytingizni yarating
        </Link>
        <Link
          href={slug ? `/?ref=${encodeURIComponent(slug)}` : "/"}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Batafsil
        </Link>
      </div>
    </div>
  );
}

type PausedShellProps = {
  businessName: string;
  slug?: string;
  preview?: ReactNode;
  message: ReactNode;
  showSlugHint?: boolean;
};

function PausedSiteShell({
  businessName,
  slug,
  preview,
  message,
  showSlugHint,
}: PausedShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <PausedSiteBackdrop preview={preview} />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/75 p-8 text-center shadow-[0_24px_80px_-28px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200/70">
            <svg
              className="h-7 w-7 text-amber-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 9v6m4-6v6m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Vaqtincha to&apos;xtatilgan
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            {businessName}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">{message}</p>
          {showSlugHint && slug ? (
            <p className="mt-3 font-mono text-xs text-neutral-500">
              weblinker.uz/{slug}
            </p>
          ) : null}
        </div>

        <WeblinkerPromo slug={slug} />

        <Logo className="mt-8 opacity-40 hover:opacity-70" />
      </div>
    </div>
  );
}

export function PausedSiteView({
  businessName,
  preview,
}: {
  businessName: string;
  preview?: ReactNode;
}) {
  return (
    <PausedSiteShell
      businessName={businessName}
      preview={preview}
      message={
        <>
          Bu sayt vaqtincha o&apos;chirilgan. Biznes egasi obunani yangilashi bilan
          qayta ishga tushadi.
        </>
      }
    />
  );
}

export function PausedSiteExpiredView({
  businessName,
  slug,
  preview,
  showSlugHint = true,
}: {
  businessName: string;
  slug: string;
  preview?: ReactNode;
  showSlugHint?: boolean;
}) {
  return (
    <PausedSiteShell
      businessName={businessName}
      slug={slug || undefined}
      preview={preview}
      showSlugHint={false}
      message={
        showSlugHint && slug ? (
          <>
            <span className="font-mono text-neutral-800">weblinker.uz/{slug}</span>{" "}
            manzilidagi bu nomdagi sayt vaqtincha to&apos;xtatilgan.
          </>
        ) : (
          <>Bu nomdagi sayt vaqtincha to&apos;xtatilgan.</>
        )
      }
    />
  );
}
