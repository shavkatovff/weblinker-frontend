"use client";

import { DARK_THEMES, LIGHT_THEMES, ColorThemeId } from "@/lib/store/types";
import { cn } from "@/lib/cn";

type Props = {
  value: ColorThemeId;
  onChange: (id: ColorThemeId) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Row
        label="To'q"
        themes={DARK_THEMES.map((t) => ({ id: t.id, primary: t.primary }))}
        value={value}
        onChange={onChange}
      />
      <Row
        label="Och"
        themes={LIGHT_THEMES.map((t) => ({ id: t.id, primary: t.primary }))}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function Row({
  label,
  themes,
  value,
  onChange,
}: {
  label: string;
  themes: Array<{ id: ColorThemeId; primary: string }>;
  value: ColorThemeId;
  onChange: (id: ColorThemeId) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 flex-shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {themes.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              aria-label={t.id}
              aria-pressed={active}
              className={cn(
                "relative flex h-7 flex-1 items-center justify-center rounded-md border transition-all",
                active
                  ? "border-black ring-1 ring-black ring-offset-1 ring-offset-white"
                  : "border-[color:var(--border)] hover:border-neutral-400",
              )}
              style={{ backgroundColor: t.primary }}
            >
              {active ? <ActiveDot /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActiveDot() {
  return (
    <span
      aria-hidden
      className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.6)]"
    />
  );
}
