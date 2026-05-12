import { apiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-storage";
import type { LandingPatch, LandingRecord } from "./types";

const base = () => apiBaseUrl();

function authHeaders(): Record<string, string> {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function parseError(res: Response): Promise<string> {
  let raw = await res.text();
  try {
    const j = JSON.parse(raw) as { message?: string | string[] };
    if (j.message) {
      raw = Array.isArray(j.message) ? j.message.join(", ") : j.message;
    }
  } catch {
    /* raw */
  }
  return raw || `HTTP ${res.status}`;
}

export async function listMyLandings(): Promise<LandingRecord[]> {
  const r = await fetch(`${base()}/landings/mine`, {
    headers: authHeaders(),
  });
  if (!r.ok) throw new Error(await parseError(r));
  const data = (await r.json()) as { landings: LandingRecord[] };
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
  if (!r.ok) throw new Error(await parseError(r));
  const data = (await r.json()) as { landing: LandingRecord };
  return data.landing;
}

export async function getMyLanding(id: string): Promise<LandingRecord> {
  const r = await fetch(`${base()}/landings/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  });
  if (!r.ok) throw new Error(await parseError(r));
  const data = (await r.json()) as { landing: LandingRecord };
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
  if (!r.ok) throw new Error(await parseError(r));
  const data = (await r.json()) as { landing: LandingRecord };
  return data.landing;
}

export async function deleteLanding(id: string): Promise<void> {
  const r = await fetch(`${base()}/landings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!r.ok) throw new Error(await parseError(r));
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
  if (!r.ok) throw new Error(await parseError(r));
  const data = (await r.json()) as { landing: LandingRecord };
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
  if (!r.ok) throw new Error(await parseError(r));
  const data = (await r.json()) as { landing: LandingRecord };
  return data.landing;
}
