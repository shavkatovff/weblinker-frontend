"use client";

import { useState } from "react";
import {
  SocialItem,
  SocialLinks,
  SocialNetwork,
} from "@/lib/store/types";
import { newId } from "@/lib/store/store";
import {
  SOCIAL_NETWORKS,
  SOCIAL_ORDER,
  SocialGlyph,
} from "@/components/sites/social-icons";
import { IconButton, TextInput } from "./fields";

export function SocialEditor({
  value,
  onChange,
}: {
  value: SocialLinks;
  onChange: (next: SocialLinks) => void;
}) {
  const [picking, setPicking] = useState(false);
  const used = new Set(value.map((v) => v.network));
  const available = SOCIAL_ORDER.filter((id) => !used.has(id));

  const updateItem = (id: string, next: Partial<SocialItem>) => {
    onChange(value.map((item) => (item.id === id ? { ...item, ...next } : item)));
  };
  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };
  const addItem = (network: SocialNetwork) => {
    onChange([...value, { id: newId(), network, value: "" }]);
    setPicking(false);
  };

  return (
    <div className="space-y-3">
      {value.length ? (
        <div className="space-y-2">
          {value.map((item) => {
            const meta = SOCIAL_NETWORKS[item.network];
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-white p-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[color:var(--border)] text-black">
                  <SocialGlyph kind={item.network} />
                </span>
                <div className="flex-1">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                    {meta.name}
                  </p>
                  <TextInput
                    prefix={meta.prefix}
                    placeholder={meta.placeholder}
                    value={item.value}
                    onChange={(v) => updateItem(item.id, { value: v })}
                  />
                </div>
                <IconButton onClick={() => removeItem(item.id)} label="O'chirish" destructive>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </IconButton>
              </div>
            );
          })}
        </div>
      ) : null}

      {picking ? (
        <div className="rounded-md border border-[color:var(--border)] bg-neutral-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
              Tarmoq tanlang
            </span>
            <button
              type="button"
              onClick={() => setPicking(false)}
              className="text-xs text-neutral-500 hover:text-black"
            >
              Bekor qilish
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {available.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => addItem(id)}
                className="flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-white px-2.5 py-2 text-xs font-medium text-black transition-colors hover:border-black"
              >
                <SocialGlyph kind={id} />
                {SOCIAL_NETWORKS[id].name}
              </button>
            ))}
          </div>
        </div>
      ) : available.length > 0 ? (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[color:var(--border)] text-sm font-medium text-black transition-colors hover:border-black"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Ijtimoiy tarmoq qo&apos;shish
        </button>
      ) : (
        <p className="rounded-md border border-dashed border-[color:var(--border)] p-3 text-center text-xs text-neutral-500">
          Barcha tarmoqlar qo&apos;shilgan
        </p>
      )}
    </div>
  );
}
