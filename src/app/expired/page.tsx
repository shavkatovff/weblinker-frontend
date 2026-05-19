import type { Metadata } from "next";
import { ExpiredPublicContent } from "@/components/sites/expired-public-content";
import { ExpiredPageView } from "@/components/sites/expired-page-view";

export const metadata: Metadata = {
  title: "Vaqtincha to'xtatilgan — Weblinker",
  description:
    "Bu nomdagi sayt vaqtincha to'xtatilgan.",
};

export const dynamic = "force-dynamic";

export default async function ExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const trimmed = slug?.trim();

  if (!trimmed) {
    return (
      <ExpiredPageView
        businessName="Biznes sahifangiz"
        siteKind="generic"
        showSlugHint={false}
      />
    );
  }

  return <ExpiredPublicContent slug={trimmed} />;
}
