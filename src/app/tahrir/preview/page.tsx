import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TahrirLandingPreview } from "@/components/tahrir/tahrir-landing-preview";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

const display = Playfair_Display({
  weight: ["700", "800"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Ko‘rish — landing",
  description: "Tahrir qilingan landingni tahrirsiz ko‘rish.",
  robots: { index: false, follow: false },
};

export default function TahrirPreviewPage() {
  return (
    <TahrirLandingPreview
      titleFontClassName={display.className}
      bodyFontClassName={inter.className}
    />
  );
}
