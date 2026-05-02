import { cn } from "@/lib/cn";

type Props = {
  /** Matn manzili — qidiruv uchun */
  address: string;
  /** To'g'ridan-to'g'ri xarita havolasi (Google / Yandex) — embed va ochish uchun */
  mapsUrl?: string;
  className?: string;
  height?: number;
  rounded?: string;
  label?: string;
};

const COORD_IN_PATH = /@(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/;

/**
 * Brauzerda iframe uchun Google Maps embed src.
 * `mapsUrl` bo'lsa — koordinata / embed / to'liq havoladan foydalanadi, bo'lmasa `address` bo'yicha qidiruv.
 */
export function buildMapsEmbedSrc(
  mapsUrl: string | undefined,
  address: string,
): string | null {
  const addr = address.trim();
  const raw = mapsUrl?.trim() ?? "";

  if (raw) {
    const coordM = raw.match(COORD_IN_PATH);
    if (coordM) {
      return `https://maps.google.com/maps?q=${coordM[1]},${coordM[2]}&hl=uz&z=16&output=embed`;
    }

    try {
      const normalized = raw.startsWith("http") ? raw : `https://${raw}`;
      const u = new URL(normalized);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        throw new Error("bad protocol");
      }
      const host = u.hostname.replace(/^www\./, "");
      const path = u.pathname;
      if (
        (host === "maps.google.com" || (host.endsWith("google.com") && path.includes("/maps"))) &&
        (path.includes("/embed") || u.searchParams.get("output") === "embed")
      ) {
        return u.toString();
      }
      const q = u.searchParams.get("q");
      if (q && /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d+$/.test(q.trim())) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q.trim())}&hl=uz&z=16&output=embed`;
      }
      if (host.includes("yandex.")) {
        const ll = u.searchParams.get("ll");
        if (ll) {
          const parts = ll.split(",").map((x) => parseFloat(x.trim()));
          if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
            const [lon, lat] = parts as [number, number];
            if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
              return `https://maps.google.com/maps?q=${lat},${lon}&hl=uz&z=16&output=embed`;
            }
          }
        }
      }
    } catch {
      /* fall through */
    }

    if (/^https?:\/\//i.test(raw)) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&hl=uz&z=15&output=embed`;
    }
  }

  if (!addr) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&hl=uz&z=15&output=embed`;
}

/** Xarita ustini bosganda ochiladigan havola */
export function externalMapLink(
  mapsUrl: string | undefined,
  address: string,
): string | undefined {
  const m = mapsUrl?.trim();
  if (m) {
    if (/^https?:\/\//i.test(m)) return m;
    return `https://www.google.com/maps/search/${encodeURIComponent(m)}`;
  }
  const a = address.trim();
  if (a) {
    return `https://www.google.com/maps/search/${encodeURIComponent(a)}`;
  }
  return undefined;
}

export function MapEmbed({
  address,
  mapsUrl,
  className,
  height = 160,
  rounded = "rounded-xl",
  label,
}: Props) {
  const src = buildMapsEmbedSrc(mapsUrl, address);
  const href = externalMapLink(mapsUrl, address);
  if (!src) return null;

  const title =
    label ??
    (address.trim()
      ? `${address.trim()} — xarita`
      : mapsUrl?.trim()
        ? "Xarita"
        : "Xarita");

  return (
    <div
      className={cn(
        "group relative overflow-hidden border border-[color:var(--border)]",
        rounded,
        className,
      )}
      style={{ height }}
    >
      <iframe
        src={src}
        title={title}
        width="100%"
        height={height}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="pointer-events-none block h-full w-full border-0 grayscale-[30%]"
      />
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-black/25"
          aria-label="Xaritani to'liq ochish"
          title="Xaritani brauzerda ochish"
        />
      ) : null}
    </div>
  );
}
