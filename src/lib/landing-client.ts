import { api } from "./api";
import type { UnknownSite } from "./store/types";

export async function chargeLandingCreatePackage(
  months: 6 | 12,
): Promise<{ ok: true }> {
  return api<{ ok: true }>("/landing/charge-create-package", {
    method: "POST",
    body: JSON.stringify({ months }),
  });
}

/** AI bilan landing boshlang‘ich paketi — balansdan bir martalik yechim */
export async function chargeLandingAiStarter(): Promise<{ ok: true }> {
  return api<{ ok: true }>("/landing/charge-ai-starter", {
    method: "POST",
  });
}

export async function upsertLanding(body: {
  publicationId?: string;
  slug: string;
  templateId: "default" | "simple" | "marketing";
  status: "draft" | "published" | "paused";
  content: Record<string, unknown>;
}): Promise<{ site: unknown }> {
  return api<{ site: unknown }>("/landing/upsert", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchLandingPublication(
  publicationId: string,
): Promise<{ site: unknown } | null> {
  try {
    return await api<{ site: unknown }>(
      `/landing/${encodeURIComponent(publicationId)}`,
    );
  } catch {
    return null;
  }
}

export function isLandingSite(s: UnknownSite): s is Extract<UnknownSite, { type: "landing" }> {
  return s.type === "landing";
}
