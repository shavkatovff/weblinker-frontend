import { Site, SiteType, TemplateId, UnknownSite } from "./types";
import { defaultLandingContent, defaultVizitkaContent } from "./defaults";

const STORAGE_KEY = "weblinker.sites.v1";
const SUBSCRIBERS = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAll(): UnknownSite[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as UnknownSite[];
  } catch {
    return [];
  }
}

function writeAll(sites: UnknownSite[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  SUBSCRIBERS.forEach((cb) => cb());
  window.dispatchEvent(new CustomEvent("weblinker:sites-updated"));
}

export function subscribe(cb: () => void): () => void {
  SUBSCRIBERS.add(cb);
  return () => {
    SUBSCRIBERS.delete(cb);
  };
}

export function listSites(): UnknownSite[] {
  return readAll().sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getSiteById(id: string): UnknownSite | undefined {
  return readAll().find((s) => s.id === id);
}

export function getSiteBySlug(slug: string): UnknownSite | undefined {
  return readAll().find((s) => s.slug === slug);
}

export function slugExists(slug: string, ignoreId?: string): boolean {
  return readAll().some((s) => s.slug === slug && s.id !== ignoreId);
}

export function saveSite(site: UnknownSite): void {
  const all = readAll();
  const idx = all.findIndex((s) => s.id === site.id);
  const next = { ...site, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = next;
  else all.push(next);
  writeAll(all);
}

export function deleteSite(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}

/**
 * Mahalliy `vizitka`larni serverdagi ro‘yxat bilan almashtiradi — faqat joriy JWT foydalanuvchisining
 * vizitkalari qoladi; boshqa akkaunt qoldiqlari olib tashlanadi. `landing`lar o‘zgarmaydi.
 */
export function replaceVizitkasFromServer(vizitkasFromServer: UnknownSite[]): void {
  const landings = readAll().filter((s) => s.type === "landing");
  const vizitkas = vizitkasFromServer.filter((s) => s.type === "vizitka");
  writeAll([...landings, ...vizitkas]);
}

export function duplicateSite(id: string): UnknownSite | undefined {
  const src = getSiteById(id);
  if (!src) return undefined;
  const copy: UnknownSite = {
    ...src,
    id: newId(),
    slug: suggestSlug(src.slug + "-nusxa"),
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveSite(copy);
  return copy;
}

export function createSite(params: {
  type: SiteType;
  businessName: string;
  slug: string;
  templateId?: TemplateId;
  partial?: Partial<ReturnType<typeof defaultVizitkaContent>>;
}): UnknownSite {
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 7);
  trialEnd.setHours(23, 59, 59, 999);

  const base = {
    id: newId(),
    slug: params.slug,
    status: "draft" as const,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
  };

  const defaultTemplate: TemplateId =
    params.type === "vizitka" ? "minimal" : "default";
  const templateId: TemplateId = params.templateId ?? defaultTemplate;

  const site: UnknownSite =
    params.type === "vizitka"
      ? {
          ...base,
          type: "vizitka",
          templateId,
          content: {
            ...defaultVizitkaContent(params.businessName),
            ...(params.partial ?? {}),
          },
        }
      : {
          ...base,
          type: "landing",
          templateId,
          content: {
            ...defaultLandingContent(params.businessName),
            ...(params.partial ?? {}),
          },
        };

  saveSite(site);
  return site;
}

export function newId(): string {
  if (isBrowser() && typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/['`'"]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function suggestSlug(seed: string): string {
  const base = normalizeSlug(seed) || "sayt";
  let candidate = base;
  let n = 2;
  while (slugExists(candidate)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

/** Qolgan sinov kunlari (kalendar bo‘yicha): har kecha 00:00 dan keyin 1 ga kamayadi */
export function trialDaysLeft(site: Pick<Site, "trialEndsAt" | "subscriptionEndsAt">): number {
  const endsIso = site.subscriptionEndsAt ?? site.trialEndsAt;
  const end = new Date(endsIso);
  const now = new Date();
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((endDay.getTime() - today.getTime()) / 86400000);
  return Math.max(0, diff);
}
