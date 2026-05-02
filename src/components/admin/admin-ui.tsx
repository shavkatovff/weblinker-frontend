import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[color:var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminAlert({
  children,
  variant = "error",
}: {
  children: ReactNode;
  variant?: "error" | "info";
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "error"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-teal-200 bg-teal-50 text-teal-900",
      )}
    >
      {children}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--border)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        padding && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminTableWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const adminTh =
  "px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
export const adminTr =
  "border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80";
export const adminTd = "px-4 py-3 text-[13px] text-zinc-800";

export function AdminEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 10h8M8 14h5M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-700">{title}</p>
      {hint ? <p className="mt-1 max-w-sm text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function AdminLoadingLine() {
  return (
    <div className="flex items-center gap-3 py-12">
      <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-200" />
      <div className="space-y-2">
        <div className="h-3 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-2 w-24 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export function StatusBadge({
  status,
  tone,
}: {
  status: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const t =
    tone ??
    (status === "PAID" || status === "ACTIVE"
      ? "success"
      : status === "PENDING"
        ? "warning"
        : "neutral");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        t === "success" && "bg-emerald-100 text-emerald-800",
        t === "warning" && "bg-amber-100 text-amber-900",
        t === "danger" && "bg-red-100 text-red-800",
        t === "neutral" && "bg-zinc-100 text-zinc-700",
      )}
    >
      {status}
    </span>
  );
}
