import {
  ColorTheme,
  SiteImage,
  SocialLinks,
  VizitkaContent,
} from "@/lib/store/types";
import { cn } from "@/lib/cn";
import { buildSocialHref, SocialGlyph } from "../social-icons";

/** Ochiq vizitka saytlarida pastdagi brand — bosh sahifaga */
export const WEBLINKER_HOMEPAGE = "https://weblinker.uz";

export function WeblinkerBrandLink({ className }: { className?: string }) {
  return (
    <a
      href={WEBLINKER_HOMEPAGE}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="Weblinker — bosh sahifa"
    >
      weblinker.uz
    </a>
  );
}

export function Avatar({
  content,
  theme,
  size = 72,
  className,
}: {
  content: VizitkaContent;
  theme: ColorTheme;
  size?: number;
  className?: string;
}) {
  if (content.logoImage) {
    return (
      <ImageBlock
        image={content.logoImage}
        className={className}
        width={size}
        height={size}
        rounded="rounded-2xl"
      />
    );
  }
  return (
    <div
      aria-hidden
      className={
        "flex items-center justify-center rounded-2xl font-semibold tracking-tight " +
        (className ?? "")
      }
      style={{
        width: size,
        height: size,
        fontSize: size * 0.3,
        backgroundColor: theme.primary,
        color: theme.primaryContrast,
      }}
    >
      {content.accentInitials || "WL"}
    </div>
  );
}

export function ImageBlock({
  image,
  className,
  width,
  height,
  rounded = "rounded-none",
}: {
  image: SiteImage;
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: string;
}) {
  return (
    <div
      className={`overflow-hidden bg-neutral-100 ${rounded} ${className ?? ""}`}
      style={{ width, height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.dataUrl}
        alt={image.name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function SocialRow({
  social,
  variant = "light",
  size = "sm",
}: {
  social: SocialLinks;
  variant?: "light" | "dark";
  size?: "sm" | "md";
}) {
  const entries = social.filter((item) => item.value.trim());
  if (!entries.length) return null;

  const dark = variant === "dark";
  const dim = size === "md" ? 40 : 34;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {entries.map((item) => (
        <a
          key={item.id}
          href={buildSocialHref(item)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.network}
          style={{ width: dim, height: dim }}
          className={
            "flex items-center justify-center rounded-full border transition-colors " +
            (dark
              ? "border-white/25 text-white hover:border-white hover:bg-white hover:text-black"
              : "border-[color:var(--border)] text-black hover:border-black hover:bg-black hover:text-white")
          }
        >
          <SocialGlyph kind={item.network} />
        </a>
      ))}
    </div>
  );
}

export function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 4C3 9 7 13 12 13L13.5 11.5V9.5L10.5 9L9.5 10C8 9 7.5 8.5 6.5 7L7.5 6L7 3L5 3L3 4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 14C8 14 13 10 13 6.5C13 4 10.8 2 8 2C5.2 2 3 4 3 6.5C3 10 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.5" r="1.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function mapsHref(content: VizitkaContent): string {
  const m = content.mapsUrl?.trim();
  if (m) {
    if (/^https?:\/\//i.test(m)) return m;
    return `https://www.google.com/maps/search/${encodeURIComponent(m)}`;
  }
  return content.address
    ? `https://www.google.com/maps/search/${encodeURIComponent(content.address)}`
    : "#";
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function themeGradient(theme: ColorTheme): string {
  return `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`;
}
