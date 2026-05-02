"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ColorThemeId,
  FeatureIconKind,
  FeatureItem,
  LandingContent,
  PatternId,
  ServiceItem,
  SiteImage,
  SocialLinks,
  StatItem,
  Testimonial,
  UnknownSite,
  VIZITKA_TEMPLATES,
  VizitkaContent,
  VizitkaTemplateId,
  getColorTheme,
} from "@/lib/store/types";
import {
  deleteSite,
  newId,
  normalizeSlug,
  saveSite,
  slugExists,
} from "@/lib/store/store";
import { deriveInitials } from "@/lib/store/defaults";
import { Button } from "@/components/ui/button";
import { SiteRenderer } from "@/components/sites/site-renderer";
import { FeatureIcon, FEATURE_ICON_OPTIONS } from "@/components/sites/feature-icons";
import { Field, IconButton, Section, TextAreaInput, TextInput } from "./fields";
import { HoursEditor } from "./hours-editor";
import { ImageUpload } from "./image-upload";
import { PatternPicker } from "./pattern-picker";
import { PhoneFrame } from "./phone-frame";
import { SiteQRCode } from "./qr-code";
import { SocialEditor } from "./social-editor";
import { VizitkaTemplateSwitcher } from "./template-switcher";
import { ColorPicker } from "./color-picker";
import { cn } from "@/lib/cn";

type SaveState = "saved" | "saving" | "error";

type Props = {
  initialSite: UnknownSite;
  /** Bazada vizitka bor — logo serverga yuklanadi */
  serverBackedVizitka?: boolean;
};

const RESERVED_SLUGS = new Set([
  "dashboard",
  "login",
  "signup",
  "api",
  "admin",
  "pricing",
  "terms",
  "privacy",
  "_next",
  "settings",
  "inbox",
  "billing",
]);

type SectionMeta = { id: string; label: string };

const VIZITKA_SECTIONS: SectionMeta[] = [
  { id: "design", label: "Dizayn" },
  { id: "general", label: "Umumiy" },
  { id: "contact", label: "Aloqa" },
  { id: "social", label: "Ijtimoiy" },
  { id: "qr", label: "QR kod" },
  { id: "danger", label: "Xavfli zona" },
];

const LANDING_SECTIONS: SectionMeta[] = [
  { id: "design", label: "Dizayn" },
  { id: "general", label: "Umumiy" },
  { id: "contact", label: "Aloqa" },
  { id: "social", label: "Ijtimoiy" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "Biz haqimizda" },
  { id: "stats", label: "Statistika" },
  { id: "features", label: "Afzalliklar" },
  { id: "services", label: "Xizmatlar" },
  { id: "gallery", label: "Galereya" },
  { id: "testimonials", label: "Mijozlar fikri" },
  { id: "cta", label: "Aloqa chaqiruvi" },
  { id: "qr", label: "QR kod" },
  { id: "danger", label: "Xavfli zona" },
];

export function Editor({
  initialSite,
  serverBackedVizitka = false,
}: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<UnknownSite>(initialSite);
  const [slugInput, setSlugInput] = useState(initialSite.slug);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [savedAt, setSavedAt] = useState<Date | null>(new Date(initialSite.updatedAt));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeSection, setActiveSection] = useState<string>("general");

  const normalizedSlug = useMemo(() => normalizeSlug(slugInput), [slugInput]);
  const slugError = useMemo(() => {
    if (!normalizedSlug) return "Manzilni kiriting";
    if (normalizedSlug.length < 3) return "Kamida 3 ta belgi";
    if (RESERVED_SLUGS.has(normalizedSlug)) return "Bu manzil band";
    if (normalizedSlug !== draft.slug && slugExists(normalizedSlug, draft.id))
      return "Bu manzil ishlatilgan";
    return null;
  }, [normalizedSlug, draft.slug, draft.id]);

  useEffect(() => {
    if (slugError) return;
    if (normalizedSlug === draft.slug) return;
    setDraft((prev) => ({ ...prev, slug: normalizedSlug }));
  }, [normalizedSlug, slugError, draft.slug]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(() => {
      try {
        saveSite(draft);
        setSavedAt(new Date());
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draft]);

  const updateContent = <K extends keyof VizitkaContent>(
    key: K,
    value: VizitkaContent[K],
  ) => {
    setDraft((prev) => ({
      ...prev,
      content: { ...prev.content, [key]: value },
    } as UnknownSite));
  };

  const updateLanding = <K extends keyof LandingContent>(
    key: K,
    value: LandingContent[K],
  ) => {
    setDraft((prev) => ({
      ...prev,
      content: { ...prev.content, [key]: value },
    } as UnknownSite));
  };

  const updateSocial = (next: SocialLinks) => {
    setDraft((prev) => ({
      ...prev,
      content: { ...prev.content, social: next },
    } as UnknownSite));
  };

  const togglePublish = () => {
    const nextStatus = draft.status === "published" ? "draft" : "published";
    setDraft((prev) => ({ ...prev, status: nextStatus }));
  };

  const updateTemplate = (id: VizitkaTemplateId) => {
    setDraft((prev) => ({ ...prev, templateId: id }));
  };

  const updateLogoImage = (image: SiteImage | undefined) => {
    setDraft((prev) => ({
      ...prev,
      content: { ...prev.content, logoImage: image },
    } as UnknownSite));
  };

  const updateHeroImage = (image: SiteImage | undefined) => {
    setDraft((prev) => ({
      ...prev,
      content: { ...prev.content, heroImage: image },
    } as UnknownSite));
  };

  const updateColorTheme = (id: ColorThemeId) => {
    setDraft((prev) => ({
      ...prev,
      content: { ...prev.content, colorTheme: id },
    } as UnknownSite));
  };

  const handleDelete = () => {
    if (confirm("Saytni butunlay o'chirib tashlamoqchimisiz? Qaytarib bo'lmaydi.")) {
      deleteSite(draft.id);
      router.push("/dashboard/sites");
    }
  };

  const isLanding = draft.type === "landing";
  const sections = isLanding ? LANDING_SECTIONS : VIZITKA_SECTIONS;

  const templateMeta = VIZITKA_TEMPLATES.find(
    (t) => t.id === draft.templateId,
  );
  const supportsHero = templateMeta?.supportsHero ?? false;

  const jumpTo = (id: string) => {
    setActiveSection(id);
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EditorHeader
        site={draft}
        saveState={saveState}
        savedAt={savedAt}
        onTogglePublish={togglePublish}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[480px_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-[color:var(--border)] bg-white lg:border-b-0 lg:border-r">
          <SectionTabs
            sections={sections}
            active={activeSection}
            onSelect={jumpTo}
          />

          <div className="flex-1 overflow-y-auto">
            <Anchor id="design" />
            <Section
              title="Dizayn"
              description={
                isLanding
                  ? "Logo rasmi yuklash mumkin"
                  : "Shablon va rasmlarni shu yerdan boshqaring"
              }
            >
              {!isLanding ? (
                <>
                  <Field
                    label="Joylashuv"
                    hint="4 ta dizayn varianti"
                  >
                    <VizitkaTemplateSwitcher
                      value={draft.templateId as VizitkaTemplateId}
                      onChange={updateTemplate}
                    />
                  </Field>
                  <Field label="Rang" hint="8 ta rang varianti">
                    <ColorPicker
                      value={(draft.content.colorTheme ?? "mono") as ColorThemeId}
                      onChange={updateColorTheme}
                    />
                  </Field>
                  <Field label="Naqsh" hint="Shablon fonidagi bezak">
                    <PatternPicker
                      value={draft.content.pattern ?? "none"}
                      onChange={(p: PatternId) => updateContent("pattern", p)}
                      color={getColorTheme(draft.content.colorTheme).primary}
                    />
                  </Field>
                </>
              ) : null}

              {supportsHero ? (
                <ImageUpload
                  label="Hero rasm"
                  hint="Tepadagi katta rasm. 16:9 nisbat tavsiya etiladi."
                  value={draft.content.heroImage}
                  onChange={updateHeroImage}
                  aspect="wide"
                />
              ) : null}

              <ImageUpload
                label="Logo rasm"
                hint="Rasm yuklamagan bo'lsangiz bosh harflar ishlatiladi"
                value={draft.content.logoImage}
                onChange={updateLogoImage}
                aspect="square"
                serverLogoUpload={
                  !isLanding && serverBackedVizitka && draft.type === "vizitka"
                    ? { vizitkaId: draft.id }
                    : undefined
                }
                onServerSync={
                  !isLanding && serverBackedVizitka && draft.type === "vizitka"
                    ? (s) => {
                        setDraft(s);
                        setSavedAt(new Date(s.updatedAt));
                      }
                    : undefined
                }
              />
            </Section>

            <Anchor id="general" />
            <Section title="Umumiy" description="Sayt nomi va qisqacha tavsif">
              <Field label="Biznes nomi">
                <TextInput
                  value={draft.content.businessName}
                  onChange={(v) => {
                    updateContent("businessName", v);
                    updateContent("accentInitials", deriveInitials(v));
                  }}
                />
              </Field>
              <Field
                label="Kategoriya"
                hint="Masalan: Chayxana, Beauty salon, Fitnes markazi"
              >
                <TextInput
                  value={draft.content.category}
                  onChange={(v) => updateContent("category", v)}
                />
              </Field>
              <Field label="Qisqa taqdimot" hint="Biznes nomi ostida chiqadi">
                <TextInput
                  value={draft.content.tagline}
                  onChange={(v) => updateContent("tagline", v)}
                />
              </Field>
              <Field label="Tavsif" hint="1-2 jumlada biznesingiz haqida">
                <TextAreaInput
                  value={draft.content.description}
                  onChange={(v) => updateContent("description", v)}
                  rows={3}
                />
              </Field>
            </Section>

            <Anchor id="contact" />
            <Section title="Manzil va aloqa">
              <Field label="Veb-manzil" error={slugError}>
                <TextInput
                  prefix="weblinker.uz/"
                  value={slugInput}
                  onChange={(v) => setSlugInput(normalizeSlug(v))}
                />
              </Field>
              <Field label="Telefon">
                <TextInput
                  type="tel"
                  value={draft.content.phone}
                  onChange={(v) => updateContent("phone", v)}
                  placeholder="+998 90 123 45 67"
                />
              </Field>
              <Field label="Manzil">
                <TextInput
                  value={draft.content.address}
                  onChange={(v) => updateContent("address", v)}
                  placeholder="Toshkent, Chilonzor"
                />
              </Field>
              <Field label="Ish vaqti" hint="Presetlardan tanlang yoki moslang">
                <HoursEditor
                  value={draft.content.hoursLine}
                  onChange={(v) => updateContent("hoursLine", v)}
                />
              </Field>
              <Field label="Xarita havolasi (ixtiyoriy)" hint="Google Maps yoki Yandex link">
                <TextInput
                  value={draft.content.mapsUrl ?? ""}
                  onChange={(v) => updateContent("mapsUrl", v)}
                  placeholder="https://maps.google.com/..."
                />
              </Field>
            </Section>

            <Anchor id="social" />
            <Section
              title="Ijtimoiy tarmoqlar"
              description="Kerakli tarmoqni tanlab, username yoki havolani kiriting"
            >
              <SocialEditor value={draft.content.social} onChange={updateSocial} />
            </Section>

            {isLanding ? (
              <LandingSections
                content={draft.content as LandingContent}
                update={updateLanding}
              />
            ) : null}

            <Anchor id="qr" />
            <Section
              title="QR kod"
              description="Saytingizga olib boruvchi QR. Menyu, vizitka kartochkasi yoki afishaga chop eting."
            >
              <SiteQRCode
                url={buildSiteUrl(draft.slug)}
                filename={`weblinker-${draft.slug}`}
              />
            </Section>

            <Anchor id="danger" />
            <Section title="Xavfli zona">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 px-4 text-sm font-medium text-red-700 transition-colors hover:border-red-700 hover:bg-red-50"
              >
                Saytni o&apos;chirish
              </button>
            </Section>
          </div>
        </aside>

        <section className="flex min-h-[70vh] min-w-0 flex-col bg-neutral-100 lg:min-h-0">
          <PreviewToolbar slug={draft.slug} />
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {isLanding ? (
              <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">
                <SiteRenderer site={draft} />
              </div>
            ) : (
              <PhoneFrame>
                <SiteRenderer site={draft} />
              </PhoneFrame>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Anchor({ id }: { id: string }) {
  return <div id={`section-${id}`} className="scroll-mt-4" />;
}

function SectionTabs({
  sections,
  active,
  onSelect,
}: {
  sections: SectionMeta[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="border-b border-[color:var(--border)] bg-white">
      <div className="flex gap-1 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              "h-8 flex-shrink-0 rounded-md px-3 text-xs font-medium transition-colors",
              active === s.id
                ? "bg-black text-white"
                : "text-neutral-700 hover:bg-neutral-100 hover:text-black",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EditorHeader({
  site,
  saveState,
  savedAt,
  onTogglePublish,
}: {
  site: UnknownSite;
  saveState: SaveState;
  savedAt: Date | null;
  onTogglePublish: () => void;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[color:var(--border)] bg-white px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/dashboard/sites"
          className="inline-flex h-9 items-center rounded-md border border-[color:var(--border)] px-3 text-xs font-medium text-black hover:border-black"
        >
          ← Saytlar
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black">
            {site.content.businessName}
          </p>
          <p className="truncate text-[11px] text-neutral-500">
            weblinker.uz/<span className="font-mono">{site.slug}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SaveIndicator state={saveState} savedAt={savedAt} />
        <Button
          variant="secondary"
          size="sm"
          href={`/${site.slug}`}
          target="_blank"
        >
          Ochib ko&apos;rish
        </Button>
        <Button
          size="sm"
          onClick={onTogglePublish}
          variant={site.status === "published" ? "secondary" : "primary"}
        >
          {site.status === "published" ? "Qoralama" : "Nashr qilish"}
        </Button>
      </div>
    </header>
  );
}

function SaveIndicator({
  state,
  savedAt,
}: {
  state: SaveState;
  savedAt: Date | null;
}) {
  if (state === "saving") {
    return (
      <span className="hidden items-center gap-2 text-xs text-neutral-500 sm:inline-flex">
        <Dot spinning /> Saqlanmoqda...
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="hidden items-center gap-2 text-xs text-red-700 sm:inline-flex">
        Saqlash amalga oshmadi
      </span>
    );
  }
  return (
    <span className="hidden items-center gap-2 text-xs text-neutral-500 sm:inline-flex">
      <Dot /> Saqlandi{savedAt ? ` · ${formatTime(savedAt)}` : ""}
    </span>
  );
}

function Dot({ spinning }: { spinning?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full bg-black",
        spinning && "animate-pulse",
      )}
    />
  );
}

function PreviewToolbar({ slug }: { slug: string }) {
  return (
    <div className="flex h-10 items-center justify-between border-b border-[color:var(--border)] bg-white px-4 text-xs text-neutral-600">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full border border-neutral-400" />
        <span className="h-2 w-2 rounded-full border border-neutral-400" />
        <span className="h-2 w-2 rounded-full border border-neutral-400" />
      </div>
      <span className="flex h-6 items-center gap-1.5 rounded border border-[color:var(--border)] bg-neutral-50 px-2 font-mono">
        weblinker.uz/{slug}
      </span>
      <span className="text-[11px] uppercase tracking-[0.12em]">jonli ko&apos;rinish</span>
    </div>
  );
}

function LandingSections({
  content,
  update,
}: {
  content: LandingContent;
  update: <K extends keyof LandingContent>(key: K, value: LandingContent[K]) => void;
}) {
  return (
    <>
      <Anchor id="hero" />
      <Section title="Hero bo'limi" description="Sayt yuqorisidagi katta sarlavha">
        <Field label="Kichik yorliq (eyebrow)" hint="Sarlavha ustida chiqadi">
          <TextInput
            value={content.heroEyebrow}
            onChange={(v) => update("heroEyebrow", v)}
          />
        </Field>
        <Field label="Asosiy sarlavha">
          <TextAreaInput
            value={content.heroTitle}
            onChange={(v) => update("heroTitle", v)}
            rows={2}
          />
        </Field>
        <Field label="Pastki matn">
          <TextAreaInput
            value={content.heroSubtitle}
            onChange={(v) => update("heroSubtitle", v)}
            rows={2}
          />
        </Field>
      </Section>

      <Anchor id="about" />
      <Section title="Biz haqimizda">
        <Field label="Tavsif matni">
          <TextAreaInput
            value={content.about}
            onChange={(v) => update("about", v)}
            rows={4}
          />
        </Field>
        <Field label="Ish vaqti (ko'p qatorli)" hint="Har qatorga alohida">
          <TextAreaInput
            value={content.hours}
            onChange={(v) => update("hours", v)}
            rows={3}
          />
        </Field>
      </Section>

      <Anchor id="stats" />
      <StatsEditor
        stats={content.stats}
        onChange={(stats) => update("stats", stats)}
      />

      <Anchor id="features" />
      <FeaturesEditor
        features={content.features}
        onChange={(features) => update("features", features)}
      />

      <Anchor id="services" />
      <ServicesEditor
        services={content.services}
        onChange={(services) => update("services", services)}
      />

      <Anchor id="gallery" />
      <Section title="Galereya" description="4 ta kartochka uchun joy">
        <div className="grid grid-cols-2 gap-3">
          {content.gallery.map((item, idx) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-[color:var(--border)] bg-neutral-50 p-3"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                #{idx + 1}
              </span>
              <TextInput
                value={item.emoji ?? ""}
                onChange={(v) =>
                  update(
                    "gallery",
                    content.gallery.map((g) =>
                      g.id === item.id ? { ...g, emoji: v } : g,
                    ),
                  )
                }
                placeholder="Emoji (ixtiyoriy)"
              />
              <TextInput
                value={item.caption ?? ""}
                onChange={(v) =>
                  update(
                    "gallery",
                    content.gallery.map((g) =>
                      g.id === item.id ? { ...g, caption: v } : g,
                    ),
                  )
                }
                placeholder="Izoh"
              />
            </div>
          ))}
        </div>
      </Section>

      <Anchor id="testimonials" />
      <TestimonialsEditor
        testimonials={content.testimonials}
        onChange={(testimonials) => update("testimonials", testimonials)}
      />

      <Anchor id="cta" />
      <Section title="Aloqa chaqiruvi" description="Eng pastki qora bo'lim">
        <Field label="Sarlavha">
          <TextAreaInput
            value={content.ctaTitle}
            onChange={(v) => update("ctaTitle", v)}
            rows={2}
          />
        </Field>
        <Field label="Pastki matn">
          <TextAreaInput
            value={content.ctaSubtitle}
            onChange={(v) => update("ctaSubtitle", v)}
            rows={3}
          />
        </Field>
      </Section>
    </>
  );
}

function StatsEditor({
  stats,
  onChange,
}: {
  stats: StatItem[];
  onChange: (next: StatItem[]) => void;
}) {
  return (
    <Section title="Statistika" description="Maksimum 4 ta raqam — ishonch qozonish uchun">
      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <div
            key={stat.id}
            className="space-y-3 rounded-xl border border-[color:var(--border)] bg-neutral-50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Raqam #{idx + 1}
              </span>
              {stats.length > 1 ? (
                <IconButton
                  onClick={() => onChange(stats.filter((s) => s.id !== stat.id))}
                  label="O'chirish"
                  destructive
                >
                  <XIcon />
                </IconButton>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Qiymat">
                <TextInput
                  value={stat.value}
                  onChange={(v) =>
                    onChange(stats.map((s) => (s.id === stat.id ? { ...s, value: v } : s)))
                  }
                  placeholder="500+"
                />
              </Field>
              <Field label="Izoh">
                <TextInput
                  value={stat.label}
                  onChange={(v) =>
                    onChange(stats.map((s) => (s.id === stat.id ? { ...s, label: v } : s)))
                  }
                  placeholder="Mijoz"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      {stats.length < 4 ? (
        <AddButton
          onClick={() =>
            onChange([...stats, { id: newId(), value: "0", label: "Ko'rsatkich" }])
          }
          label="Raqam qo'shish"
        />
      ) : null}
    </Section>
  );
}

function FeaturesEditor({
  features,
  onChange,
}: {
  features: FeatureItem[];
  onChange: (next: FeatureItem[]) => void;
}) {
  return (
    <Section title="Afzalliklar" description="Nima uchun mijoz sizni tanlashi kerak">
      <div className="space-y-3">
        {features.map((feature, idx) => (
          <div
            key={feature.id}
            className="space-y-3 rounded-xl border border-[color:var(--border)] bg-neutral-50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Afzallik #{idx + 1}
              </span>
              {features.length > 1 ? (
                <IconButton
                  onClick={() =>
                    onChange(features.filter((f) => f.id !== feature.id))
                  }
                  label="O'chirish"
                  destructive
                >
                  <XIcon />
                </IconButton>
              ) : null}
            </div>

            <Field label="Ikonka">
              <IconPicker
                value={feature.icon}
                onChange={(v) =>
                  onChange(
                    features.map((f) =>
                      f.id === feature.id ? { ...f, icon: v } : f,
                    ),
                  )
                }
              />
            </Field>
            <Field label="Sarlavha">
              <TextInput
                value={feature.title}
                onChange={(v) =>
                  onChange(
                    features.map((f) =>
                      f.id === feature.id ? { ...f, title: v } : f,
                    ),
                  )
                }
              />
            </Field>
            <Field label="Tavsif">
              <TextAreaInput
                value={feature.description}
                onChange={(v) =>
                  onChange(
                    features.map((f) =>
                      f.id === feature.id ? { ...f, description: v } : f,
                    ),
                  )
                }
                rows={2}
              />
            </Field>
          </div>
        ))}
      </div>
      {features.length < 6 ? (
        <AddButton
          onClick={() =>
            onChange([
              ...features,
              {
                id: newId(),
                icon: "star",
                title: "Yangi afzallik",
                description: "",
              },
            ])
          }
          label="Afzallik qo'shish"
        />
      ) : null}
    </Section>
  );
}

function IconPicker({
  value,
  onChange,
}: {
  value: FeatureIconKind;
  onChange: (v: FeatureIconKind) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5 rounded-lg border border-[color:var(--border)] bg-white p-2">
      {FEATURE_ICON_OPTIONS.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => onChange(kind)}
          aria-label={kind}
          aria-pressed={value === kind}
          className={cn(
            "flex h-9 w-full items-center justify-center rounded-md border transition-colors",
            value === kind
              ? "border-black bg-black text-white"
              : "border-[color:var(--border)] text-black hover:border-black",
          )}
        >
          <FeatureIcon kind={kind} />
        </button>
      ))}
    </div>
  );
}

function ServicesEditor({
  services,
  onChange,
}: {
  services: ServiceItem[];
  onChange: (next: ServiceItem[]) => void;
}) {
  return (
    <Section
      title="Xizmatlar va narxlar"
      description="Mijozlarga ko'rsatadigan xizmatlar ro'yxati"
    >
      <div className="space-y-3">
        {services.map((service, idx) => (
          <div
            key={service.id}
            className="space-y-3 rounded-xl border border-[color:var(--border)] bg-neutral-50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Xizmat #{idx + 1}
              </span>
              {services.length > 1 ? (
                <IconButton
                  onClick={() =>
                    onChange(services.filter((s) => s.id !== service.id))
                  }
                  label="O'chirish"
                  destructive
                >
                  <XIcon />
                </IconButton>
              ) : null}
            </div>
            <Field label="Nomi">
              <TextInput
                value={service.name}
                onChange={(v) =>
                  onChange(
                    services.map((s) =>
                      s.id === service.id ? { ...s, name: v } : s,
                    ),
                  )
                }
              />
            </Field>
            <Field label="Narxi">
              <TextInput
                value={service.price}
                onChange={(v) =>
                  onChange(
                    services.map((s) =>
                      s.id === service.id ? { ...s, price: v } : s,
                    ),
                  )
                }
                placeholder="100 000 so'm"
              />
            </Field>
            <Field label="Tavsif (ixtiyoriy)">
              <TextAreaInput
                value={service.description ?? ""}
                onChange={(v) =>
                  onChange(
                    services.map((s) =>
                      s.id === service.id ? { ...s, description: v } : s,
                    ),
                  )
                }
                rows={2}
              />
            </Field>
          </div>
        ))}
      </div>
      <AddButton
        onClick={() =>
          onChange([
            ...services,
            {
              id: newId(),
              name: "Yangi xizmat",
              price: "0 so'm",
              description: "",
            },
          ])
        }
        label="Xizmat qo'shish"
      />
    </Section>
  );
}

function TestimonialsEditor({
  testimonials,
  onChange,
}: {
  testimonials: Testimonial[];
  onChange: (next: Testimonial[]) => void;
}) {
  return (
    <Section
      title="Mijozlar fikri"
      description="Ijobiy sharhlar ishonch uyg'otadi. 2-6 ta yozing."
    >
      <div className="space-y-3">
        {testimonials.map((t, idx) => (
          <div
            key={t.id}
            className="space-y-3 rounded-xl border border-[color:var(--border)] bg-neutral-50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Sharh #{idx + 1}
              </span>
              {testimonials.length > 1 ? (
                <IconButton
                  onClick={() => onChange(testimonials.filter((x) => x.id !== t.id))}
                  label="O'chirish"
                  destructive
                >
                  <XIcon />
                </IconButton>
              ) : null}
            </div>

            <Field label="Sharh matni">
              <TextAreaInput
                value={t.text}
                onChange={(v) =>
                  onChange(
                    testimonials.map((x) => (x.id === t.id ? { ...x, text: v } : x)),
                  )
                }
                rows={3}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ism">
                <TextInput
                  value={t.author}
                  onChange={(v) =>
                    onChange(
                      testimonials.map((x) => (x.id === t.id ? { ...x, author: v } : x)),
                    )
                  }
                  placeholder="Aziza K."
                />
              </Field>
              <Field label="Kim (ixtiyoriy)">
                <TextInput
                  value={t.role ?? ""}
                  onChange={(v) =>
                    onChange(
                      testimonials.map((x) => (x.id === t.id ? { ...x, role: v } : x)),
                    )
                  }
                  placeholder="Doimiy mijoz"
                />
              </Field>
            </div>
            <Field label="Baho">
              <RatingPicker
                value={t.rating}
                onChange={(v) =>
                  onChange(
                    testimonials.map((x) => (x.id === t.id ? { ...x, rating: v } : x)),
                  )
                }
              />
            </Field>
          </div>
        ))}
      </div>
      {testimonials.length < 6 ? (
        <AddButton
          onClick={() =>
            onChange([
              ...testimonials,
              {
                id: newId(),
                author: "Yangi mijoz",
                role: "",
                text: "",
                rating: 5,
              },
            ])
          }
          label="Sharh qo'shish"
        />
      ) : null}
    </Section>
  );
}

function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} yulduz`}
          className="p-1 text-black transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 14 14"
            fill={n <= value ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M7 1.5L8.8 5.2L12.7 5.7L9.9 8.5L10.7 12.3L7 10.4L3.3 12.3L4.1 8.5L1.3 5.7L5.2 5.2L7 1.5Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-[color:var(--border)] text-sm font-medium text-black transition-colors hover:border-black"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {label}
    </button>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function formatTime(d: Date): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function buildSiteUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/${slug}`;
  }
  return `https://weblinker.uz/${slug}`;
}

