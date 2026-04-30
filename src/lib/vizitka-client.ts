import { getAccessToken } from "./auth-storage";
import { apiBaseUrl } from "./api-base";
import type { SocialItem, SocialNetwork } from "./store/types";

const base = () => apiBaseUrl();

const NETWORK_TO_FIELD: Partial<Record<SocialNetwork, string>> = {
  instagram: "instagramLink",
  telegram: "telegramLink",
  tiktok: "tiktokLink",
  youtube: "youtubeLink",
  facebook: "facebookLink",
  linkedin: "linkedinLink",
  x: "xLink",
  threads: "threadsLink",
  whatsapp: "whatsappLink",
  website: "websaytLink",
};

function socialToFlat(social: SocialItem[]) {
  const o: Record<string, string> = {};
  for (const s of social) {
    const key = NETWORK_TO_FIELD[s.network];
    if (key) o[key] = s.value;
  }
  return o;
}

export type CreateVizitkaBody = {
  name: string;
  headline: string;
  plan?: string;
  category?: string;
  photoUrl?: string;
  contactNumber?: string;
  address?: string;
  workHour?: string;
  shortDescription?: string;
  description?: string;
  templateId?: string;
  colorThemeId?: string;
  patternId?: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED";
  mapLink?: string;
};

export async function postVizitka(
  body: CreateVizitkaBody & Record<string, string>,
): Promise<{ site: unknown } | null> {
  const t = getAccessToken();
  if (!t) {
    return null;
  }
  const r = await fetch(`${base()}/vizitka`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`,
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const m = await r.text();
    throw new Error(m || `HTTP ${r.status}`);
  }
  return (await r.json()) as { site: unknown };
}

export function buildVizitkaCreatePayload(opts: {
  name: string;
  headline: string;
  category: string;
  tagline: string;
  description: string;
  phone: string;
  address: string;
  hoursLine: string;
  mapsUrl: string;
  social: SocialItem[];
  templateId: string;
  colorTheme: string;
  pattern: string;
  heroDataUrl?: string;
}): CreateVizitkaBody & Record<string, string> {
  const base: CreateVizitkaBody = {
    name: opts.name,
    headline: opts.headline,
    category: opts.category,
    shortDescription: opts.tagline,
    description: opts.description,
    contactNumber: opts.phone,
    address: opts.address,
    workHour: opts.hoursLine,
    templateId: opts.templateId,
    colorThemeId: opts.colorTheme,
    patternId: opts.pattern,
    status: "ACTIVE",
    plan: "vizitka",
  };
  if (opts.mapsUrl.trim()) {
    base.mapLink = opts.mapsUrl.trim();
  }
  if (opts.heroDataUrl) {
    base.photoUrl = opts.heroDataUrl;
  }
  return { ...base, ...socialToFlat(opts.social) };
}
