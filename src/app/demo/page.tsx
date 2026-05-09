import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { DemoChoyxonaSite } from "@/components/demo/demo-choyxona-site";
import { defaultDemoChoyxonaContent } from "@/lib/demo-choyxona/defaults";

const inter = Inter({ subsets: ["latin", "cyrillic"] });
const display = Playfair_Display({
  weight: ["700", "800"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Demo — choyxona",
  description: "Milliy ta’m va shinam muhit — demo landing.",
};

export default function DemoPage() {
  return (
    <div className={`${inter.className} min-h-[100dvh] bg-[#fff8ed] text-[#20140c] antialiased`}>
      <DemoChoyxonaSite content={defaultDemoChoyxonaContent()} titleFontClassName={display.className} />
    </div>
  );
}
