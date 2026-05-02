import { ColorTheme, VizitkaContent } from "@/lib/store/types";
import { Avatar, SocialRow, telHref, WeblinkerBrandLink } from "./shared";
import { PatternLayer } from "../patterns";

type Props = { content: VizitkaContent; theme: ColorTheme };

export function VizitkaMinimal({ content, theme }: Props) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-white px-6 pt-12 pb-8 text-center">
      <PatternLayer pattern={content.pattern} color={theme.primary} />
      <Avatar content={content} theme={theme} size={92} />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-black">
        {content.businessName}
      </h1>
      {content.category ? (
        <p className="mt-1.5 text-xs uppercase tracking-[0.22em] text-neutral-500">
          {content.category}
        </p>
      ) : null}

      {content.description ? (
        <p className="mt-5 max-w-[85%] text-sm leading-relaxed text-neutral-700">
          {content.description}
        </p>
      ) : null}

      {content.phone ? (
        <a
          href={telHref(content.phone)}
          className="mt-12 font-mono text-[26px] font-semibold tracking-tight text-black"
        >
          {content.phone}
        </a>
      ) : null}

      <div className="mt-12">
        <SocialRow social={content.social} />
      </div>

      <WeblinkerBrandLink className="mt-auto pt-10" />
    </div>
  );
}
