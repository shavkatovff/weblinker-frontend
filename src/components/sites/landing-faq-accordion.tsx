"use client";

import { useId, useState } from "react";

export type FaqEntry = { id: string; question: string; answer: string };

export function LandingFaqAccordion({
  items,
  accentColor,
}: {
  items: FaqEntry[];
  accentColor: string;
}) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (!items.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const panelId = `${baseId}-panel-${item.id}`;
        const headerId = `${baseId}-header-${item.id}`;
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-sm"
          >
            <button
              type="button"
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-[15px] font-semibold leading-snug text-black">
                {item.question}
              </span>
              <span
                aria-hidden
                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-lg leading-none text-neutral-500"
                style={{ backgroundColor: `${accentColor}14` }}
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className={isOpen ? "border-t border-[color:var(--border)] px-5 pb-5 pt-0" : "hidden"}
            >
              {isOpen ? (
                <p className="pt-4 text-sm leading-relaxed text-neutral-600">{item.answer}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
