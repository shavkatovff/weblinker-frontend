/**
 * Landing dizayn shablonlari (rang kombinatsiyalari).
 *
 * Faqat **rang**larni almashtiradi — kontent, tartib va animatsiyalar bir xil.
 * Har bir shablon CSS-o‘zgaruvchilarni `DemoChoyxonaSite` ildiziga uzatadi.
 *
 * `id` qiymatlari DB ustuni `landings.block_theme` bilan to‘g‘ridan-to‘g‘ri mos.
 */

export const LANDING_THEME_IDS = ["1", "2", "3", "4"] as const;
export type LandingThemeId = (typeof LANDING_THEME_IDS)[number];
export const DEFAULT_LANDING_THEME: LandingThemeId = "1";

export type LandingTheme = {
  id: LandingThemeId;
  /** Tanlovchi paneldagi nomi */
  title: string;
  /** Bo‘yoq qatori (preview chip uchun) */
  swatches: [string, string, string];
  /** CSS-variables — root inline `style`ga beriladi */
  vars: {
    "--c-bg": string;
    "--c-bg-soft": string;
    "--c-p-from": string;
    "--c-p-to": string;
    "--c-p-glow": string;
    "--c-p-solid": string;
    "--c-p-strong": string;
    "--c-p-tint": string;
    "--c-accent": string;
    "--c-footer-bg": string;
    "--c-footer-fg": string;
    "--c-footer-fg-2": string;
  };
};

export const LANDING_THEMES: Record<LandingThemeId, LandingTheme> = {
  "1": {
    id: "1",
    title: "Za'faron",
    swatches: ["#fff8ed", "#b56b25", "#355b33"],
    vars: {
      "--c-bg": "#fff8ed",
      "--c-bg-soft": "rgba(255,255,255,0.55)",
      "--c-p-from": "#d68f3e",
      "--c-p-to": "#7e4312",
      "--c-p-glow": "rgba(181,107,37,0.32)",
      "--c-p-solid": "#b56b25",
      "--c-p-strong": "#7e4312",
      "--c-p-tint": "rgba(181,107,37,0.12)",
      "--c-accent": "#355b33",
      "--c-footer-bg": "#20140c",
      "--c-footer-fg": "#fff2de",
      "--c-footer-fg-2": "#d9c5ad",
    },
  },
  "2": {
    id: "2",
    title: "Zumrad",
    swatches: ["#f3faf6", "#10b981", "#d97706"],
    vars: {
      "--c-bg": "#f3faf6",
      "--c-bg-soft": "rgba(255,255,255,0.55)",
      "--c-p-from": "#34d399",
      "--c-p-to": "#047857",
      "--c-p-glow": "rgba(16,185,129,0.32)",
      "--c-p-solid": "#10b981",
      "--c-p-strong": "#047857",
      "--c-p-tint": "rgba(16,185,129,0.14)",
      "--c-accent": "#d97706",
      "--c-footer-bg": "#062a1c",
      "--c-footer-fg": "#e8f3ed",
      "--c-footer-fg-2": "#a8c4b3",
    },
  },
  "3": {
    id: "3",
    title: "Indigo",
    swatches: ["#f6f5ff", "#6366f1", "#f59e0b"],
    vars: {
      "--c-bg": "#f6f5ff",
      "--c-bg-soft": "rgba(255,255,255,0.55)",
      "--c-p-from": "#818cf8",
      "--c-p-to": "#4338ca",
      "--c-p-glow": "rgba(99,102,241,0.32)",
      "--c-p-solid": "#6366f1",
      "--c-p-strong": "#4338ca",
      "--c-p-tint": "rgba(99,102,241,0.14)",
      "--c-accent": "#f59e0b",
      "--c-footer-bg": "#15102f",
      "--c-footer-fg": "#e9e7ff",
      "--c-footer-fg-2": "#b9b3d9",
    },
  },
  "4": {
    id: "4",
    title: "Atirgul",
    swatches: ["#fff5f5", "#f43f5e", "#f59e0b"],
    vars: {
      "--c-bg": "#fff5f5",
      "--c-bg-soft": "rgba(255,255,255,0.55)",
      "--c-p-from": "#fb7185",
      "--c-p-to": "#be123c",
      "--c-p-glow": "rgba(244,63,94,0.30)",
      "--c-p-solid": "#f43f5e",
      "--c-p-strong": "#be123c",
      "--c-p-tint": "rgba(244,63,94,0.12)",
      "--c-accent": "#f59e0b",
      "--c-footer-bg": "#1f0a13",
      "--c-footer-fg": "#fae8ee",
      "--c-footer-fg-2": "#c4a8b1",
    },
  },
};

export function getLandingTheme(id: LandingThemeId | string | undefined): LandingTheme {
  if (id && typeof id === "string" && (id as LandingThemeId) in LANDING_THEMES) {
    return LANDING_THEMES[id as LandingThemeId];
  }
  return LANDING_THEMES[DEFAULT_LANDING_THEME];
}
