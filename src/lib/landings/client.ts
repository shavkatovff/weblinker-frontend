import { apiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-storage";
import { clickInvoiceAmountSom } from "@/lib/click-invoice-amount";
import type { CreateClickPaymentRes } from "@/lib/click-checkout";
import type { PublicPausePayload } from "@/lib/vizitka-public";
import type { LandingPatch, LandingRecord } from "./types";

const base = () => apiBaseUrl();

function authHeaders(): Record<string, string> {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function errorMessageFromJsonText(text: string): string | null {
  try {
    const j = JSON.parse(text) as { message?: string | string[] };
    if (j.message) {
      return Array.isArray(j.message) ? j.message.join(", ") : j.message;
    }
  } catch {
    /* not JSON */
  }
  return null;
}

/** Javob tanasi bir marta o‘qiladi; JSON emas bo‘lsa (masalan HTML) tushunarli xato. */
async function readJsonResponse<T>(r: Response): Promise<T> {
  const text = await r.text();
  if (!r.ok) {
    const fromApi = errorMessageFromJsonText(text);
    const fallback = text.slice(0, 500) || `HTTP ${r.status}`;
    throw new Error(fromApi ?? fallback);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const head = text.trimStart().slice(0, 20).toLowerCase();
    if (head.startsWith("<!doctype") || head.startsWith("<html")) {
      throw new Error(
        "Server JSON o‘rniga HTML qaytardi. Odatda API ishlamayapti yoki Next.js /landings yo‘lini Nest ga proxylamagan — next.config.js da rewrite va Nest serverni tekshiring.",
      );
    }
    throw new Error("Javob JSON emas");
  }
}

export async function listMyLandings(): Promise<LandingRecord[]> {
  const r = await fetch(`${base()}/landings/mine`, {
    headers: authHeaders(),
  });
  const data = await readJsonResponse<{ landings: LandingRecord[] }>(r);
  return data.landings;
}

export async function createLanding(
  payload: {
    name: string;
    subscriptionMonths?: 6 | 12;
  } & LandingPatch,
): Promise<LandingRecord> {
  const r = await fetch(`${base()}/landings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await readJsonResponse<{ landing: LandingRecord }>(r);
  return data.landing;
}

export async function getMyLanding(id: string): Promise<LandingRecord> {
  const r = await fetch(`${base()}/landings/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  });
  const data = await readJsonResponse<{ landing: LandingRecord }>(r);
  return data.landing;
}

export async function updateLanding(
  id: string,
  patch: LandingPatch,
): Promise<LandingRecord> {
  const r = await fetch(`${base()}/landings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(patch),
  });
  const data = await readJsonResponse<{ landing: LandingRecord }>(r);
  return data.landing;
}

export async function deleteLanding(id: string): Promise<void> {
  const r = await fetch(`${base()}/landings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await readJsonResponse<{ ok: true }>(r);
}

export async function uploadLandingImage(
  id: string,
  kind: "hero" | "about" | "logo",
  file: File,
): Promise<LandingRecord> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(
    `${base()}/landings/${encodeURIComponent(id)}/upload?kind=${kind}`,
    {
      method: "POST",
      headers: authHeaders(),
      body: fd,
    },
  );
  const data = await readJsonResponse<{ landing: LandingRecord }>(r);
  return data.landing;
}

export type PublicLandingFetchResult =
  | { landing: LandingRecord }
  | { publicPause: PublicPausePayload; landing: LandingRecord };

/** Ommaviy domen: `weblinker.uz/{name}` — faol yoki muddati tugagan */
export async function fetchPublicLandingFromApi(
  name: string,
): Promise<PublicLandingFetchResult | null> {
  try {
    const r = await fetch(
      `${base()}/landings/public/${encodeURIComponent(name)}`,
      { cache: "no-store" },
    );
    if (r.status === 404) return null;
    const json = (await r.json()) as Record<string, unknown>;
    if (json.publicPause && typeof json.publicPause === "object") {
      return {
        publicPause: json.publicPause as PublicPausePayload,
        landing: json.landing as LandingRecord,
      };
    }
    if (json.landing && typeof json.landing === "object") {
      return { landing: json.landing as LandingRecord };
    }
    return null;
  } catch {
    return null;
  }
}

export async function extendLandingSubscription(
  id: string,
  months: 6 | 12,
): Promise<LandingRecord> {
  const r = await fetch(
    `${base()}/landings/${encodeURIComponent(id)}/extend-subscription`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ months }),
    },
  );
  const data = await readJsonResponse<{ landing: LandingRecord }>(r);
  return data.landing;
}

export async function createLandingSubscriptionPayment(opts: {
  landingId: string;
  subscriptionMonths: 6 | 12;
  amountSom: number;
}): Promise<CreateClickPaymentRes> {
  if (!getAccessToken()) throw new Error("Kirish talab qilinadi");
  const r = await fetch(`${base()}/payments/click`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      amount: clickInvoiceAmountSom(opts.amountSom),
      landingId: opts.landingId,
      subscriptionMonths: opts.subscriptionMonths,
    }),
  });
  return readJsonResponse<CreateClickPaymentRes>(r);
}

/** @deprecated `fetchPublicLandingFromApi` ishlating */
export async function fetchPublicLandingByName(
  name: string,
): Promise<LandingRecord | null> {
  const res = await fetchPublicLandingFromApi(name);
  if (!res) return null;
  if ("publicPause" in res) return res.landing;
  return res.landing;
}
