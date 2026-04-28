"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const DAY_LABELS = ["Du", "Se", "Cho", "Pa", "Ju", "Sh", "Yak"];
const DAY_NAMES = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

const TIME_OPTIONS = buildTimeOptions();

function buildTimeOptions(): string[] {
  const result: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      result.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return result;
}

type Preset = {
  label: string;
  value: string;
};

const PRESETS: Preset[] = [
  { label: "Du–Sh 09:00–20:00", value: "Du–Sh: 09:00 – 20:00" },
  { label: "Har kuni 09:00–22:00", value: "Har kuni: 09:00 – 22:00" },
  { label: "Du–Ju 09:00–18:00", value: "Du–Ju: 09:00 – 18:00" },
  { label: "24 soat", value: "24 soat" },
  { label: "Kelishuv asosida", value: "Kelishuv asosida" },
];

type Mode = "preset" | "custom";

export function HoursEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const matchedPreset = PRESETS.find((p) => p.value === value);
  const [mode, setMode] = useState<Mode>(matchedPreset || !value ? "preset" : "custom");

  const { days, start, end } = useMemo(() => parseCustom(value), [value]);

  const applyCustom = (nextDays: boolean[], nextStart: string, nextEnd: string) => {
    onChange(formatCustom(nextDays, nextStart, nextEnd));
  };

  const toggleDay = (i: number) => {
    const next = [...days];
    next[i] = !next[i];
    applyCustom(next, start, end);
  };

  return (
    <div className="space-y-3 rounded-md border border-[color:var(--border)] bg-neutral-50 p-3">
      <div className="flex items-center gap-1.5 rounded-md bg-white p-1">
        <ModeTab active={mode === "preset"} onClick={() => setMode("preset")}>
          Tez tanlash
        </ModeTab>
        <ModeTab active={mode === "custom"} onClick={() => setMode("custom")}>
          Moslash
        </ModeTab>
      </div>

      {mode === "preset" ? (
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const selected = value === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onChange(p.value)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "border-black bg-black text-white"
                    : "border-[color:var(--border)] bg-white text-black hover:border-black",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
              Ish kunlari
            </p>
            <div className="flex gap-1">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDay(i)}
                  aria-pressed={days[i]}
                  aria-label={DAY_NAMES[i]}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center rounded-md border text-xs font-medium transition-colors",
                    days[i]
                      ? "border-black bg-black text-white"
                      : "border-[color:var(--border)] bg-white text-neutral-500 hover:border-black hover:text-black",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <TimeSelect
              label="Ochilish"
              value={start}
              onChange={(v) => applyCustom(days, v, end)}
            />
            <TimeSelect
              label="Yopilish"
              value={end}
              onChange={(v) => applyCustom(days, start, v)}
            />
          </div>
        </div>
      )}

      <div className="rounded-md border border-dashed border-[color:var(--border)] bg-white px-3 py-2 text-xs">
        <span className="text-neutral-500">Saytda chiqadi:</span>{" "}
        <span className="font-medium text-black">{value || "—"}</span>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-black text-white"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-black",
      )}
    >
      {children}
    </button>
  );
}

function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-[color:var(--border)] bg-white px-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}

function parseCustom(value: string): { days: boolean[]; start: string; end: string } {
  const fallback = {
    days: [true, true, true, true, true, true, false],
    start: "09:00",
    end: "20:00",
  };

  if (!value) return fallback;

  const timeMatch = value.match(/(\d{1,2}:\d{2})\s*[–\-—]\s*(\d{1,2}:\d{2})/);
  const start = timeMatch ? normalizeTime(timeMatch[1]) : fallback.start;
  const end = timeMatch ? normalizeTime(timeMatch[2]) : fallback.end;

  const lower = value.toLowerCase();
  const empty: boolean[] = [false, false, false, false, false, false, false];

  if (lower.includes("har kuni")) {
    return { days: [true, true, true, true, true, true, true], start, end };
  }
  if (lower.includes("dam olish")) {
    return { days: empty, start, end };
  }

  const colonIdx = value.indexOf(":");
  const dayPortion = (colonIdx !== -1 ? value.slice(0, colonIdx) : value).trim();
  if (!dayPortion) return fallback;

  const days = [...empty];

  const rangeMatch = dayPortion.match(/^([^\s–\-—,;]+)\s*[–\-—]\s*([^\s–\-—,;]+)$/);
  if (rangeMatch) {
    const startIdx = labelIndex(rangeMatch[1]);
    const endIdx = labelIndex(rangeMatch[2]);
    if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
      for (let i = startIdx; i <= endIdx; i++) days[i] = true;
      return { days, start, end };
    }
  }

  const parts = dayPortion.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
  let found = false;
  for (const p of parts) {
    const idx = labelIndex(p);
    if (idx !== -1) {
      days[idx] = true;
      found = true;
    }
  }
  if (found) return { days, start, end };

  return fallback;
}

function labelIndex(raw: string): number {
  const norm = raw.toLowerCase().replace(/\s+/g, "");
  return DAY_LABELS.findIndex((l) => l.toLowerCase() === norm);
}

function normalizeTime(raw: string): string {
  const [h, m] = raw.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function formatCustom(days: boolean[], start: string, end: string): string {
  const count = days.filter(Boolean).length;
  if (count === 0) return "Dam olish";
  if (count === 7) return `Har kuni: ${start} – ${end}`;

  const firstIdx = days.findIndex(Boolean);
  const lastIdx = days.lastIndexOf(true);
  const contiguous = days
    .slice(firstIdx, lastIdx + 1)
    .every((d) => d);

  if (contiguous) {
    return `${DAY_LABELS[firstIdx]}–${DAY_LABELS[lastIdx]}: ${start} – ${end}`;
  }

  const active = days
    .map((d, i) => (d ? DAY_LABELS[i] : null))
    .filter(Boolean)
    .join(", ");
  return `${active}: ${start} – ${end}`;
}
