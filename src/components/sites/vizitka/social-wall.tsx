import { ColorTheme, VizitkaContent } from "@/lib/store/types";
import { Avatar, mapsHref, telHref } from "./shared";
import { buildSocialHref, SOCIAL_NETWORKS, SocialGlyph } from "../social-icons";
import { PatternLayer } from "../patterns";
import { MapEmbed } from "../map-embed";

type Props = { content: VizitkaContent; theme: ColorTheme };

type Tile = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
};

export function VizitkaSocialWall({ content, theme }: Props) {
  const tiles: Tile[] = [];

  if (content.phone) {
    tiles.push({
      label: "Telefon",
      value: content.phone,
      href: telHref(content.phone),
      icon: <PhoneIcon />,
    });
  }
  if (content.address) {
    tiles.push({
      label: "Manzil",
      value: content.address.split(",")[0] || content.address,
      href: mapsHref(content),
      icon: <PinIcon />,
    });
  } else if (content.mapsUrl?.trim()) {
    tiles.push({
      label: "Manzil",
      value: "Xarita",
      href: mapsHref(content),
      icon: <PinIcon />,
    });
  }

  const socialTiles = content.social
    .filter((s) => s.value.trim())
    .slice(0, 4 - tiles.length)
    .map<Tile>((item) => ({
      label: SOCIAL_NETWORKS[item.network].name,
      value: item.value.startsWith("http") ? SOCIAL_NETWORKS[item.network].name : `@${item.value.replace(/^@/, "")}`,
      href: buildSocialHref(item),
      icon: <SocialGlyphLarge kind={item.network} />,
    }));

  tiles.push(...socialTiles);

  return (
    <div className="relative flex h-full w-full flex-col bg-white px-5 pt-14 pb-6">
      <PatternLayer pattern={content.pattern} color={theme.primary} />
      <div className="flex items-center gap-3">
        <Avatar content={content} theme={theme} size={56} />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-black">
            {content.businessName}
          </h1>
          {content.category ? (
            <p className="truncate text-xs text-neutral-500">{content.category}</p>
          ) : null}
        </div>
      </div>

      {content.description ? (
        <p className="relative mt-3 text-[12px] leading-relaxed text-neutral-700">
          {content.description}
        </p>
      ) : null}

      {content.address?.trim() || content.mapsUrl?.trim() ? (
        <MapEmbed
          address={content.address ?? ""}
          mapsUrl={content.mapsUrl}
          height={120}
          className="relative mt-4"
          rounded="rounded-2xl"
        />
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {tiles.map((tile, i) => (
          <a
            key={i}
            href={tile.href}
            target={tile.href.startsWith("http") ? "_blank" : undefined}
            rel={tile.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex aspect-square flex-col justify-between rounded-2xl border-2 p-4 transition-colors"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            <span>{tile.icon}</span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] opacity-60">
                {tile.label}
              </p>
              <p className="mt-0.5 break-words text-[13px] font-semibold leading-tight">
                {tile.value}
              </p>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-auto pt-6 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-400">
        weblinker.uz
      </p>
    </div>
  );
}

function SocialGlyphLarge({ kind }: { kind: Parameters<typeof SocialGlyph>[0]["kind"] }) {
  return (
    <span className="inline-flex h-[18px] w-[18px] items-center justify-center">
      <span className="scale-[1.28] origin-center">
        <SocialGlyph kind={kind} />
      </span>
    </span>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 4C3 9 7 13 12 13L13.5 11.5V9.5L10.5 9L9.5 10C8 9 7.5 8.5 6.5 7L7.5 6L7 3L5 3L3 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 14C8 14 13 10 13 6.5C13 4 10.8 2 8 2C5.2 2 3 4 3 6.5C3 10 8 14 8 14Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="6.5" r="1.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
