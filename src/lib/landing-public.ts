import type { UnknownSite } from "@/lib/store/types";
import { apiBaseUrl } from "./api-base";

const base = () => apiBaseUrl();

export async function fetchPublicLandingFromApi(
  slug: string,
): Promise<{ site: UnknownSite } | null> {
  try {
    const r = await fetch(
      `${base()}/landing/public/${encodeURIComponent(slug)}`,
      { next: { revalidate: 15 } },
    );
    if (r.status === 404) return null;
    if (!r.ok) return null;
    const json = (await r.json()) as { site?: UnknownSite };
    if (json.site) return { site: json.site };
    return null;
  } catch {
    return null;
  }
}
