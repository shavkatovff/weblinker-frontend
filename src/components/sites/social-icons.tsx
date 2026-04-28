import { SocialItem, SocialLinks, SocialNetwork } from "@/lib/store/types";

type NetworkMeta = {
  name: string;
  prefix: string;
  placeholder: string;
  hrefPrefix: string;
  domains: string[];
};

export const SOCIAL_NETWORKS: Record<SocialNetwork, NetworkMeta> = {
  instagram: {
    name: "Instagram",
    prefix: "instagram.com/",
    placeholder: "username",
    hrefPrefix: "https://instagram.com/",
    domains: ["instagram.com"],
  },
  telegram: {
    name: "Telegram",
    prefix: "t.me/",
    placeholder: "username",
    hrefPrefix: "https://t.me/",
    domains: ["t.me", "telegram.me"],
  },
  tiktok: {
    name: "TikTok",
    prefix: "tiktok.com/@",
    placeholder: "username",
    hrefPrefix: "https://tiktok.com/@",
    domains: ["tiktok.com"],
  },
  youtube: {
    name: "YouTube",
    prefix: "youtube.com/@",
    placeholder: "kanal",
    hrefPrefix: "https://youtube.com/@",
    domains: ["youtube.com", "youtu.be"],
  },
  facebook: {
    name: "Facebook",
    prefix: "facebook.com/",
    placeholder: "sahifa",
    hrefPrefix: "https://facebook.com/",
    domains: ["facebook.com", "fb.com"],
  },
  linkedin: {
    name: "LinkedIn",
    prefix: "linkedin.com/in/",
    placeholder: "username",
    hrefPrefix: "https://linkedin.com/in/",
    domains: ["linkedin.com"],
  },
  x: {
    name: "X",
    prefix: "x.com/",
    placeholder: "username",
    hrefPrefix: "https://x.com/",
    domains: ["x.com", "twitter.com"],
  },
  threads: {
    name: "Threads",
    prefix: "threads.net/@",
    placeholder: "username",
    hrefPrefix: "https://threads.net/@",
    domains: ["threads.net"],
  },
  whatsapp: {
    name: "WhatsApp",
    prefix: "+",
    placeholder: "998901234567",
    hrefPrefix: "https://wa.me/",
    domains: ["wa.me", "whatsapp.com"],
  },
  website: {
    name: "Veb-sayt",
    prefix: "https://",
    placeholder: "mysite.uz",
    hrefPrefix: "https://",
    domains: [],
  },
};

export const SOCIAL_ORDER: SocialNetwork[] = [
  "instagram",
  "telegram",
  "tiktok",
  "youtube",
  "facebook",
  "linkedin",
  "x",
  "threads",
  "whatsapp",
  "website",
];

export function buildSocialHref(item: SocialItem): string {
  const value = item.value.trim();
  if (!value) return "#";
  if (/^https?:\/\//i.test(value)) return value;

  const meta = SOCIAL_NETWORKS[item.network];
  if (item.network === "whatsapp") {
    const digits = value.replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }
  if (item.network === "website") {
    return value.includes("://") ? value : `https://${value}`;
  }
  const handle = value.replace(/^@/, "").replace(/^\/+/, "");
  return meta.hrefPrefix + handle;
}

export function detectNetworkFromUrl(input: string): SocialNetwork | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  for (const id of SOCIAL_ORDER) {
    if (id === "website") continue;
    const { domains } = SOCIAL_NETWORKS[id];
    for (const d of domains) {
      if (trimmed.includes(d)) return id;
    }
  }
  if (/^https?:\/\//.test(trimmed) || /\.[a-z]{2,}/.test(trimmed)) return "website";
  return null;
}

export function SocialGlyph({ kind }: { kind: SocialNetwork }) {
  const stroke = (d: string) => (
    <path
      d={d}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
  const base = {
    width: 14,
    height: 14,
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": true as const,
  };
  switch (kind) {
    case "instagram":
      return (
        <svg {...base}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="11" cy="5" r="0.7" fill="currentColor" />
        </svg>
      );
    case "telegram":
      return <svg {...base}>{stroke("M2.5 8L13.5 3.5L11.5 13L7 10.3L5.2 12L5.7 9L11.8 4.5")}</svg>;
    case "tiktok":
      return (
        <svg {...base}>
          {stroke("M9.5 2.5V10.2C9.5 11.5 8.4 12.6 7 12.6C5.7 12.6 4.6 11.6 4.6 10.3C4.6 9 5.7 7.9 7 7.9")}
          {stroke("M9.5 2.5C9.5 4 10.7 5.2 12.3 5.2")}
        </svg>
      );
    case "youtube":
      return (
        <svg {...base}>
          <rect x="1.5" y="4" width="13" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 6.5L10 8L7 9.5V6.5Z" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return <svg {...base}>{stroke("M10 4h1.5V2H10c-1.5 0-2.5 1-2.5 2.5V6.5h-1.8v2h1.8v5h2v-5h2L12 6.5h-2V5c0-.5.5-1 1-1")}</svg>;
    case "linkedin":
      return (
        <svg {...base}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          {stroke("M5 6.5V11M5 4.7V4.8M8 11V7.5C8 6.5 9 6 10 6.5S11 8 11 8V11")}
        </svg>
      );
    case "x":
      return <svg {...base}>{stroke("M3 3L13 13M13 3L3 13")}</svg>;
    case "threads":
      return <svg {...base}>{stroke("M4 8C4 5 6 3 8 3S12 4.5 12 7C12 9 10 10.5 8 10C6 9.5 6 7.5 8 7C10 6.5 11 8 11 10C11 12 9 13 7.5 12.5")}</svg>;
    case "whatsapp":
      return <svg {...base}>{stroke("M3 13L4 10C3 8 3 6 4.5 4.5S8 3 10 4.5S11.5 8 10 9.5S6 10.5 4 10")}</svg>;
    case "website":
      return (
        <svg {...base}>
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
          {stroke("M2.5 8H13.5M8 2.5C10 5 10 11 8 13.5C6 11 6 5 8 2.5")}
        </svg>
      );
  }
}

export function SocialRow({
  social,
  variant = "light",
}: {
  social: SocialLinks;
  variant?: "light" | "dark";
}) {
  const entries = social.filter((s) => s.value.trim());
  if (!entries.length) return null;
  const dark = variant === "dark";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {entries.map((item) => (
        <a
          key={item.id}
          href={buildSocialHref(item)}
          target="_blank"
          rel="noopener noreferrer"
          className={
            "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors " +
            (dark
              ? "border-white/20 text-white hover:border-white hover:bg-white hover:text-black"
              : "border-[color:var(--border)] text-black hover:border-black")
          }
        >
          <SocialGlyph kind={item.network} />
          {SOCIAL_NETWORKS[item.network].name}
        </a>
      ))}
    </div>
  );
}
