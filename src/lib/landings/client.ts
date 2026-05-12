import { apiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-storage";
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

export async function createLanding(payload: {
  name: string;
} & LandingPatch): Promise<LandingRecord> {
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
  kind: "hero" | "about",
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

/** Ommaviy domen: `weblinker.uz/{name}` orqali ochilganda chaqiriladi (auth shart emas) */
export async function fetchPublicLandingByName(
  name: string,
): Promise<LandingRecord | null> {
  const r = await fetch(
    `${base()}/landings/public/${encodeURIComponent(name)}`,
    { cache: "no-store" },
  );
  if (r.status === 404) return null;
  const data = await readJsonResponse<{ landing: LandingRecord }>(r);
  return data.landing;
}
