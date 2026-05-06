import { UnknownSite } from "@/lib/store/types";
import { VizitkaTemplate } from "./vizitka-template";
import { LandingTemplate } from "./landing-template";

export function SiteRenderer({ site }: { site: UnknownSite }) {
  if (site.type === "vizitka") {
    return <VizitkaTemplate content={site.content} templateId={site.templateId} />;
  }
  return (
    <LandingTemplate
      content={site.content}
      templateId={site.templateId}
      slug={site.slug}
    />
  );
}
