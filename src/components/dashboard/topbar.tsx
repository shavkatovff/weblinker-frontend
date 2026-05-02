"use client";

import type { ReactNode } from "react";
import { LogoMark } from "@/components/marketing/logo";
import { useMobileNav } from "@/components/dashboard/mobile-nav-context";

type Props = {
  title: string;
  breadcrumb?: string;
  actions?: ReactNode;
};

export function Topbar({ title, breadcrumb, actions }: Props) {
  const { mobileOpen, toggleMobile } = useMobileNav();

  return (
    <>
      <div className="flex h-14 items-center gap-3 border-b border-[color:var(--border)] bg-white px-5 lg:hidden">
        <button
          type="button"
          onClick={toggleMobile}
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-neutral-800 outline-none ring-offset-2 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-300"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-mobile-nav"
          aria-label={mobileOpen ? "Menyuni yopish" : "Menyuni ochish"}
        >
          <MenuIcon open={mobileOpen} />
        </button>
        <LogoMark variant="v2" size={24} />
      </div>
      <div className="flex flex-col gap-4 border-b border-[color:var(--border)] bg-white px-5 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-10">
        <div>
          {breadcrumb ? (
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
              {breadcrumb}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            {title}
          </h1>
        </div>
        {actions ? <div className="flex flex-shrink-0 gap-2">{actions}</div> : null}
      </div>
    </>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {open ? (
        <>
          <path
            d="M5 5L17 17M17 5L5 17"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path d="M4 7h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M4 11h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M4 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
