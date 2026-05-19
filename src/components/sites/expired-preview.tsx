"use client";

import type { ReactNode } from "react";
import type { UnknownSite } from "@/lib/store/types";
import { SiteRenderer } from "./site-renderer";

/** Blur fon — mobil vizitka (telefon ramkasi) */
export function ExpiredVizitkaPreview({ site }: { site: UnknownSite }) {
  return (
    <div className="flex min-h-[100dvh] w-full items-start justify-center bg-gradient-to-b from-neutral-200 to-neutral-300 pt-6 sm:pt-10">
      <div
        className="w-[min(100%,420px)] shrink-0 overflow-hidden rounded-[36px] bg-white shadow-[0_48px_120px_-40px_rgba(0,0,0,0.45)] ring-1 ring-black/8"
        style={{ minHeight: "min(780px, 92dvh)" }}
      >
        <SiteRenderer site={site} />
      </div>
    </div>
  );
}

/** Blur fon — landing (keng sahifa) */
export function ExpiredLandingPreviewFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-[120vh] w-full min-w-[720px] bg-white">{children}</div>;
}
