import { PublicSite } from "@/components/sites/public-site";
import { PublicPauseFromApi } from "@/components/sites/public-pause-from-api";
import { PublicSiteFromApi } from "@/components/sites/public-site-from-api";
import { PublicLanding } from "@/components/sites/public-landing";
import { fetchPublicLandingByName } from "@/lib/landings/client";
import { fetchPublicVizitkaFromApi } from "@/lib/vizitka-public";

export const dynamic = "force-dynamic";

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1) Vizitka topilsa — uni ko‘rsatamiz
  const res = await fetchPublicVizitkaFromApi(slug);
  if (res && "publicPause" in res) {
    return <PublicPauseFromApi pause={res.publicPause} />;
  }
  if (res && "site" in res && res.site) {
    return <PublicSiteFromApi site={res.site} />;
  }

  // 2) Landing topilsa — uni ko‘rsatamiz (yangi `Landing` modeli)
  const landing = await fetchPublicLandingByName(slug).catch(() => null);
  if (landing) {
    return <PublicLanding landing={landing} />;
  }

  // 3) Eski local store fallback
  return <PublicSite slug={slug} />;
}
