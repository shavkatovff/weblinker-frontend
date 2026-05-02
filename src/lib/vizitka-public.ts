import type { UnknownSite } from "@/lib/store/types";
import { apiBaseUrl } from "./api-base";

const base = () => apiBaseUrl();

export type PublicPausePayload = {
  kind: "paused" | "expired";
  slug: string;
  businessName: string;
};

export type PublicVizitkaFetchResult =
  | { site: UnknownSite }
  | { publicPause: PublicPausePayload };

/**
 * API: { site } — faol sayt; { publicPause } — pauza / obuna tugagan.
 */
export async function fetchPublicVizitkaFromApi(
  slug: string,
): Promise<PublicVizitkaFetchResult | null> {
  try {
    const r = await fetch(
      `${base()}/vizitka/public/${encodeURIComponent(slug)}`,
      { next: { revalidate: 20 } },
    );
    if (r.status === 404) {
      return null;
    }
    if (!r.ok) {
      return null;
    }
    const json = (await r.json()) as Record<string, unknown>;
    if (json.publicPause && typeof json.publicPause === "object") {
      return { publicPause: json.publicPause as PublicPausePayload };
    }
    if (json.site) {
      return { site: json.site as UnknownSite };
    }
    return null;
  } catch {
    return null;
  }
}
