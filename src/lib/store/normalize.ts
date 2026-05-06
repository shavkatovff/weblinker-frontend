import {
  defaultLandingContent,
  defaultVizitkaContent,
  deriveInitials,
} from "./defaults";
import { newId } from "./store";
import {
  FaqItem,
  LandingContent,
  PatternId,
  ProcessStepItem,
  ServiceItem,
  SocialItem,
  SocialLinks,
  SocialNetwork,
  TemplateId,
  UnknownSite,
  VizitkaContent,
} from "./types";

const KNOWN_PATTERNS = new Set<PatternId>([
  "none",
  "dots",
  "grid",
  "diagonal",
  "stripes",
  "checker",
]);

const KNOWN_NETWORKS = new Set<SocialNetwork>([
  "instagram",
  "telegram",
  "tiktok",
  "youtube",
  "facebook",
  "linkedin",
  "x",
  "threads",
  "whatsapp",
  "website",
]);

function normalizeSocial(raw: unknown): SocialLinks {
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const obj = entry as Record<string, unknown>;
        const network = obj.network;
        const value = obj.value;
        if (typeof network !== "string" || !KNOWN_NETWORKS.has(network as SocialNetwork)) {
          return null;
        }
        return {
          id: typeof obj.id === "string" ? obj.id : newId(),
          network: network as SocialNetwork,
          value: typeof value === "string" ? value : "",
        } satisfies SocialItem;
      })
      .filter((x): x is SocialItem => x !== null);
  }
  if (raw && typeof raw === "object") {
    const legacy = raw as Record<string, unknown>;
    const order: SocialNetwork[] = ["instagram", "telegram", "youtube", "facebook"];
    const items: SocialItem[] = [];
    for (const network of order) {
      const value = legacy[network];
      if (typeof value === "string" && value.trim()) {
        items.push({ id: newId(), network, value });
      }
    }
    return items;
  }
  return [];
}

const VALID_VIZITKA_IDS = new Set([
  "minimal",
  "linktree",
  "social-wall",
  "dark",
  "card",
  "polaroid",
  "ticket",
]);

export function normalizeSite(site: UnknownSite): UnknownSite {
  if (site.type === "vizitka") {
    const id = (site.templateId as string) ?? "minimal";
    return {
      ...site,
      templateId: (VALID_VIZITKA_IDS.has(id) ? id : "minimal") as TemplateId,
      content: normalizeVizitka(site.content),
    };
  }
  return {
    ...site,
    templateId: (() => {
      const id = (site.templateId as string) ?? "simple";
      if (id === "default" || id === "simple" || id === "marketing") return id as TemplateId;
      return "simple" as TemplateId;
    })(),
    publicationId:
      typeof (site as { publicationId?: unknown }).publicationId === "string"
        ? (site as { publicationId: string }).publicationId
        : undefined,
    content: normalizeLanding(site.content),
  };
}

function normalizeVizitka(content: VizitkaContent): VizitkaContent {
  const defaults = defaultVizitkaContent(content.businessName || "Biznes");
  return {
    businessName: content.businessName || defaults.businessName,
    category: content.category ?? defaults.category,
    tagline: content.tagline ?? defaults.tagline,
    description: content.description ?? defaults.description,
    phone: content.phone ?? defaults.phone,
    address: content.address ?? defaults.address,
    mapsUrl: content.mapsUrl ?? "",
    hoursLine: content.hoursLine ?? defaults.hoursLine,
    social: normalizeSocial(content.social),
    accentInitials:
      content.accentInitials || deriveInitials(content.businessName || "Weblinker"),
    heroImage: content.heroImage,
    logoImage: content.logoImage,
    colorTheme: content.colorTheme ?? "mono",
    pattern: KNOWN_PATTERNS.has(content.pattern) ? content.pattern : "none",
  };
}

function normalizeServiceItem(s: ServiceItem): ServiceItem {
  const bullets = Array.isArray(s.bullets)
    ? s.bullets.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
    : undefined;
  return {
    ...s,
    bullets: bullets?.length ? bullets : undefined,
  };
}

function normalizeProcessSteps(
  raw: unknown,
  defaults: ProcessStepItem[],
): ProcessStepItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return defaults;
  return raw.map((item, i) => {
    if (!item || typeof item !== "object") return defaults[Math.min(i, defaults.length - 1)]!;
    const o = item as Record<string, unknown>;
    const def = defaults[Math.min(i, defaults.length - 1)]!;
    return {
      id: typeof o.id === "string" ? o.id : newId(),
      step: typeof o.step === "string" ? o.step : def.step,
      title: typeof o.title === "string" ? o.title : def.title,
      body: typeof o.body === "string" ? o.body : def.body,
    };
  });
}

function normalizeFaqItems(raw: unknown, defaults: FaqItem[]): FaqItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return defaults;
  return raw.map((item, i) => {
    if (!item || typeof item !== "object") return defaults[Math.min(i, defaults.length - 1)]!;
    const o = item as Record<string, unknown>;
    const def = defaults[Math.min(i, defaults.length - 1)]!;
    return {
      id: typeof o.id === "string" ? o.id : newId(),
      question: typeof o.question === "string" ? o.question : def.question,
      answer: typeof o.answer === "string" ? o.answer : def.answer,
    };
  });
}

function normalizeLanding(content: LandingContent): LandingContent {
  const vizitka = normalizeVizitka(content);
  const defaults = defaultLandingContent(content.businessName || "Biznes");
  return {
    ...vizitka,
    layoutVariant: content.layoutVariant ?? defaults.layoutVariant,
    sectionBlocks: content.sectionBlocks ?? defaults.sectionBlocks,
    contactSectionTitle: content.contactSectionTitle ?? defaults.contactSectionTitle,
    contactSectionSubtitle:
      content.contactSectionSubtitle ?? defaults.contactSectionSubtitle,
    heroEyebrow: content.heroEyebrow ?? defaults.heroEyebrow,
    heroTitle: content.heroTitle ?? defaults.heroTitle,
    heroSubtitle: content.heroSubtitle ?? defaults.heroSubtitle,
    about: content.about ?? defaults.about,
    hours: content.hours ?? defaults.hours,
    services: (content.services ?? defaults.services).map(normalizeServiceItem),
    gallery: content.gallery ?? defaults.gallery,
    features: content.features ?? defaults.features,
    stats: content.stats ?? defaults.stats,
    testimonials: content.testimonials ?? defaults.testimonials,
    ctaTitle: content.ctaTitle ?? defaults.ctaTitle,
    ctaSubtitle: content.ctaSubtitle ?? defaults.ctaSubtitle,
    heroCtaPrimaryLabel: content.heroCtaPrimaryLabel ?? defaults.heroCtaPrimaryLabel,
    heroCtaSecondaryLabel: content.heroCtaSecondaryLabel ?? defaults.heroCtaSecondaryLabel,
    servicesSectionTitle: content.servicesSectionTitle ?? defaults.servicesSectionTitle,
    servicesSectionSubtitle: content.servicesSectionSubtitle ?? defaults.servicesSectionSubtitle,
    processSectionTitle: content.processSectionTitle ?? defaults.processSectionTitle,
    processSteps: normalizeProcessSteps(content.processSteps, defaults.processSteps ?? []),
    faqSectionTitle: content.faqSectionTitle ?? defaults.faqSectionTitle,
    faqItems: normalizeFaqItems(content.faqItems, defaults.faqItems ?? []),
  };
}
