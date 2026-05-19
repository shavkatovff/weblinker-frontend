import { PublicLanding } from "@/components/sites/public-landing";
import { fetchPublicLandingFromApi } from "@/lib/landings/client";
import { fetchPublicVizitkaFromApi } from "@/lib/vizitka-public";
import {
  ExpiredLandingPreviewFrame,
  ExpiredVizitkaPreview,
} from "./expired-preview";
import { ExpiredPageView } from "./expired-page-view";

/** `/expired?slug=…` — muddati tugagan vizitka yoki landing */
export async function ExpiredPublicContent({ slug }: { slug: string }) {
  const normalized = slug.trim().toLowerCase();

  const vizRes = await fetchPublicVizitkaFromApi(normalized);
  if (vizRes && "publicPause" in vizRes) {
    return (
      <ExpiredPageView
        businessName={vizRes.publicPause.businessName}
        slug={normalized}
        siteKind="vizitka"
        preview={
          vizRes.site ? <ExpiredVizitkaPreview site={vizRes.site} /> : undefined
        }
      />
    );
  }

  const landingRes = await fetchPublicLandingFromApi(normalized).catch(
    () => null,
  );
  if (landingRes && "publicPause" in landingRes) {
    const businessName =
      landingRes.publicPause.businessName ||
      landingRes.landing.brandName?.trim() ||
      normalized.replace(/-/g, " ");
    return (
      <ExpiredPageView
        businessName={businessName}
        slug={normalized}
        siteKind="landing"
        preview={
          <ExpiredLandingPreviewFrame>
            <PublicLanding landing={landingRes.landing} />
          </ExpiredLandingPreviewFrame>
        }
      />
    );
  }

  return (
    <ExpiredPageView
      businessName={normalized.replace(/-/g, " ")}
      slug={normalized}
      siteKind="generic"
    />
  );
}
