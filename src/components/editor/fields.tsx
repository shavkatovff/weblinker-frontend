"use client";

import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  children,
  error,
}: {
  label?: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-700">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-md border border-[color:var(--border)] bg-white text-sm text-black placeholder:text-neutral-400 transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10";

export function TextInput({
  value,
  onChange,
  placeholder,
  className,
  type = "text",
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  prefix?: string;
}) {
  if (prefix) {
    return (
      <div className="flex h-10 items-center overflow-hidden rounded-md border border-[color:var(--border)] bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/10">
        <span className="flex h-full items-center bg-neutral-50 px-3 font-mono text-xs text-neutral-600">
          {prefix}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("h-full flex-1 bg-transparent px-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none", className)}
        />
      </div>
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(inputBase, "h-10 px-3", className)}
    />
  );
}

export function TextAreaInput({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(inputBase, "resize-y px-3 py-2", className)}
    />
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-b border-[color:var(--border)] p-5 last:border-b-0 sm:p-6">
      <div>
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function IconButton({
  onClick,
  label,
  children,
  destructive,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
        destructive
          ? "border-[color:var(--border)] text-red-700 hover:border-red-700 hover:bg-red-50"
          : "border-[color:var(--border)] text-black hover:border-black",
      )}
    >
      {children}
    </button>
  );
}
