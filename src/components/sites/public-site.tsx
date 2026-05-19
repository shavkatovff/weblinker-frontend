"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSiteBySlug } from "@/lib/store/hooks";
import { normalizeSite } from "@/lib/store/normalize";
import { ExpiredPageView } from "./expired-page-view";
import { ExpiredVizitkaPreview } from "./expired-preview";
import { SiteRenderer } from "./site-renderer";

export function PublicSite({ slug }: { slug: string }) {
  const router = useRouter();
  const { site, ready } = useSiteBySlug(slug);
  const normalized = useMemo(() => (site ? normalizeSite(site) : undefined), [site]);

  useEffect(() => {
    if (ready && (!site || !normalized)) {
      router.replace(`/404?slug=${encodeURIComponent(slug)}`);
    }
  }, [ready, site, normalized, slug, router]);

  if (!ready || !site || !normalized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-1.5 w-12 animate-pulse rounded-full bg-black" />
      </div>
    );
  }

  if (normalized.status === "paused") {
    return (
      <ExpiredPageView
        businessName={normalized.content.businessName}
        slug={slug}
        siteKind="vizitka"
        preview={<ExpiredVizitkaPreview site={normalized} />}
      />
    );
  }

  if (normalized.type === "vizitka") {
    return (
      <div className="h-screen w-full overflow-hidden bg-white md:flex md:h-auto md:min-h-screen md:items-center md:justify-center md:overflow-visible md:bg-neutral-100 md:py-10">
        <div className="h-full w-full md:h-[760px] md:w-[420px] md:overflow-hidden md:rounded-[40px] md:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.3)] md:ring-1 md:ring-black/5">
          <SiteRenderer site={normalized} />
        </div>
      </div>
    );
  }

  return <SiteRenderer site={normalized} />;
}
