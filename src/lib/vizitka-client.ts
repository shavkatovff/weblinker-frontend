import { getAccessToken } from "./auth-storage";
import { apiBaseUrl } from "./api-base";
import type { CreateClickPaymentRes } from "./click-checkout";
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
  /** 3, 6 yoki 12 oy — `expiredAt` shu muddatgacha */
  subscriptionMonths?: 3 | 6 | 12;
};

export async function postVizitka(
  body: CreateVizitkaBody & Record<string, string | number | undefined>,
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
    let m = await r.text();
    try {
      const j = JSON.parse(m) as { message?: string | string[] };
      if (j.message) {
        m = Array.isArray(j.message) ? j.message.join(", ") : j.message;
      }
    } catch {
      /* raw */
    }
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
  subscriptionMonths?: 3 | 6 | 12;
}): CreateVizitkaBody & Record<string, string | number | undefined> {
  const basePayload: CreateVizitkaBody = {
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
  if (opts.subscriptionMonths != null) {
    basePayload.subscriptionMonths = opts.subscriptionMonths;
  }
  if (opts.mapsUrl.trim()) {
    basePayload.mapLink = opts.mapsUrl.trim();
  }
  if (opts.heroDataUrl) {
    basePayload.photoUrl = opts.heroDataUrl;
  }
  return { ...basePayload, ...socialToFlat(opts.social) };
}

export async function createVizitkaSubscriptionPayment(opts: {
  vizitkaId: string;
  subscriptionMonths: 3 | 6 | 12;
  amountSom: number;
}): Promise<CreateClickPaymentRes> {
  const t = getAccessToken();
  if (!t) throw new Error("Kirish talab qilinadi");
  const r = await fetch(`${base()}/payments/click`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`,
    },
    body: JSON.stringify({
      amount: Math.floor(opts.amountSom),
      vizitkaId: opts.vizitkaId,
      subscriptionMonths: opts.subscriptionMonths,
    }),
  });
  if (!r.ok) {
    const m = await r.text();
    throw new Error(m || `HTTP ${r.status}`);
  }
  return (await r.json()) as CreateClickPaymentRes;
}

/** JWT bilan bitta vizitka (tahrir sahifasi — bazadan yangi logo va h.k.) */
export async function fetchVizitkaById(
  id: string,
): Promise<{ site: unknown } | null> {
  const t = getAccessToken();
  if (!t) return null;
  const r = await fetch(`${base()}/vizitka/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!r.ok) return null;
  return (await r.json()) as { site: unknown };
}

export async function uploadVizitkaLogo(
  vizitkaId: string,
  file: File,
): Promise<{ site: unknown }> {
  const t = getAccessToken();
  if (!t) throw new Error("Kirish talab qilinadi");
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(
    `${base()}/vizitka/${encodeURIComponent(vizitkaId)}/logo`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${t}` },
      body: fd,
    },
  );
  if (!r.ok) {
    const m = await r.text();
    throw new Error(m || `HTTP ${r.status}`);
  }
  return (await r.json()) as { site: unknown };
}

export async function patchVizitka(
  id: string,
  body: Record<string, unknown>,
): Promise<{ site: unknown }> {
  const t = getAccessToken();
  if (!t) throw new Error("Kirish talab qilinadi");
  const r = await fetch(`${base()}/vizitka/${encodeURIComponent(id)}`, {
    method: "PATCH",
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
