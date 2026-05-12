"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DemoChoyxonaSite } from "@/components/demo/demo-choyxona-site";
import { sampleLanding } from "@/lib/landings/defaults";
import {
  TAHRIR_PREVIEW_LANDING_SESSION_KEY,
  TAHRIR_WIZARD_FROM_CREATE_KEY,
} from "@/lib/landings/preview-storage";
import {
  DEFAULT_LANDING_THEME,
  LANDING_THEMES,
  LANDING_THEME_IDS,
  type LandingThemeId,
} from "@/lib/landings/themes";
import type {
  LandingPatch,
  LandingRecord,
} from "@/lib/landings/types";
import {
  createLanding,
  getMyLanding,
  listMyLandings,
  updateLanding,
  uploadLandingImage,
} from "@/lib/landings/client";
import { getAccessToken } from "@/lib/auth-storage";
import { landingToDemoContent } from "@/lib/landings/to-content";

type Props = {
  titleFontClassName: string;
  bodyFontClassName: string;
};

const LOCAL_KEY = "tahrir:landing:v2";

function initialLandingState(): LandingRecord {
  const base = sampleLanding();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LandingRecord>;
      return { ...base, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return base;
}

type SectionId =
  | "site"
  | "brand"
  | "hero"
  | "about"
  | "faq"
  | "contact"
  | "footer";

const SECTIONS: Array<{
  id: SectionId;
  title: string;
  hint: string;
  toggleKey?: keyof LandingRecord;
}> = [
  { id: "site", title: "Sayt", hint: "Domen va saqlash" },
  { id: "brand", title: "Header", hint: "Brend nomi va menyu" },
  { id: "hero", title: "Bosh sahifa (Hero)", hint: "Sarlavha va asosiy rasm" },
  { id: "about", title: "Biz haqimizda", hint: "Tavsif va afzalliklar", toggleKey: "blockAbout" },
  { id: "faq", title: "Savol-javob (FAQ)", hint: "4 ta savol va javob", toggleKey: "blockFaq" },
  { id: "contact", title: "Aloqa", hint: "Manzil, telefon, Telegram, ish vaqti", toggleKey: "blockContact" },
  { id: "footer", title: "Footer", hint: "Pastki qator" },
];

/** Forma maydonlari `id` */
function tid(field: string): string {
  return `tahrir-field-${field}`;
}

const PREVIEW_FIELD_TO_SECTION: Record<string, SectionId> = {
  name: "site",
  brandName: "brand",
  navAbout: "brand",
  navFaq: "brand",
  navContact: "brand",
  navCta: "brand",
  heroTitle: "hero",
  heroCta: "hero",
  heroImageUrl: "hero",
  aboutTitle: "about",
  aboutLead: "about",
  aboutImageUrl: "about",
  aboutBullet1: "about",
  aboutBullet2: "about",
  aboutBullet3: "about",
  aboutBullet4: "about",
  faq1Q: "faq",
  faq1A: "faq",
  faq2Q: "faq",
  faq2A: "faq",
  faq3Q: "faq",
  faq3A: "faq",
  faq4Q: "faq",
  faq4A: "faq",
  contactSubtitle: "contact",
  address: "contact",
  phoneTel: "contact",
  telegram: "contact",
  hours: "contact",
  footerCopyrightSuffix: "footer",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2018\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function isValidName(name: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) && name.length >= 3 && name.length <= 64;
}

/** Saqlash uchun yuboriladigan maydonlar (server boshqaradiganlar tashlanadi) */
function buildPatchBody(landing: LandingRecord): LandingPatch {
  const {
    // server-managed:
    id: _id,
    ownerPublicId: _ownerPublicId,
    plan: _plan,
    expiredAt: _expiredAt,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...rest
  } = landing;
  void _id;
  void _ownerPublicId;
  void _plan;
  void _expiredAt;
  void _createdAt;
  void _updatedAt;
  return rest;
}

export function TahrirPlayground({
  titleFontClassName,
  bodyFontClassName,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const landingIdFromUrl = searchParams.get("id");
  const [landing, setLanding] = useState<LandingRecord>(() => initialLandingState());
  /** Kichik ekranda: forma vs joydagi jonli preview (to‘liq ekran — alohida «Ko‘rish» tugmasi) */
  const [embedPanel, setEmbedPanel] = useState<"edit" | "live">("edit");
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    site: true,
    brand: false,
    hero: true,
    about: false,
    faq: false,
    contact: false,
    footer: false,
  });
  const [authed, setAuthed] = useState(false);
  const [, setBootstrapping] = useState(true);
  const [, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );

  const showToast = useCallback((t: { kind: "ok" | "err"; text: string }) => {
    setToast(t);
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (landing.id !== "local") return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(landing));
    } catch {
      /* quota */
    }
  }, [landing]);

  /** Token bo'lsa — server bilan ishlash; bo'lmasa local-only */
  useEffect(() => {
    let alive = true;
    (async () => {
      const readWizardFromCreate = (): {
        name: string;
        brandName: string;
        heroTitle: string;
      } | null => {
        if (typeof window === "undefined" || landingIdFromUrl) return null;
        const raw = sessionStorage.getItem(TAHRIR_WIZARD_FROM_CREATE_KEY);
        if (!raw) return null;
        try {
          const w = JSON.parse(raw) as {
            name?: string;
            brandName?: string;
            heroTitle?: string;
          };
          sessionStorage.removeItem(TAHRIR_WIZARD_FROM_CREATE_KEY);
          const name = typeof w.name === "string" ? w.name.trim() : "";
          if (!isValidName(name)) return null;
          const brand =
            typeof w.brandName === "string" && w.brandName.trim()
              ? w.brandName.trim()
              : name;
          const hero =
            typeof w.heroTitle === "string" && w.heroTitle.trim()
              ? w.heroTitle.trim()
              : brand;
          return { name, brandName: brand, heroTitle: hero };
        } catch {
          sessionStorage.removeItem(TAHRIR_WIZARD_FROM_CREATE_KEY);
          return null;
        }
      };

      const applyWizard = (w: { name: string; brandName: string; heroTitle: string }) => {
        setLanding((prev) => ({
          ...prev,
          id: "local",
          name: w.name,
          brandName: w.brandName,
          heroTitle: w.heroTitle,
        }));
        setDirty(false);
        try {
          localStorage.removeItem(LOCAL_KEY);
        } catch {
          /* ignore */
        }
      };

      const t = getAccessToken();
      const wizard = readWizardFromCreate();

      if (!t) {
        if (wizard) applyWizard(wizard);
        setAuthed(false);
        setBootstrapping(false);
        return;
      }
      setAuthed(true);
      try {
        if (landingIdFromUrl) {
          const full = await getMyLanding(landingIdFromUrl);
          if (!alive) return;
          setLanding(full);
          setSavedAt(full.updatedAt);
          setDirty(false);
          try {
            localStorage.removeItem(LOCAL_KEY);
          } catch {
            /* ignore */
          }
        } else if (wizard) {
          if (!alive) return;
          applyWizard(wizard);
        } else {
          const list = await listMyLandings();
          if (!alive) return;
          if (list.length > 0) {
            const full = await getMyLanding(list[0].id);
            if (!alive) return;
            setLanding(full);
            setSavedAt(full.updatedAt);
            setDirty(false);
          }
        }
      } catch {
        if (!alive) return;
        if (landingIdFromUrl) {
          showToast({
            kind: "err",
            text: "Bu landing topilmadi yoki sizga tegishli emas.",
          });
          router.replace("/tahrir");
        }
        /* boshqa xato: local draft bilan davom */
      } finally {
        if (alive) setBootstrapping(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [landingIdFromUrl, router, showToast]);

  const patch = useCallback((p: LandingPatch) => {
    setLanding((c) => ({ ...c, ...p } as LandingRecord));
    setDirty(true);
  }, []);

  const previewContent = useMemo(
    () => landingToDemoContent(landing),
    [landing],
  );

  const jumpToField = useCallback((fieldId: string) => {
    setEmbedPanel("edit");
    const section = PREVIEW_FIELD_TO_SECTION[fieldId];
    if (section) {
      setOpen((o) => ({ ...o, [section]: true }));
    }
    window.setTimeout(() => {
      const el = document.getElementById(tid(fieldId));
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const focusable =
        el?.matches("input:not([type='hidden']), textarea, button, select")
          ? (el as HTMLElement)
          : el?.querySelector<HTMLElement>(
              "input:not([type='hidden']), textarea, button, select",
            );
      focusable?.focus({ preventScroll: true });
    }, 90);
  }, []);

  const openPreview = useCallback(() => {
    try {
      sessionStorage.setItem(
        TAHRIR_PREVIEW_LANDING_SESSION_KEY,
        JSON.stringify(landing),
      );
    } catch {
      showToast({
        kind: "err",
        text: "Ko‘rish uchun ma’lumot saqlanmadi (xotira to‘lgan yoki juda katta).",
      });
      return;
    }
    router.push("/tahrir/preview");
  }, [landing, router, showToast]);

  const handleNameChange = useCallback(
    (raw: string) => {
      patch({ name: slugify(raw) });
    },
    [patch],
  );

  /** «Saqlash» — mavjud landing uchun yangilash */
  const onSave = useCallback(async () => {
    if (!authed) {
      showToast({
        kind: "err",
        text: "Saqlash uchun avval tizimga kiring",
      });
      return;
    }
    if (landing.id === "local") {
      showToast({
        kind: "err",
        text: "Avval «Yaratish» tugmasini bosib saytni saqlang",
      });
      return;
    }
    if (!isValidName(landing.name)) {
      showToast({
        kind: "err",
        text: "Manzil noto‘g‘ri: 3–64 ta belgi, kichik harf/raqam, `-`",
      });
      return;
    }
    setSaving(true);
    try {
      const merged = await updateLanding(landing.id, buildPatchBody(landing));
      setLanding(merged);
      setSavedAt(new Date().toISOString());
      setDirty(false);
      showToast({ kind: "ok", text: "Saqlandi" });
    } catch (e) {
      showToast({
        kind: "err",
        text: e instanceof Error ? e.message : "Saqlashda xato",
      });
    } finally {
      setSaving(false);
    }
  }, [authed, landing, showToast]);

  /** «Yaratish» — DBga yangi landing yozish va `/{name}` ga olib o‘tish */
  const onCreate = useCallback(async () => {
    if (!authed) {
      showToast({
        kind: "err",
        text: "Yaratish uchun avval tizimga kiring",
      });
      return;
    }
    if (!isValidName(landing.name)) {
      showToast({
        kind: "err",
        text: "Manzil noto‘g‘ri: 3–64 ta belgi, kichik harf/raqam, `-`",
      });
      return;
    }
    setCreating(true);
    try {
      const body = buildPatchBody(landing);
      const created = await createLanding({ ...body, name: landing.name });
      setLanding(created);
      setSavedAt(created.updatedAt);
      setDirty(false);
      try {
        localStorage.removeItem(LOCAL_KEY);
      } catch {
        /* ignore */
      }
      showToast({ kind: "ok", text: "Sayt yaratildi" });
      router.push(`/${created.name}`);
    } catch (e) {
      showToast({
        kind: "err",
        text: e instanceof Error ? e.message : "Yaratishda xato",
      });
    } finally {
      setCreating(false);
    }
  }, [authed, landing, router, showToast]);

  const onUpload = useCallback(
    async (kind: "hero" | "about", file: File): Promise<void> => {
      if (!authed || landing.id === "local") {
        const reader = new FileReader();
        await new Promise<void>((res, rej) => {
          reader.onload = () => res();
          reader.onerror = () => rej(reader.error ?? new Error("read"));
          reader.readAsDataURL(file);
        });
        const dataUrl = reader.result as string;
        patch(
          kind === "hero"
            ? { heroImageUrl: dataUrl }
            : { aboutImageUrl: dataUrl },
        );
        return;
      }
      try {
        const updated = await uploadLandingImage(landing.id, kind, file);
        setLanding(updated);
        setSavedAt(updated.updatedAt);
        showToast({ kind: "ok", text: "Rasm yuklandi" });
      } catch (e) {
        showToast({
          kind: "err",
          text: e instanceof Error ? e.message : "Rasm yuklanmadi",
        });
      }
    },
    [authed, landing.id, patch, showToast],
  );

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-neutral-100 text-neutral-900">
      <Toolbar
        landing={landing}
        dirty={dirty}
        saving={saving}
        creating={creating}
        authed={authed}
        onNameChange={handleNameChange}
        onSave={onSave}
        onCreate={onCreate}
        onOpenPreview={openPreview}
      />

      <div
        className="grid grid-cols-2 gap-1 border-b border-neutral-200 bg-white px-2 py-1 lg:hidden"
        role="tablist"
        aria-label="Joydagi ko‘rinish"
      >
        <button
          type="button"
          role="tab"
          aria-selected={embedPanel === "edit"}
          onClick={() => setEmbedPanel("edit")}
          className={[
            "rounded-md py-1.5 text-xs font-bold transition-colors",
            embedPanel === "edit"
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-50",
          ].join(" ")}
        >
          Tahrir
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={embedPanel === "live"}
          onClick={() => setEmbedPanel("live")}
          className={[
            "rounded-md py-1.5 text-xs font-bold transition-colors",
            embedPanel === "live"
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-50",
          ].join(" ")}
        >
          Jonli
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside
          className={[
            "flex min-h-0 flex-1 flex-col overflow-hidden border-b border-neutral-200 bg-white lg:w-[min(440px,46vw)] lg:shrink-0 lg:border-b-0 lg:border-r lg:flex-none",
            embedPanel === "live" ? "hidden lg:flex" : "",
          ].join(" ")}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4">
            <div className="space-y-3">
              {SECTIONS.map((sec) => (
                <SectionCard
                  key={sec.id}
                  open={open[sec.id]}
                  onToggleOpen={() =>
                    setOpen((o) => ({ ...o, [sec.id]: !o[sec.id] }))
                  }
                  title={sec.title}
                  hint={sec.hint}
                  toggleable={sec.toggleKey != null}
                  enabled={
                    sec.toggleKey
                      ? Boolean(landing[sec.toggleKey])
                      : true
                  }
                  onEnabledChange={
                    sec.toggleKey
                      ? (v) =>
                          patch({ [sec.toggleKey as string]: v } as LandingPatch)
                      : undefined
                  }
                >
                  {sec.id === "site" && (
                    <SiteSection landing={landing} onName={handleNameChange} />
                  )}
                  {sec.id === "brand" && (
                    <BrandSection landing={landing} onChange={patch} />
                  )}
                  {sec.id === "hero" && (
                    <HeroSection
                      landing={landing}
                      onChange={patch}
                      onUpload={(f) => onUpload("hero", f)}
                    />
                  )}
                  {sec.id === "about" && (
                    <AboutSection
                      landing={landing}
                      onChange={patch}
                      onUpload={(f) => onUpload("about", f)}
                    />
                  )}
                  {sec.id === "faq" && (
                    <FaqSection landing={landing} onChange={patch} />
                  )}
                  {sec.id === "contact" && (
                    <ContactSection landing={landing} onChange={patch} />
                  )}
                  {sec.id === "footer" && (
                    <FooterSection landing={landing} onChange={patch} />
                  )}
                </SectionCard>
              ))}

              <ThemePicker
                selected={(landing.blocktheme as LandingThemeId) ?? DEFAULT_LANDING_THEME}
                onSelect={(id) => patch({ blocktheme: id } as LandingPatch)}
              />
            </div>
          </div>
        </aside>

        <section
          className={[
            "min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-neutral-200/80 lg:min-h-0",
            embedPanel === "edit" ? "hidden lg:flex" : "flex",
          ].join(" ")}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <div className={`${bodyFontClassName} min-h-full text-[#20140c] antialiased`}>
              <DemoChoyxonaSite
                content={previewContent}
                titleFontClassName={titleFontClassName}
                onRequestEdit={jumpToField}
                themeId={(landing.blocktheme as LandingThemeId) ?? DEFAULT_LANDING_THEME}
              />
            </div>
          </div>
        </section>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[200] flex justify-center px-4">
          <div
            className={[
              "pointer-events-auto rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg",
              toast.kind === "ok"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white",
            ].join(" ")}
          >
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                              */
/* ------------------------------------------------------------------ */

function Toolbar(props: {
  landing: LandingRecord;
  dirty: boolean;
  saving: boolean;
  creating: boolean;
  authed: boolean;
  onNameChange: (v: string) => void;
  onSave: () => void;
  onCreate: () => void;
  onOpenPreview: () => void;
}) {
  const {
    landing,
    dirty,
    saving,
    creating,
    authed,
    onNameChange,
    onSave,
    onCreate,
    onOpenPreview,
  } = props;

  const isLocal = landing.id === "local";

  return (
    <header className="z-[60] shrink-0 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="flex min-w-0 flex-wrap items-center gap-2 border-b border-neutral-100 px-3 py-2 pt-[max(4px,env(safe-area-inset-top))] sm:gap-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center rounded-md border border-neutral-200 bg-neutral-50 text-xs">
          <span className="hidden shrink-0 px-2 py-1.5 text-neutral-500 sm:inline">
            weblinker.uz/
          </span>
          <span className="shrink-0 px-2 py-1.5 text-neutral-500 sm:hidden">…/</span>
          <input
            value={landing.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="min-w-0 flex-1 rounded-r-md bg-white px-2 py-1.5 text-sm font-mono text-neutral-900 outline-none focus:ring-2 focus:ring-black/10 sm:w-44 sm:flex-none"
            placeholder="manzil"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        <button
          type="button"
          onClick={onOpenPreview}
          title="To‘liq ekranda alohida sahifada ochish"
          className="shrink-0 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 active:bg-neutral-100"
        >
          Ko‘rish
        </button>

        {authed && (
          <>
            {isLocal ? (
              <button
                type="button"
                onClick={onCreate}
                disabled={creating}
                className="inline-flex h-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:min-w-0"
                title={`weblinker.uz/${landing.name} manzilida saqlash`}
              >
                {creating ? "Yaratilmoqda…" : "Yaratish"}
              </button>
            ) : (
              <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:ml-auto sm:w-auto">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving || !dirty}
                  className="inline-flex h-9 min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md bg-black px-4 text-xs font-bold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:min-w-0"
                >
                  {saving ? "Saqlanmoqda…" : "Saqlash"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* SectionCard / Toggle / Inputs                                        */
/* ------------------------------------------------------------------ */

function SectionCard(props: {
  title: string;
  hint: string;
  open: boolean;
  onToggleOpen: () => void;
  children: ReactNode;
  toggleable?: boolean;
  enabled?: boolean;
  onEnabledChange?: (v: boolean) => void;
}) {
  const { title, hint, open, onToggleOpen, children, toggleable, enabled, onEnabledChange } =
    props;
  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center justify-between gap-3 rounded-t-xl px-4 py-3 text-left transition hover:bg-neutral-50"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-neutral-900">
            {title}
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">
            {hint}
          </span>
        </span>
        <span className="flex items-center gap-3">
          {toggleable && (
            <Toggle
              checked={enabled ?? false}
              onChange={(v) => onEnabledChange?.(v)}
              onMouseDown={(e) => e.stopPropagation()}
            />
          )}
          <span
            className={[
              "text-neutral-400 transition",
              open ? "rotate-180" : "",
            ].join(" ")}
          >
            ▾
          </span>
        </span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-100 px-4 py-4">
          {children}
        </div>
      )}
    </section>
  );
}

function Toggle(props: {
  checked: boolean;
  onChange: (v: boolean) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}) {
  return (
    <span
      onMouseDown={(e) => {
        e.stopPropagation();
        props.onMouseDown?.(e);
      }}
      className="relative inline-block h-6 w-10 shrink-0"
    >
      <input
        type="checkbox"
        role="switch"
        aria-checked={props.checked}
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <span className="pointer-events-none absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-[#b56b25]" />
      <span className="pointer-events-none absolute left-[2px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-[left] peer-checked:left-[22px]" />
    </span>
  );
}

const inp =
  "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-black";

function Field(props: {
  label: string;
  children: ReactNode;
  hint?: string;
  span2?: boolean;
}) {
  return (
    <label
      className={["block text-sm", props.span2 ? "sm:col-span-2" : ""].join(" ")}
    >
      <span className="font-medium text-neutral-800">{props.label}</span>
      {props.children}
      {props.hint && (
        <span className="mt-1 block text-[11px] text-neutral-500">
          {props.hint}
        </span>
      )}
    </label>
  );
}

function TextInput(props: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <input
      id={props.id}
      className={inp}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
    />
  );
}

function TextArea(props: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  id?: string;
}) {
  return (
    <textarea
      id={props.id}
      className={`${inp} resize-y`}
      style={{ minHeight: `${(props.rows ?? 3) * 22}px` }}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
    />
  );
}

/* ------------------------------------------------------------------ */
/* ImageField — server (id != local) bo'lsa serverga, aks holda data:   */
/* ------------------------------------------------------------------ */

function ImageField(props: {
  label: string;
  value: string;
  onUpload: (file: File) => Promise<void> | void;
  hint?: string;
  id?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const has = props.value.trim().length > 0;

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith("image/")) {
      setErr("Faqat rasm fayli");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr("Rasm 2 MB dan oshmasin");
      return;
    }
    setBusy(true);
    try {
      await props.onUpload(file);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div id={props.id}>
      <label className="mb-1.5 block text-sm font-medium text-neutral-800">
        {props.label}
      </label>
      {has ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={props.value}
            alt=""
            className="aspect-[16/9] w-full bg-neutral-100 object-cover"
          />
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="truncate text-[11px] text-neutral-500">
              {props.value.startsWith("data:")
                ? "Yuklangan rasm"
                : props.value}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="h-8 rounded-md border border-neutral-200 px-3 text-xs font-semibold text-neutral-800 transition-colors hover:border-black disabled:opacity-50"
            >
              {busy ? "Yuklanmoqda…" : "Almashtirish"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handle(e.dataTransfer.files?.[0]);
          }}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-center text-sm text-neutral-600 transition-colors hover:border-black hover:text-neutral-900"
        >
          <span className="text-2xl">⬆</span>
          <span>{busy ? "Yuklanmoqda…" : "Rasmni tashlang yoki tanlang"}</span>
          <span className="text-[11px] text-neutral-500">JPG/PNG, 2 MB</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          void handle(e.target.files?.[0])
        }
      />
      {err ? (
        <p className="mt-1.5 text-xs text-rose-600">{err}</p>
      ) : props.hint ? (
        <p className="mt-1.5 text-[11px] text-neutral-500">{props.hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bo'lim formalari                                                     */
/* ------------------------------------------------------------------ */

function SiteSection(props: {
  landing: LandingRecord;
  onName: (s: string) => void;
}) {
  const { landing, onName } = props;
  return (
    <div className="space-y-3">
      <Field label="Domen">
        <TextInput id={tid("name")} value={landing.name} onChange={onName} />
      </Field>
    </div>
  );
}

function BrandSection(props: {
  landing: LandingRecord;
  onChange: (p: LandingPatch) => void;
}) {
  const { landing, onChange } = props;
  return (
    <div className="space-y-3">
      <Field label="Brend nomi">
        <TextInput
          id={tid("brandName")}
          value={landing.brandName}
          onChange={(v) => onChange({ brandName: v })}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Menyu: Biz haqimizda">
          <TextInput
            id={tid("navAbout")}
            value={landing.navAbout}
            onChange={(v) => onChange({ navAbout: v })}
          />
        </Field>
        <Field label="Menyu: FAQ">
          <TextInput
            id={tid("navFaq")}
            value={landing.navFaq}
            onChange={(v) => onChange({ navFaq: v })}
          />
        </Field>
        <Field label="Menyu: Aloqa">
          <TextInput
            id={tid("navContact")}
            value={landing.navContact}
            onChange={(v) => onChange({ navContact: v })}
          />
        </Field>
        <Field label="Menyu: tugma">
          <TextInput
            id={tid("navCta")}
            value={landing.navCta}
            onChange={(v) => onChange({ navCta: v })}
          />
        </Field>
      </div>
    </div>
  );
}

function HeroSection(props: {
  landing: LandingRecord;
  onChange: (p: LandingPatch) => void;
  onUpload: (file: File) => Promise<void> | void;
}) {
  const { landing, onChange, onUpload } = props;
  return (
    <div className="space-y-3">
      <Field label="Asosiy sarlavha">
        <TextArea
          id={tid("heroTitle")}
          rows={3}
          value={landing.heroTitle}
          onChange={(v) => onChange({ heroTitle: v })}
        />
      </Field>
      <Field label="Asosiy tugma matni">
        <TextInput
          id={tid("heroCta")}
          value={landing.heroCta}
          onChange={(v) => onChange({ heroCta: v })}
        />
      </Field>
      <ImageField
        id={tid("heroImageUrl")}
        label="Hero rasmi"
        value={landing.heroImageUrl}
        onUpload={onUpload}
        hint="Aspect 4:3 ko'rinishda chiqadi"
      />
    </div>
  );
}

function AboutSection(props: {
  landing: LandingRecord;
  onChange: (p: LandingPatch) => void;
  onUpload: (file: File) => Promise<void> | void;
}) {
  const { landing, onChange, onUpload } = props;
  return (
    <div className="space-y-3">
      <ImageField
        id={tid("aboutImageUrl")}
        label="Biz haqimizda rasmi"
        value={landing.aboutImageUrl}
        onUpload={onUpload}
      />
      <Field label="Sarlavha">
        <TextInput
          id={tid("aboutTitle")}
          value={landing.aboutTitle}
          onChange={(v) => onChange({ aboutTitle: v })}
        />
      </Field>
      <Field label="Tavsif">
        <TextArea
          id={tid("aboutLead")}
          rows={3}
          value={landing.aboutLead}
          onChange={(v) => onChange({ aboutLead: v })}
        />
      </Field>
      <div className="grid gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
          Afzalliklar (4 ta)
        </p>
        {([
          ["aboutBullet1", landing.aboutBullet1],
          ["aboutBullet2", landing.aboutBullet2],
          ["aboutBullet3", landing.aboutBullet3],
          ["aboutBullet4", landing.aboutBullet4],
        ] as const).map(([key, val], i) => (
          <input
            key={key}
            id={tid(key)}
            className={inp}
            value={val}
            placeholder={`Nuqta ${i + 1}`}
            onChange={(e) =>
              onChange({ [key]: e.target.value } as LandingPatch)
            }
          />
        ))}
      </div>
    </div>
  );
}

function FaqSection(props: {
  landing: LandingRecord;
  onChange: (p: LandingPatch) => void;
}) {
  const { landing, onChange } = props;
  const rows = [
    ["faq1Q", "faq1A", landing.faq1Q, landing.faq1A],
    ["faq2Q", "faq2A", landing.faq2Q, landing.faq2A],
    ["faq3Q", "faq3A", landing.faq3Q, landing.faq3A],
    ["faq4Q", "faq4A", landing.faq4Q, landing.faq4A],
  ] as const;
  return (
    <div className="space-y-3">
      {rows.map(([qKey, aKey, qVal, aVal], i) => (
        <div
          key={qKey}
          className="space-y-2 rounded-lg border border-neutral-100 bg-neutral-50/80 p-3"
        >
          <p className="text-xs font-semibold text-neutral-600">Savol {i + 1}</p>
          <input
            id={tid(qKey)}
            className={inp}
            value={qVal}
            placeholder="Savol"
            onChange={(e) =>
              onChange({ [qKey]: e.target.value } as LandingPatch)
            }
          />
          <textarea
            id={tid(aKey)}
            className={`${inp} min-h-[56px] resize-y`}
            value={aVal}
            placeholder="Javob"
            onChange={(e) =>
              onChange({ [aKey]: e.target.value } as LandingPatch)
            }
          />
        </div>
      ))}
    </div>
  );
}

/** Foydalanuvchi yozgan ko'rinishni `+998901234567` shakliga keltirish */
function phoneToTel(display: string): string {
  const d = display.replace(/\D/g, "");
  if (d.length === 0) return "";
  if (d.length === 9) return `+998${d}`;
  if (d.startsWith("998")) return `+${d}`;
  if (d.length >= 9) return `+${d}`;
  return `+${d}`;
}

function ContactSection(props: {
  landing: LandingRecord;
  onChange: (p: LandingPatch) => void;
}) {
  const { landing, onChange } = props;
  return (
    <div className="space-y-3">
      <Field
        label="Qisqa matn (sarlavha osti)"
        hint="Masalan: savol yoki stol band qilish haqida"
      >
        <TextArea
          id={tid("contactSubtitle")}
          rows={3}
          value={landing.contactSubtitle}
          onChange={(v) => onChange({ contactSubtitle: v })}
          placeholder="Savolingiz bormi yoki stol band qilmoqchimisiz? Ma'lumotlaringizni qoldiring."
        />
      </Field>
      <Field
        label="Manzil"
        hint="Masalan: Toshkent shahri, Markaziy ko‘cha 12-uy"
      >
        <TextArea
          id={tid("address")}
          rows={2}
          value={landing.address}
          onChange={(v) => onChange({ address: v })}
          placeholder="Toshkent shahri, Markaziy ko‘cha 12-uy"
        />
      </Field>
      <Field
        label="Telefon"
        hint="Faqat raqamlar kiriting; havola uchun avtomatik `+998…`ga aylantiriladi"
      >
        <TextInput
          id={tid("phoneTel")}
          value={landing.phoneTel}
          onChange={(v) => onChange({ phoneTel: phoneToTel(v) })}
          placeholder="+998 90 123 45 67"
        />
      </Field>
      <Field label="Telegram" hint="Masalan: @nomdor_choyxonasi">
        <TextInput
          id={tid("telegram")}
          value={landing.telegram}
          onChange={(v) => onChange({ telegram: v })}
          placeholder="@nomdor_choyxonasi"
        />
      </Field>
      <Field label="Ish vaqti" hint="Masalan: Har kuni 09:00 — 23:00">
        <TextInput
          id={tid("hours")}
          value={landing.hours}
          onChange={(v) => onChange({ hours: v })}
          placeholder="Har kuni 09:00 — 23:00"
        />
      </Field>
    </div>
  );
}

function FooterSection(props: {
  landing: LandingRecord;
  onChange: (p: LandingPatch) => void;
}) {
  const { landing, onChange } = props;
  return (
    <div className="space-y-3">
      <Field label="Copyright (yildan keyin)">
        <TextInput
          id={tid("footerCopyrightSuffix")}
          value={landing.footerCopyrightSuffix}
          onChange={(v) => onChange({ footerCopyrightSuffix: v })}
        />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dizayn shabloni — rang kombinatsiyalari                              */
/* ------------------------------------------------------------------ */

function ThemePicker(props: {
  selected: LandingThemeId;
  onSelect: (id: LandingThemeId) => void;
}) {
  const { selected, onSelect } = props;
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-neutral-900">Dizayn shabloni</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
            Background va tugma ranglari uchun 4 ta tayyor shablon
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {LANDING_THEME_IDS.map((id) => {
          const t = LANDING_THEMES[id];
          const isActive = id === selected;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-pressed={isActive}
              title={t.title}
              className={[
                "group relative flex flex-col gap-2 overflow-hidden rounded-xl border-2 p-2 text-left transition-all",
                isActive
                  ? "border-neutral-900 shadow-[0_6px_16px_rgba(0,0,0,0.10)]"
                  : "border-neutral-200 hover:border-neutral-400",
              ].join(" ")}
            >
              <span
                aria-hidden
                className="flex h-14 w-full items-end justify-end rounded-lg p-1.5"
                style={{ background: t.vars["--c-bg"] }}
              >
                <span
                  className="inline-flex h-6 w-12 items-center justify-center rounded-full text-[10px] font-extrabold text-white shadow"
                  style={{
                    background: `linear-gradient(135deg, ${t.vars["--c-p-from"]}, ${t.vars["--c-p-to"]})`,
                    boxShadow: `0 6px 14px ${t.vars["--c-p-glow"]}`,
                  }}
                >
                  ABC
                </span>
              </span>
              <span className="flex items-center justify-between gap-1.5">
                <span className="truncate text-[12px] font-bold text-neutral-900">
                  {t.title}
                </span>
                <span className="flex shrink-0 items-center gap-0.5">
                  {t.swatches.map((c, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className="h-3 w-3 rounded-full ring-1 ring-black/10"
                      style={{ background: c }}
                    />
                  ))}
                </span>
              </span>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white shadow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 4.5 4.5L19 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
