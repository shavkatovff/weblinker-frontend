import type { Metadata } from "next";
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
  description: "/demo choyxona sahifasini tahrirlash va jonli ko‘rinish.",
};

export default function TahrirPage() {
  return (
    <TahrirPlayground
      titleFontClassName={display.className}
      bodyFontClassName={inter.className}
    />
  );
}
