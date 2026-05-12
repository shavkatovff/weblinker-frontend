"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DemoChoyxonaSite } from "@/components/demo/demo-choyxona-site";
import { TAHRIR_PREVIEW_LANDING_SESSION_KEY } from "@/lib/landings/preview-storage";
import { DEFAULT_LANDING_THEME, type LandingThemeId } from "@/lib/landings/themes";
import { landingToDemoContent } from "@/lib/landings/to-content";
import type { LandingRecord } from "@/lib/landings/types";

type Props = {
  titleFontClassName: string;
  bodyFontClassName: string;
};

function readLandingFromSession(): LandingRecord | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(TAHRIR_PREVIEW_LANDING_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LandingRecord;
  } catch {
    return null;
  }
}

export function TahrirLandingPreview({ titleFontClassName, bodyFontClassName }: Props) {
  const [landing] = useState<LandingRecord | null | undefined>(() =>
    readLandingFromSession(),
  );

  const content = useMemo(() => {
    if (!landing) return null;
    return landingToDemoContent(landing);
  }, [landing]);

  if (landing === undefined) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-neutral-100 px-4 text-sm text-neutral-600">
        Yuklanmoqda…
      </div>
    );
  }

  if (landing === null || !content) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-neutral-100 px-4 text-center">
        <p className="text-sm text-neutral-600">Ko‘rish ma’lumoti topilmadi.</p>
        <Link
          href="/tahrir"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
        >
          Tahrirga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex min-h-[100dvh] flex-col ${bodyFontClassName} text-[#20140c] antialiased`}>
      <DemoChoyxonaSite
        content={content}
        titleFontClassName={titleFontClassName}
        hideNavCtaOnMobile
        themeId={(landing.blocktheme as LandingThemeId) ?? DEFAULT_LANDING_THEME}
      />
    </div>
  );
}
