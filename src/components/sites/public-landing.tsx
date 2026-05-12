import { Inter, Playfair_Display } from "next/font/google";
import { DemoChoyxonaSite } from "@/components/demo/demo-choyxona-site";
import { DEFAULT_LANDING_THEME, type LandingThemeId } from "@/lib/landings/themes";
import { landingToDemoContent } from "@/lib/landings/to-content";
import type { LandingRecord } from "@/lib/landings/types";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

const display = Playfair_Display({
  weight: ["700", "800"],
  subsets: ["latin", "cyrillic"],
});

/**
 * `weblinker.uz/{name}` orqali ochilganda — DB dagi `Landing` ma’lumotlarini
 * `DemoChoyxonaSite` orqali to‘liq sahifa sifatida ko‘rsatadi.
 */
export function PublicLanding({ landing }: { landing: LandingRecord }) {
  const content = landingToDemoContent(landing);
  const themeId = (landing.blocktheme as LandingThemeId) ?? DEFAULT_LANDING_THEME;

  return (
    <div
      className={`flex min-h-[100dvh] flex-col ${inter.className} text-[#20140c] antialiased`}
    >
      <DemoChoyxonaSite
        content={content}
        titleFontClassName={display.className}
        themeId={themeId}
        hideNavCtaOnMobile
      />
    </div>
  );
}
