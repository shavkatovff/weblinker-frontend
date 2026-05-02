import { ColorTheme, VizitkaContent } from "@/lib/store/types";
import { SocialGlyph, buildSocialHref } from "../social-icons";
import { telHref } from "./shared";
import { PatternLayer } from "../patterns";
import { MapEmbed } from "../map-embed";

type Props = { content: VizitkaContent; theme: ColorTheme };

export function VizitkaTicket({ content, theme }: Props) {
  const socials = content.social.filter((s) => s.value.trim());

  return (
    <div className="relative flex h-full w-full items-center bg-neutral-200 px-4 py-12">
      <PatternLayer pattern={content.pattern} color={theme.primary} />
      <div
        className="relative w-full bg-white p-6"
        style={{
          clipPath:
            "polygon(0% 2%, 5% 0%, 10% 2%, 15% 0%, 20% 2%, 25% 0%, 30% 2%, 35% 0%, 40% 2%, 45% 0%, 50% 2%, 55% 0%, 60% 2%, 65% 0%, 70% 2%, 75% 0%, 80% 2%, 85% 0%, 90% 2%, 95% 0%, 100% 2%, 100% 98%, 95% 100%, 90% 98%, 85% 100%, 80% 98%, 75% 100%, 70% 98%, 65% 100%, 60% 98%, 55% 100%, 50% 98%, 45% 100%, 40% 98%, 35% 100%, 30% 98%, 25% 100%, 20% 98%, 15% 100%, 10% 98%, 5% 100%, 0% 98%)",
        }}
      >
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          · ADMIT ONE ·
        </p>
        <div
          className="my-4 border-t-2 border-dashed"
          style={{ borderColor: theme.primary }}
        />

        <h1 className="text-center text-2xl font-semibold tracking-tight text-black">
          {content.businessName}
        </h1>
        {content.category ? (
          <p className="mt-1 text-center text-xs text-neutral-500">
            {content.category}
          </p>
        ) : null}

        {content.description ? (
          <p className="mt-3 text-center text-[12px] leading-relaxed text-neutral-700">
            {content.description}
          </p>
        ) : null}

        {content.phone ? (
          <div
            className="my-6 border-y-2 border-dashed py-4 text-center"
            style={{ borderColor: theme.primary }}
          >
            <a
              href={telHref(content.phone)}
              className="font-mono text-xl font-bold text-black"
            >
              {content.phone}
            </a>
          </div>
        ) : null}

        {content.address?.trim() || content.mapsUrl?.trim() ? (
          <p className="text-center text-xs text-neutral-600">
            {content.address || "Xarita havolasi"}
          </p>
        ) : null}
        {content.hoursLine ? (
          <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            {content.hoursLine}
          </p>
        ) : null}

        {content.address?.trim() || content.mapsUrl?.trim() ? (
          <MapEmbed
            address={content.address ?? ""}
            mapsUrl={content.mapsUrl}
            height={110}
            className="mt-4"
          />
        ) : null}

        {socials.length ? (
          <div className="mt-6 flex justify-center gap-2">
            {socials.map((item) => (
              <a
                key={item.id}
                href={buildSocialHref(item)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.network}
                className="flex h-8 w-8 items-center justify-center rounded-full border"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                <SocialGlyph kind={item.network} />
              </a>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            {content.accentInitials}-001
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            weblinker.uz
          </p>
        </div>
      </div>
    </div>
  );
}
