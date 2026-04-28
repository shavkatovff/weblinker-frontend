"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/marketing/logo";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { e164ToDisplay } from "@/lib/phone";
import { clearTokens, getAccessToken } from "@/lib/auth-storage";

type MeUser = {
  number: string;
  fullName: string | null;
  username: string | null;
  balance: number;
};

const SUPPORT_URL = "https://t.me/weblinker_support";

const navItems = [
  { label: "Bosh sahifa", href: "/dashboard", icon: <HomeIcon />, exact: true },
  { label: "Saytlarim", href: "/dashboard/sites", icon: <SitesIcon /> },
  { label: "Aloqa so'rovlari", href: "/dashboard/inbox", icon: <InboxIcon /> },
  { label: "To'lov va obuna", href: "/dashboard/billing", icon: <CardIcon /> },
  { label: "Sozlamalar", href: "/dashboard/settings", icon: <GearIcon /> },
];

function formatUzs(n: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)).replace(/\s/g, " ");
}

function userInitial(u: MeUser) {
  const t = u.fullName?.trim();
  if (t) return t.charAt(0).toUpperCase();
  const d = u.number.replace(/\D/g, "");
  return d.slice(-1) || "?";
}

function userTitle(u: MeUser) {
  if (u.fullName?.trim()) return u.fullName.trim();
  return "Mijoz";
}

function userSubtitle(u: MeUser) {
  if (u.username?.trim()) return `@${u.username.trim()}`;
  return e164ToDisplay(u.number);
}

export function Sidebar() {
  const pathname = usePathname() ?? "";
  return (
    <aside className="hidden h-full min-h-0 w-64 flex-shrink-0 flex-col border-r border-[color:var(--border)] bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-[color:var(--border)] px-5">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigatsiya">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-black text-white"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-black",
                  )}
                >
                  <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-[color:var(--border)] p-2.5">
        <SidebarUserCard />
      </div>
    </aside>
  );
}

function MenuRowLink(props: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={props.href}
      {...(props.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : ({} as { target?: string; rel?: string }))}
      className="flex items-center gap-2.5 rounded-lg py-1.5 pl-0.5 pr-1 text-sm text-neutral-800 transition-colors hover:bg-neutral-50"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
        {props.icon}
      </span>
      <span className="min-w-0 flex-1 font-medium leading-tight">{props.children}</span>
    </a>
  );
}

function MenuRowButton(props: { onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-0.5 pr-1 text-left text-sm text-red-600 transition-colors hover:bg-red-50/80"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
        {props.icon}
      </span>
      <span className="min-w-0 font-medium leading-tight">{props.children}</span>
    </button>
  );
}

function SidebarUserCard() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null | "loading">("loading");

  useEffect(() => {
    if (typeof window === "undefined" || !getAccessToken()) {
      setUser(null);
      return;
    }
    void (async () => {
      try {
        const r = await api<{ user: MeUser }>("/auth/me");
        setUser(r.user);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const onLogout = () => {
    clearTokens();
    router.replace("/login");
  };

  if (user === "loading") {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-3 shadow-sm">
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-200" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-neutral-200" />
            <div className="h-2.5 w-20 rounded bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }
  if (!user) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-3 border-b border-neutral-100 pb-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm font-semibold text-white"
          aria-hidden
        >
          {userInitial(user)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{userTitle(user)}</p>
          <p className="mt-0.5 truncate text-xs text-neutral-500">{userSubtitle(user)}</p>
        </div>
      </div>

      <ul className="mt-1 space-y-0.5 pt-1" role="list">
        <li>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2.5 rounded-lg py-1.5 pl-0.5 pr-1 text-sm text-neutral-800 transition-colors hover:bg-neutral-50"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
              <WalletIcon />
            </span>
            <span className="min-w-0 flex-1 font-medium">Balans +</span>
            <span className="shrink-0 text-xs text-neutral-500" title="so'm">
              {formatUzs(user.balance)} <span className="text-[10px]">so'm</span>
            </span>
          </Link>
        </li>
        <li>
          <MenuRowLink href={SUPPORT_URL} external icon={<HeadsetIcon />}>
            Support
          </MenuRowLink>
        </li>
        <li>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 rounded-lg py-1.5 pl-0.5 pr-1 text-sm text-neutral-800 transition-colors hover:bg-neutral-50"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
              <PersonIcon />
            </span>
            <span className="min-w-0 flex-1 font-medium">Profil</span>
          </Link>
        </li>
        <li className="!mt-1.5 border-t border-neutral-100 pt-1.5">
          <MenuRowButton onClick={onLogout} icon={<LogoutIcon />}>
            Chiqish
          </MenuRowButton>
        </li>
      </ul>
    </div>
  );
}

function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 7.5H14" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 8.2h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 10V8.2C3.5 5.3 5.3 3 8 3s4.5 2.3 4.5 5.2V10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M3.5 10.5C3.5 11.1 3.1 12 2 12v-1.5C3.1 10.5 3.5 9.4 3.5 8.2V8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12.5 10.5C12.5 11.1 12.9 12 14 12v-1.5C12.9 10.5 12.5 9.4 12.5 8.2V8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M3 13.2c.6-1.4 2.1-2.2 5-2.2s4.4.8 5 2.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 2.5H4C3.2 2.5 2.5 3.2 2.5 4V12c0 .8.7 1.5 1.5 1.5H6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M10.5 12l3-4-3-4M4.5 8h8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2 7L7 3L12 7V12H8.5V8.5H5.5V12H2V7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SitesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 5.5h11" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="3.5" cy="4" r="0.5" fill="currentColor" />
      <circle cx="5.2" cy="4" r="0.5" fill="currentColor" />
    </svg>
  );
}
function InboxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2 7L4 2H10L12 7V11.5H2V7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M2 7H5L5.5 8.5H8.5L9 7H12" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1.5" y="3" width="11" height="8" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 1.5v1.8M7 10.7v1.8M1.5 7h1.8M10.7 7h1.8M3.2 3.2l1.3 1.3M9.5 9.5l1.3 1.3M10.8 3.2L9.5 4.5M4.5 9.5L3.2 10.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
