import { TemplateId, VizitkaContent, getColorTheme } from "@/lib/store/types";
import { VizitkaMinimal } from "./vizitka/minimal";
import { VizitkaLinktree } from "./vizitka/linktree";
import { VizitkaSocialWall } from "./vizitka/social-wall";
import { VizitkaDark } from "./vizitka/dark";
import { VizitkaCard } from "./vizitka/card";
import { VizitkaPolaroid } from "./vizitka/polaroid";
import { VizitkaTicket } from "./vizitka/ticket";

type Props = {
  content: VizitkaContent;
  templateId?: TemplateId;
};

export function VizitkaTemplate({ content, templateId = "minimal" }: Props) {
  const theme = getColorTheme(content.colorTheme);
  switch (templateId) {
    case "linktree":
      return <VizitkaLinktree content={content} theme={theme} />;
    case "social-wall":
      return <VizitkaSocialWall content={content} theme={theme} />;
    case "dark":
      return <VizitkaDark content={content} theme={theme} />;
    case "card":
      return <VizitkaCard content={content} theme={theme} />;
    case "polaroid":
      return <VizitkaPolaroid content={content} theme={theme} />;
    case "ticket":
      return <VizitkaTicket content={content} theme={theme} />;
    case "minimal":
    default:
      return <VizitkaMinimal content={content} theme={theme} />;
  }
}
