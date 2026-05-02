"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Umumiy" },
  { href: "/admin/vizitkas", label: "Vizitkalar" },
  { href: "/admin/users", label: "Foydalanuvchilar" },
  { href: "/admin/payments", label: "To‘lovlar" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-56 shrink-0 border-r border-[color:var(--border)] bg-white px-4 py-8 lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
          Admin
        </p>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? path === "/admin"
                : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/dashboard"
          className="mt-8 block text-sm text-neutral-500 underline-offset-2 hover:text-black hover:underline"
        >
          ← Dashboard
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[color:var(--border)] bg-white lg:hidden">
          <div className="flex h-12 items-center px-4">
            <span className="text-sm font-semibold text-black">Admin</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 pt-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? path === "/admin"
                  : path.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    active
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              className="ml-auto shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Dashboard
            </Link>
          </nav>
        </header>
        <main className="flex-1 px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
