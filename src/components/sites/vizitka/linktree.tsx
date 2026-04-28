import { ColorTheme, VizitkaContent } from "@/lib/store/types";
import { Avatar, mapsHref, telHref } from "./shared";
import { buildSocialHref, SOCIAL_NETWORKS } from "../social-icons";
import { PatternLayer } from "../patterns";
import { MapEmbed } from "../map-embed";

type Props = { content: VizitkaContent; theme: ColorTheme };

export function VizitkaLinktree({ content, theme }: Props) {
  const socialLinks = content.social
    .filter((s) => s.value.trim())
    .map((item) => ({
      label: SOCIAL_NETWORKS[item.network].name,
      href: buildSocialHref(item),
    }));

  const links = [
    content.phone && {
      label: content.phone,
      href: telHref(content.phone),
      primary: true,
    },
    ...socialLinks,
    content.address && {
      label: "Yo'l ko'rsatish",
      href: mapsHref(content),
    },
  ].filter(Boolean) as Array<{ label: string; href: string; primary?: boolean }>;

  return (
    <div className="relative flex h-full w-full flex-col items-center bg-white px-6 pt-14 pb-8">
      <PatternLayer pattern={content.pattern} color={theme.primary} />
      <Avatar content={content} theme={theme} size={76} />
      <h1 className="mt-5 text-xl font-semibold tracking-tight text-black">
        {content.businessName}
      </h1>
      {content.category ? (
        <p className="mt-1 text-xs text-neutral-500">{content.category}</p>
      ) : null}
      {content.tagline ? (
        <p className="mt-3 max-w-[90%] text-center text-xs text-neutral-600">
          {content.tagline}
        </p>
      ) : null}

      {content.description ? (
        <p className="mt-3 max-w-[95%] text-center text-[13px] leading-relaxed text-neutral-700">
          {content.description}
        </p>
      ) : null}

      {content.address ? (
        <MapEmbed address={content.address} height={140} className="mt-6 w-full" rounded="rounded-2xl" />
      ) : null}

      <div className="mt-8 flex w-full flex-col gap-2.5">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className={
              "flex h-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors"
            }
            style={
              l.primary
                ? {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                    color: theme.primaryContrast,
                  }
                : { borderColor: theme.primary, color: theme.primary }
            }
          >
            {l.label}
          </a>
        ))}
      </div>

      <p className="mt-auto pt-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
        weblinker.uz
      </p>
    </div>
  );
}
