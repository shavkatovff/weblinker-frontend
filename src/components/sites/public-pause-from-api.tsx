"use client";

import { PausedSite, PausedSiteSubscriptionExpired } from "./public-site-helpers";
import type { PublicPausePayload } from "@/lib/vizitka-public";
export function PublicPauseFromApi({ pause }: { pause: PublicPausePayload }) {
  if (pause.kind === "paused") {
    return <PausedSite businessName={pause.businessName} />;
  }
  return (
    <PausedSiteSubscriptionExpired
      businessName={pause.businessName}
      slug={pause.slug}
    />
  );
}
