export type SiteType = "vizitka" | "landing";

export type VizitkaTemplateId =
  | "minimal"
  | "linktree"
  | "social-wall"
  | "dark"
  | "card"
  | "polaroid"
  | "ticket";
export type LandingTemplateId = "default";
export type TemplateId = VizitkaTemplateId | LandingTemplateId;

export type SiteImage = {
  dataUrl: string;
  sizeBytes: number;
  name: string;
};

export type ColorThemeId =
  // Dark set
  | "mono"
  | "graphite"
  | "navy"
  | "forest"
  | "burgundy"
  | "chocolate"
  | "indigo"
  | "teal"
  // Light set
  | "silver"
  | "sky"
  | "sage"
  | "rose"
  | "peach"
  | "lilac"
  | "mint"
  | "sunshine";

export type ColorTone = "dark" | "light";

export type ColorTheme = {
  id: ColorThemeId;
  name: string;
  tone: ColorTone;
  primary: string;
  primaryDark: string;
  primaryContrast: string;
  soft: string;
};

export const COLOR_THEMES: ColorTheme[] = [
  // Dark set — har biri alohida rang spektrida
  { id: "mono",      name: "Mono",      tone: "dark",  primary: "#000000", primaryDark: "#0a0a0a", primaryContrast: "#ffffff", soft: "#f4f4f5" },
  { id: "graphite",  name: "Slate",     tone: "dark",  primary: "#334155", primaryDark: "#0f172a", primaryContrast: "#ffffff", soft: "#f1f5f9" },
  { id: "navy",      name: "Navy",      tone: "dark",  primary: "#1e3a8a", primaryDark: "#0b1a3f", primaryContrast: "#ffffff", soft: "#dbeafe" },
  { id: "teal",      name: "Cyan",      tone: "dark",  primary: "#0e7490", primaryDark: "#083344", primaryContrast: "#ffffff", soft: "#cffafe" },
  { id: "forest",    name: "Forest",    tone: "dark",  primary: "#14532d", primaryDark: "#052e16", primaryContrast: "#ffffff", soft: "#dcfce7" },
  { id: "chocolate", name: "Chocolate", tone: "dark",  primary: "#78350f", primaryDark: "#2b1204", primaryContrast: "#ffffff", soft: "#fef3c7" },
  { id: "burgundy",  name: "Burgundy",  tone: "dark",  primary: "#881337", primaryDark: "#3f0617", primaryContrast: "#ffffff", soft: "#fecdd3" },
  { id: "indigo",    name: "Plum",      tone: "dark",  primary: "#6b21a8", primaryDark: "#3b0764", primaryContrast: "#ffffff", soft: "#f3e8ff" },
  // Light set — pastel, her biri alohida rang oilasida
  { id: "silver",    name: "Silver",    tone: "light", primary: "#e4e4e7", primaryDark: "#3f3f46", primaryContrast: "#18181b", soft: "#fafafa" },
  { id: "sky",       name: "Sky",       tone: "light", primary: "#bae6fd", primaryDark: "#075985", primaryContrast: "#0c4a6e", soft: "#e0f2fe" },
  { id: "mint",      name: "Mint",      tone: "light", primary: "#a7f3d0", primaryDark: "#047857", primaryContrast: "#134e4a", soft: "#d1fae5" },
  { id: "sage",      name: "Lime",      tone: "light", primary: "#d9f99d", primaryDark: "#3f6212", primaryContrast: "#1a2e05", soft: "#ecfccb" },
  { id: "sunshine",  name: "Sunshine",  tone: "light", primary: "#fef08a", primaryDark: "#a16207", primaryContrast: "#713f12", soft: "#fef9c3" },
  { id: "peach",     name: "Peach",     tone: "light", primary: "#fed7aa", primaryDark: "#9a3412", primaryContrast: "#7c2d12", soft: "#ffedd5" },
  { id: "rose",      name: "Rose",      tone: "light", primary: "#fbcfe8", primaryDark: "#9f1239", primaryContrast: "#831843", soft: "#fce7f3" },
  { id: "lilac",     name: "Lilac",     tone: "light", primary: "#ddd6fe", primaryDark: "#6d28d9", primaryContrast: "#4c1d95", soft: "#ede9fe" },
];

export const DARK_THEMES = COLOR_THEMES.filter((t) => t.tone === "dark");
export const LIGHT_THEMES = COLOR_THEMES.filter((t) => t.tone === "light");

export function getColorTheme(id: ColorThemeId | undefined): ColorTheme {
  return COLOR_THEMES.find((t) => t.id === id) ?? COLOR_THEMES[0];
}

export type SocialNetwork =
  | "instagram"
  | "telegram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "x"
  | "threads"
  | "whatsapp"
  | "website";

export type SocialItem = {
  id: string;
  network: SocialNetwork;
  value: string;
};

export type SocialLinks = SocialItem[];

export type ServiceItem = {
  id: string;
  name: string;
  price: string;
  description?: string;
};

export type GalleryItem = {
  id: string;
  caption?: string;
  emoji?: string;
};

export type FeatureIconKind =
  | "leaf"
  | "fire"
  | "clock"
  | "shield"
  | "package"
  | "star"
  | "users"
  | "award"
  | "spark"
  | "heart";

export type FeatureItem = {
  id: string;
  icon: FeatureIconKind;
  title: string;
  description: string;
};

export type StatItem = {
  id: string;
  value: string;
  label: string;
};

export type Testimonial = {
  id: string;
  author: string;
  role?: string;
  text: string;
  rating: number;
};

export type PatternId =
  | "none"
  | "dots"
  | "grid"
  | "diagonal"
  | "stripes"
  | "checker";

export type PatternMeta = {
  id: PatternId;
  name: string;
};

export const PATTERNS: PatternMeta[] = [
  { id: "none", name: "Toza" },
  { id: "dots", name: "Nuqtalar" },
  { id: "grid", name: "To'r" },
  { id: "diagonal", name: "Diagonal" },
  { id: "stripes", name: "Chiziqlar" },
  { id: "checker", name: "Katak" },
];

export type VizitkaContent = {
  businessName: string;
  category: string;
  tagline: string;
  description: string;
  phone: string;
  address: string;
  mapsUrl?: string;
  hoursLine: string;
  social: SocialLinks;
  accentInitials: string;
  heroImage?: SiteImage;
  logoImage?: SiteImage;
  colorTheme: ColorThemeId;
  pattern: PatternId;
};

export type LandingContent = VizitkaContent & {
  heroTitle: string;
  heroSubtitle: string;
  heroEyebrow: string;
  about: string;
  hours: string;
  services: ServiceItem[];
  gallery: GalleryItem[];
  features: FeatureItem[];
  stats: StatItem[];
  testimonials: Testimonial[];
  ctaTitle: string;
  ctaSubtitle: string;
};

export type SiteStatus = "draft" | "published" | "paused";

export type Site<T extends SiteType = SiteType> = {
  id: string;
  slug: string;
  type: T;
  templateId: TemplateId;
  status: SiteStatus;
  createdAt: string;
  updatedAt: string;
  trialEndsAt: string;
  subscriptionEndsAt?: string;
  content: T extends "vizitka" ? VizitkaContent : LandingContent;
};

export type UnknownSite = Site<"vizitka"> | Site<"landing">;

export type VizitkaTemplateMeta = {
  id: VizitkaTemplateId;
  name: string;
  description: string;
  supportsHero: boolean;
};

export const VIZITKA_TEMPLATES: VizitkaTemplateMeta[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Ism, telefon va ijtimoiy tarmoqlar — faqat asosiy",
    supportsHero: false,
  },
  {
    id: "linktree",
    name: "Linktree",
    description: "Ustma-ust stacked tugmalar — barcha link bir ustunda",
    supportsHero: false,
  },
  {
    id: "social-wall",
    name: "Social Wall",
    description: "4 ta katta kontakt tile — taps-driven",
    supportsHero: false,
  },
  {
    id: "dark",
    name: "Dark",
    description: "Qora fon, markazlashgan minimal",
    supportsHero: false,
  },
  {
    id: "card",
    name: "Business Card",
    description: "Markazda biznes kartasi",
    supportsHero: false,
  },
  {
    id: "polaroid",
    name: "Polaroid",
    description: "Aylanib qolgan polaroid — rasm + lenta",
    supportsHero: false,
  },
  {
    id: "ticket",
    name: "Ticket",
    description: "Bilet uslubi — perforatsiyalangan qirralar",
    supportsHero: false,
  },
];
