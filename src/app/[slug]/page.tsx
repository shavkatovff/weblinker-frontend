import { redirect } from "next/navigation";
import { PublicSite } from "@/components/sites/public-site";
import { PublicSiteFromApi } from "@/components/sites/public-site-from-api";
import { PublicLanding } from "@/components/sites/public-landing";
import { fetchPublicLandingFromApi } from "@/lib/landings/client";
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
    redirect(`/expired?slug=${encodeURIComponent(slug)}`);
  }
  if (res && "site" in res && res.site) {
    return <PublicSiteFromApi site={res.site} />;
  }

  // 2) Landing topilsa — uni ko‘rsatamiz (yangi `Landing` modeli)
  const landingRes = await fetchPublicLandingFromApi(slug).catch(() => null);
  if (landingRes && "publicPause" in landingRes) {
    redirect(`/expired?slug=${encodeURIComponent(slug)}`);
  }
  if (landingRes && "landing" in landingRes) {
    return <PublicLanding landing={landingRes.landing} />;
  }

  // 3) Eski local store fallback
  return <PublicSite slug={slug} />;
}
