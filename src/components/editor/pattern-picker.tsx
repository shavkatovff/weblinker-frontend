"use client";

import { PATTERNS, PatternId } from "@/lib/store/types";
import { PatternLayer } from "@/components/sites/patterns";
import { cn } from "@/lib/cn";

export function PatternPicker({
  value,
  onChange,
  color = "#000000",
}: {
  value: PatternId;
  onChange: (id: PatternId) => void;
  color?: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {PATTERNS.map((p) => {
        const selected = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={selected}
            className={cn(
              "group flex flex-col overflow-hidden rounded-md border-2 bg-white text-center transition-colors",
              selected
                ? "border-black"
                : "border-[color:var(--border)] hover:border-neutral-400",
            )}
          >
            <div className="relative aspect-square w-full bg-white">
              <PatternLayer pattern={p.id} color={color} />
              {p.id === "none" ? (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Yo&apos;q
                </span>
              ) : null}
            </div>
            <span
              className={cn(
                "px-1 py-1.5 text-[10px] font-medium tracking-wide",
                selected ? "bg-black text-white" : "text-black",
              )}
            >
              {p.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
