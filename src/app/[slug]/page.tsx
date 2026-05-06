import { PublicSite } from "@/components/sites/public-site";
import { PublicPauseFromApi } from "@/components/sites/public-pause-from-api";
import { PublicSiteFromApi } from "@/components/sites/public-site-from-api";
import { fetchPublicLandingFromApi } from "@/lib/landing-public";
import { fetchPublicVizitkaFromApi } from "@/lib/vizitka-public";

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetchPublicVizitkaFromApi(slug);
  if (res && "publicPause" in res) {
    return <PublicPauseFromApi pause={res.publicPause} />;
  }
  if (res && "site" in res && res.site) {
    return <PublicSiteFromApi site={res.site} />;
  }
  const land = await fetchPublicLandingFromApi(slug);
  if (land?.site) {
    return <PublicSiteFromApi site={land.site} />;
  }
  return <PublicSite slug={slug} />;
}
