import type { UnknownSite } from "@/lib/store/types";
import { apiBaseUrl } from "./api-base";

const base = () => apiBaseUrl();

export async function fetchPublicVizitkaFromApi(
  slug: string,
): Promise<{ site: UnknownSite } | null> {
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
    return (await r.json()) as { site: UnknownSite };
  } catch {
    return null;
  }
}
