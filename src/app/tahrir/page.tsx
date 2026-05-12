import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { TahrirPlayground } from "@/components/tahrir/tahrir-playground";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

const display = Playfair_Display({
  weight: ["700", "800"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Tahrir — demo sahifa",
  description:
    "Landingni tahrirlang; o‘ngda jonli ko‘rinish. «Ko‘rish» — to‘liq ekranda alohida sahifa.",
};

export default function TahrirPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] items-center justify-center bg-neutral-100 text-sm text-neutral-600">
          Yuklanmoqda…
        </div>
      }
    >
      <TahrirPlayground
        titleFontClassName={display.className}
        bodyFontClassName={inter.className}
      />
    </Suspense>
  );
}
