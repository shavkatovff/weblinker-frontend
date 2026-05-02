"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  {
    href: "/admin",
    label: "Umumiy",
    icon: IconOverview,
    exact: true as boolean,
  },
  { href: "/admin/vizitkas", label: "Vizitkalar", icon: IconSites, exact: false },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: IconUsers, exact: false },
  { href: "/admin/payments", label: "To‘lovlar", icon: IconPayments, exact: false },
  { href: "/admin/settings", label: "Sozlamalar", icon: IconSettings, exact: false },
] as const;

function IconOverview({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M3 9h12M9 3v12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect
        x="2"
        y="2"
        width="14"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function IconSites({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2.5" y="3.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 7h13" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5" cy="5.3" r="0.6" fill="currentColor" />
      <circle cx="7" cy="5.3" r="0.6" fill="currentColor" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3.5 14.5c.8-2 3.2-3 5.5-3s4.7 1 5.5 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPayments({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 8h14" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12.5 11.3h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 1.5v2.2M9 14.3v2.2M16.5 9h-2.2M3.7 9H1.5M14.1 3.9l-1.55 1.55M5.45 12.55L3.9 14.1M14.1 14.1l-1.55-1.55M5.45 5.45L3.9 3.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";

  function navLink(item: (typeof NAV)[number]) {
    const active = item.exact ? path === item.href : path.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "bg-white/[0.12] text-white shadow-[inset_3px_0_0_0_#14b8a6]"
            : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors",
            active ? "text-teal-400" : "text-zinc-500 group-hover:text-zinc-300",
          )}
        />
        {item.label}
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <aside className="relative hidden w-[260px] shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-900 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_-20%,rgba(20,184,166,0.15),transparent)]" />
        <div className="relative flex flex-1 flex-col px-4 pb-8 pt-10">
          <div className="px-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-sm font-bold text-teal-400">
                W
              </span>
              <div>
                <p className="text-[13px] font-semibold tracking-tight text-white">Weblinker</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Admin
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-10 flex flex-col gap-1" aria-label="Admin navigatsiya">
            {NAV.map((item) => navLink(item))}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="opacity-70">
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Dashboard ga qaytish
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-white/90 backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-xs font-bold text-teal-700">
              W
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">Admin</p>
              <p className="truncate text-[11px] text-zinc-500">Weblinker boshqaruvi</p>
            </div>
          </div>
          <nav
            className="flex gap-1.5 overflow-x-auto px-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Admin mobil menyu"
          >
            {NAV.map((item) => {
              const active = item.exact ? path === item.href : path.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              className="ml-auto shrink-0 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              Dashboard
            </Link>
          </nav>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
