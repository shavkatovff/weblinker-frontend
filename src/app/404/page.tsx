import type { Metadata } from "next";
import { NotFoundPublic } from "@/components/sites/public-site-helpers";

export const metadata: Metadata = {
  title: "404 — Bunday sayt topilmadi",
  description:
    "Ushbu manzilda hozircha sayt yo'q. Weblinker da o'z vizitka yoki landing yarating.",
};

export default async function NotFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  return <NotFoundPublic slug={slug} />;
}
