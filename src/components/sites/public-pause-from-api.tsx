"use client";

import type { UnknownSite } from "@/lib/store/types";
import type { PublicPausePayload } from "@/lib/vizitka-public";
import {
  PausedSiteExpiredView,
  PausedSitePreview,
  PausedSiteView,
} from "./paused-site-view";

export function PublicPauseFromApi({
  pause,
  site,
}: {
  pause: PublicPausePayload;
  site?: UnknownSite;
}) {
  const preview = site ? <PausedSitePreview site={site} /> : undefined;

  if (pause.kind === "paused") {
    return <PausedSiteView businessName={pause.businessName} preview={preview} />;
  }

  return (
    <PausedSiteExpiredView
      businessName={pause.businessName}
      slug={pause.slug}
      preview={preview}
    />
  );
}
