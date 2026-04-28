import type { UnknownSite } from "@/lib/store/types";

const base = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
