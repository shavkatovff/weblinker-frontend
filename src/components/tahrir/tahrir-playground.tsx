"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { DemoChoyxonaSite } from "@/components/demo/demo-choyxona-site";
import type { DemoChoyxonaBlocks, DemoChoyxonaContent } from "@/lib/demo-choyxona/types";
import { defaultDemoChoyxonaContent } from "@/lib/demo-choyxona/defaults";

type Props = {
  titleFontClassName: string;
  bodyFontClassName: string;
};

export function TahrirPlayground({ titleFontClassName, bodyFontClassName }: Props) {
  const [content, setContent] = useState<DemoChoyxonaContent>(() => defaultDemoChoyxonaContent());

  const patchBlock = useCallback((key: keyof DemoChoyxonaBlocks, value: boolean) => {
    setContent((c) => ({
      ...c,
      blocks: { ...c.blocks, [key]: value },
    }));
  }, []);

  const patch = useCallback((partial: Partial<DemoChoyxonaContent>) => {
    setContent((c) => ({ ...c, ...partial }));
  }, []);

  const patchBullet = useCallback((index: number, value: string) => {
    setContent((c) => {
      const b = [...c.aboutBullets];
      b[index] = value;
      while (b.length < 4) b.push("");
      return { ...c, aboutBullets: b.slice(0, 4) };
    });
  }, []);

  const patchFaq = useCallback((index: number, field: "q" | "a", value: string) => {
    setContent((c) => {
      const items = [...c.faqItems];
      while (items.length <= index) items.push({ q: "", a: "" });
      const cur = items[index] ?? { q: "", a: "" };
      items[index] = { ...cur, [field]: value };
      return { ...c, faqItems: items.slice(0, 4) };
    });
  }, []);

  const inp =
    "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-black";

  const bullets = useMemo(() => {
    const b = [...content.aboutBullets];
    while (b.length < 4) b.push("");
    return b.slice(0, 4);
  }, [content.aboutBullets]);

  const faqRows = useMemo(() => {
    const items = [...content.faqItems];
    while (items.length < 4) items.push({ q: "", a: "" });
    return items.slice(0, 4);
  }, [content.faqItems]);

  const previewContent = useMemo(() => {
    const b = [...content.aboutBullets];
    while (b.length < 4) b.push("");
    const f = [...content.faqItems];
    while (f.length < 4) f.push({ q: "", a: "" });
    return {
      ...content,
      aboutBullets: b.slice(0, 4),
      faqItems: f.slice(0, 4),
    };
  }, [content]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-neutral-100">
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm font-semibold text-black">Tahrir</span>
          <span className="hidden text-xs text-neutral-500 sm:inline">
            Jonli ko‘rinish · bo‘limlarni yoqish/o‘chirish
          </span>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link href="/demo" className="text-xs font-medium text-[#b56b25] hover:underline">
            /demo
          </Link>
          <Link
            href="/dashboard/sites"
            className="text-xs font-medium text-neutral-600 underline-offset-2 hover:text-black hover:underline"
          >
            Saytlarim
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex max-h-[46vh] shrink-0 flex-col border-b border-neutral-200 bg-white lg:max-h-none lg:w-[min(460px,48vw)] lg:border-b-0 lg:border-r">
          <div className="border-b border-neutral-100 px-4 py-2 text-xs font-medium text-neutral-600">
            Bo‘limlar
            <span className="mt-0.5 block text-[10px] font-normal text-neutral-500">
              Kerak bo‘lmagan bloklarni o‘chirib turing
            </span>
          </div>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                Ko‘rinadigan bloklar
              </p>
              <BlockSwitch
                label="Header (yuqori panel)"
                hint="Brend, menyu va bron tugmasi"
                checked={content.blocks.header}
                onChange={(v) => patchBlock("header", v)}
              />
              <BlockSwitch
                label="Bosh sahifa (hero)"
                hint="Sarlavha, matn va asosiy rasm"
                checked={content.blocks.hero}
                onChange={(v) => patchBlock("hero", v)}
              />
              <BlockSwitch
                label="Biz haqimizda"
                checked={content.blocks.about}
                onChange={(v) => patchBlock("about", v)}
              />
              <BlockSwitch
                label="FAQ"
                hint="Savol-javoblar bloki"
                checked={content.blocks.faq}
                onChange={(v) => patchBlock("faq", v)}
              />
              <BlockSwitch
                label="Aloqa"
                hint="Ma’lumotlar va ariza formasi"
                checked={content.blocks.contact}
                onChange={(v) => patchBlock("contact", v)}
              />
              <BlockSwitch
                label="Footer"
                checked={content.blocks.footer}
                onChange={(v) => patchBlock("footer", v)}
              />
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                Nav / brend
              </p>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Brend nomi</span>
                <input
                  className={inp}
                  value={content.brandName}
                  onChange={(e) => patch({ brandName: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Nav: haqimizda</span>
                  <input
                    className={inp}
                    value={content.navAbout}
                    onChange={(e) => patch({ navAbout: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Nav: FAQ</span>
                  <input className={inp} value={content.navFaq} onChange={(e) => patch({ navFaq: e.target.value })} />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Nav: aloqa</span>
                  <input
                    className={inp}
                    value={content.navContact}
                    onChange={(e) => patch({ navContact: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Nav: tugma (Bron)</span>
                  <input className={inp} value={content.navCta} onChange={(e) => patch({ navCta: e.target.value })} />
                </label>
              </div>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Hero</p>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Sarlavha</span>
                <input
                  className={inp}
                  value={content.heroTitle}
                  onChange={(e) => patch({ heroTitle: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Lead matn</span>
                <textarea
                  className={`${inp} min-h-[72px] resize-y`}
                  value={content.heroLead}
                  onChange={(e) => patch({ heroLead: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Hero tugma</span>
                <input className={inp} value={content.heroCta} onChange={(e) => patch({ heroCta: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Hero rasm URL</span>
                <input
                  className={inp}
                  value={content.heroImageUrl}
                  onChange={(e) => patch({ heroImageUrl: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Suzuvchi karta sarlavhasi</span>
                <input
                  className={inp}
                  value={content.heroCardTitle}
                  onChange={(e) => patch({ heroCardTitle: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Suzuvchi karta matni</span>
                <textarea
                  className={`${inp} min-h-[56px] resize-y`}
                  value={content.heroCardText}
                  onChange={(e) => patch({ heroCardText: e.target.value })}
                />
              </label>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Biz haqimizda</p>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Rasm URL</span>
                <input
                  className={inp}
                  value={content.aboutImageUrl}
                  onChange={(e) => patch({ aboutImageUrl: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Sarlavha</span>
                <input
                  className={inp}
                  value={content.aboutTitle}
                  onChange={(e) => patch({ aboutTitle: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Matn</span>
                <textarea
                  className={`${inp} min-h-[72px] resize-y`}
                  value={content.aboutLead}
                  onChange={(e) => patch({ aboutLead: e.target.value })}
                />
              </label>
              {[0, 1, 2, 3].map((i) => (
                <label key={i} className="block text-sm">
                  <span className="font-medium text-neutral-800">Nuqta {i + 1}</span>
                  <input className={inp} value={bullets[i] ?? ""} onChange={(e) => patchBullet(i, e.target.value)} />
                </label>
              ))}
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">FAQ</p>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Bo‘lim sarlavhasi</span>
                <input className={inp} value={content.faqTitle} onChange={(e) => patch({ faqTitle: e.target.value })} />
              </label>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
                  <p className="text-xs font-semibold text-neutral-600">Savol {i + 1}</p>
                  <input
                    className={inp}
                    value={faqRows[i]?.q ?? ""}
                    onChange={(e) => patchFaq(i, "q", e.target.value)}
                    placeholder="Savol"
                  />
                  <textarea
                    className={`${inp} min-h-[56px] resize-y`}
                    value={faqRows[i]?.a ?? ""}
                    onChange={(e) => patchFaq(i, "a", e.target.value)}
                    placeholder="Javob"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Aloqa bloki</p>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Sarlavha</span>
                <input
                  className={inp}
                  value={content.contactTitle}
                  onChange={(e) => patch({ contactTitle: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Subtitle</span>
                <textarea
                  className={`${inp} min-h-[56px] resize-y`}
                  value={content.contactSubtitle}
                  onChange={(e) => patch({ contactSubtitle: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Karta sarlavhasi (Ma’lumot)</span>
                <input
                  className={inp}
                  value={content.contactInfoTitle}
                  onChange={(e) => patch({ contactInfoTitle: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Manzil yorlig‘i</span>
                  <input
                    className={inp}
                    value={content.addressLabel}
                    onChange={(e) => patch({ addressLabel: e.target.value })}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="font-medium text-neutral-800">Manzil</span>
                  <input className={inp} value={content.address} onChange={(e) => patch({ address: e.target.value })} />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Telefon yorlig‘i</span>
                  <input
                    className={inp}
                    value={content.phoneLabel}
                    onChange={(e) => patch({ phoneLabel: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Telefon (ko‘rinadi)</span>
                  <input
                    className={inp}
                    value={content.phoneDisplay}
                    onChange={(e) => patch({ phoneDisplay: e.target.value })}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="font-medium text-neutral-800">Telefon tel: (raqamlar)</span>
                  <input
                    className={inp}
                    value={content.phoneTel}
                    onChange={(e) => patch({ phoneTel: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Telegram yorlig‘i</span>
                  <input
                    className={inp}
                    value={content.telegramLabel}
                    onChange={(e) => patch({ telegramLabel: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Telegram</span>
                  <input
                    className={inp}
                    value={content.telegramDisplay}
                    onChange={(e) => patch({ telegramDisplay: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Ish vaqti yorlig‘i</span>
                  <input
                    className={inp}
                    value={content.hoursLabel}
                    onChange={(e) => patch({ hoursLabel: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Ish vaqti</span>
                  <input className={inp} value={content.hours} onChange={(e) => patch({ hours: e.target.value })} />
                </label>
              </div>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Footer</p>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Brend (footer)</span>
                <input
                  className={inp}
                  value={content.footerBrandName}
                  onChange={(e) => patch({ footerBrandName: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Ustun 2 sarlavha</span>
                  <input
                    className={inp}
                    value={content.footerCol2Title}
                    onChange={(e) => patch({ footerCol2Title: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Ustun 3 sarlavha</span>
                  <input
                    className={inp}
                    value={content.footerCol3Title}
                    onChange={(e) => patch({ footerCol3Title: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-neutral-800">Ustun 4 sarlavha</span>
                  <input
                    className={inp}
                    value={content.footerCol4Title}
                    onChange={(e) => patch({ footerCol4Title: e.target.value })}
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Havolalar (ustun 2)</span>
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  className={inp}
                  value={content.footerLinkAbout}
                  onChange={(e) => patch({ footerLinkAbout: e.target.value })}
                />
                <input
                  className={inp}
                  value={content.footerLinkFaq}
                  onChange={(e) => patch({ footerLinkFaq: e.target.value })}
                />
                <input
                  className={inp}
                  value={content.footerLinkContact}
                  onChange={(e) => patch({ footerLinkContact: e.target.value })}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={inp}
                  value={content.footerSvc1}
                  onChange={(e) => patch({ footerSvc1: e.target.value })}
                />
                <input
                  className={inp}
                  value={content.footerSvc2}
                  onChange={(e) => patch({ footerSvc2: e.target.value })}
                />
                <input
                  className={inp}
                  value={content.footerSvc3}
                  onChange={(e) => patch({ footerSvc3: e.target.value })}
                />
                <input
                  className={inp}
                  value={content.footerSvcBron}
                  onChange={(e) => patch({ footerSvcBron: e.target.value })}
                />
              </div>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Footer telefon</span>
                <input
                  className={inp}
                  value={content.footerPhone}
                  onChange={(e) => patch({ footerPhone: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Footer Telegram</span>
                <input
                  className={inp}
                  value={content.footerTelegram}
                  onChange={(e) => patch({ footerTelegram: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Footer shahar</span>
                <input className={inp} value={content.footerCity} onChange={(e) => patch({ footerCity: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Copyright (yildan keyin)</span>
                <input
                  className={inp}
                  value={content.footerCopyrightSuffix}
                  onChange={(e) => patch({ footerCopyrightSuffix: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-neutral-800">Pastki qator (texnologiya)</span>
                <input
                  className={inp}
                  value={content.footerTechLine}
                  onChange={(e) => patch({ footerTechLine: e.target.value })}
                />
              </label>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[54vh] min-w-0 flex-1 flex-col bg-neutral-200/80 lg:min-h-0">
          <div className="shrink-0 border-b border-neutral-300/80 bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-600">
            Ko‘rinish — `/demo` dizayni
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className={`${bodyFontClassName} min-h-full bg-[#fff8ed] text-[#20140c] antialiased`}>
              <DemoChoyxonaSite content={previewContent} titleFontClassName={titleFontClassName} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function BlockSwitch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-neutral-300">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">{hint}</span>
        ) : null}
      </span>
      <span className="relative h-7 w-11 shrink-0">
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="pointer-events-none absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-[#b56b25]" />
        <span className="pointer-events-none absolute left-[2px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-md transition-[left] peer-checked:left-[22px]" />
      </span>
    </label>
  );
}
