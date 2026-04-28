import { ColorTheme, VizitkaContent } from "@/lib/store/types";
import { Avatar, SocialRow, telHref } from "./shared";
import { PatternLayer } from "../patterns";

type Props = { content: VizitkaContent; theme: ColorTheme };

export function VizitkaDark({ content, theme }: Props) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center px-6 pt-12 pb-8 text-center text-white"
      style={{ backgroundColor: theme.primaryDark }}
    >
      <PatternLayer pattern={content.pattern} color={theme.primaryContrast} />
      <Avatar content={content} theme={theme} size={96} className="ring-2 ring-white/20" />
      {content.category ? (
        <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-white/60">
          {content.category}
        </p>
      ) : null}
      <h1 className="mt-2 text-balance text-3xl font-semibold leading-tight tracking-tight">
        {content.businessName}
      </h1>
      {content.tagline ? (
        <p className="mt-2 text-sm text-white/70">{content.tagline}</p>
      ) : null}
      {content.description ? (
        <p className="mt-3 max-w-[90%] text-[13px] leading-relaxed text-white/60">
          {content.description}
        </p>
      ) : null}

      {content.phone ? (
        <a
          href={telHref(content.phone)}
          className="mt-10 flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-black"
        >
          {content.phone}
        </a>
      ) : null}

      <div className="mt-6">
        <SocialRow social={content.social} variant="dark" size="md" />
      </div>

      <p className="mt-auto pt-10 text-[10px] uppercase tracking-[0.25em] text-white/50">
        weblinker.uz
      </p>
    </div>
  );
}
