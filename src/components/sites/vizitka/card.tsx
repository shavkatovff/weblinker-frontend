import { ColorTheme, VizitkaContent } from "@/lib/store/types";
import {
  Avatar,
  ClockIcon,
  PhoneIcon,
  PinIcon,
  mapsHref,
  telHref,
} from "./shared";
import { SocialGlyph, buildSocialHref } from "../social-icons";
import { PatternLayer } from "../patterns";
import { MapEmbed } from "../map-embed";

type Props = { content: VizitkaContent; theme: ColorTheme };

export function VizitkaCard({ content, theme }: Props) {
  const socials = content.social.filter((s) => s.value.trim());

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-neutral-100 px-5 py-12">
      <PatternLayer pattern={content.pattern} color={theme.primary} />
      <div
        className="relative w-full rounded-2xl border-2 bg-white p-6"
        style={{ borderColor: theme.primary }}
      >
        <Avatar content={content} theme={theme} size={60} />
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-black">
          {content.businessName}
        </h1>
        {content.category ? (
          <p className="mt-1 text-xs text-neutral-500">{content.category}</p>
        ) : null}
        {content.tagline ? (
          <p className="mt-2 text-[13px] text-neutral-700">{content.tagline}</p>
        ) : null}
        {content.description ? (
          <p className="mt-2 text-[12px] leading-relaxed text-neutral-600">
            {content.description}
          </p>
        ) : null}

        <div
          className="my-5 h-px w-full"
          style={{ backgroundColor: theme.primary }}
        />

        <ul className="space-y-2">
          {content.phone ? (
            <li>
              <a
                href={telHref(content.phone)}
                className="flex items-center gap-3 text-sm text-black"
              >
                <span style={{ color: theme.primary }}>
                  <PhoneIcon />
                </span>
                <span className="font-mono">{content.phone}</span>
              </a>
            </li>
          ) : null}
          {content.address || content.mapsUrl?.trim() ? (
            <li>
              <a
                href={mapsHref(content)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-black"
              >
                <span style={{ color: theme.primary }}>
                  <PinIcon />
                </span>
                <span>{content.address || "Xarita / lokatsiya"}</span>
              </a>
            </li>
          ) : null}
          {content.hoursLine ? (
            <li>
              <div className="flex items-center gap-3 text-sm text-black">
                <span style={{ color: theme.primary }}>
                  <ClockIcon />
                </span>
                <span>{content.hoursLine}</span>
              </div>
            </li>
          ) : null}
        </ul>

        {content.address?.trim() || content.mapsUrl?.trim() ? (
          <MapEmbed
            address={content.address ?? ""}
            mapsUrl={content.mapsUrl}
            height={130}
            className="mt-4"
          />
        ) : null}

        {socials.length ? (
          <div
            className="mt-5 flex gap-2 border-t pt-4"
            style={{ borderColor: theme.primary }}
          >
            {socials.map((item) => (
              <a
                key={item.id}
                href={buildSocialHref(item)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.network}
                className="flex h-8 w-8 items-center justify-center rounded-full border text-black transition-colors hover:text-white"
                style={{ borderColor: theme.primary }}
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
