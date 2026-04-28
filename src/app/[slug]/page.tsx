import { PublicSite } from "@/components/sites/public-site";
import { PublicSiteFromApi } from "@/components/sites/public-site-from-api";
import { fetchPublicVizitkaFromApi } from "@/lib/vizitka-public";

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fromApi = await fetchPublicVizitkaFromApi(slug);
  if (fromApi?.site) {
    return <PublicSiteFromApi site={fromApi.site} />;
  }
  return <PublicSite slug={slug} />;
}
