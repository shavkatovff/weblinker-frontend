import { ColorTheme, VizitkaContent } from "@/lib/store/types";
import { SocialGlyph, buildSocialHref } from "../social-icons";
import { telHref } from "./shared";
import { PatternLayer } from "../patterns";

type Props = { content: VizitkaContent; theme: ColorTheme };

export function VizitkaPolaroid({ content, theme }: Props) {
  const socials = content.social.filter((s) => s.value.trim());

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-neutral-200 px-6 py-12">
      <PatternLayer pattern={content.pattern} color={theme.primary} />
      <div
        aria-hidden
        className="h-3 w-20 -mb-1.5 rotate-[-3deg] self-center bg-neutral-400/60"
      />
      <div className="w-full rotate-[-1.5deg] border border-neutral-300 bg-white p-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)]">
        <div
          className="flex h-64 items-center justify-center overflow-hidden"
          style={{ backgroundColor: theme.primary }}
        >
          {content.logoImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={content.logoImage.dataUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="text-7xl font-bold tracking-tighter"
              style={{ color: theme.primaryContrast }}
            >
              {content.accentInitials || "WL"}
            </span>
          )}
        </div>
        <p className="mt-4 text-center font-serif text-lg italic text-black">
          {content.businessName}
        </p>
        {content.category ? (
          <p className="mt-0.5 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            {content.category}
          </p>
        ) : null}
      </div>

      <div className="relative mt-8 w-full space-y-2 text-center">
        {content.description ? (
          <p className="mx-auto max-w-[90%] text-[12px] leading-relaxed text-neutral-600">
            {content.description}
          </p>
        ) : null}
        {content.phone ? (
          <a
            href={telHref(content.phone)}
            className="block font-mono text-base font-semibold text-black"
          >
            {content.phone}
          </a>
        ) : null}
        {socials.length ? (
          <div className="flex justify-center gap-2 pt-2">
            {socials.map((item) => (
              <a
                key={item.id}
                href={buildSocialHref(item)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.network}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black text-black"
              >
                <SocialGlyph kind={item.network} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
