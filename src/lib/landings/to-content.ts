import type { DemoChoyxonaContent } from "@/lib/demo-choyxona/types";
import type { LandingRecord } from "./types";

/** `+998901234567` → `+998 90 123 45 67` (display uchun) */
function formatPhoneDisplay(tel: string): string {
  const digits = (tel || "").replace(/\D/g, "");
  if (digits.length < 9) return tel || "";
  const last9 = digits.slice(-9);
  const code = last9.slice(0, 2);
  const a = last9.slice(2, 5);
  const b = last9.slice(5, 7);
  const c = last9.slice(7, 9);
  return `+998 ${code} ${a} ${b} ${c}`;
}

/** `@username` shaklida ko‘rsatish (avtomatik prefiks) */
function formatTelegramDisplay(raw: string): string {
  const v = (raw || "").trim();
  if (!v) return "";
  if (v.startsWith("@") || v.startsWith("http")) return v;
  return `@${v.replace(/^@+/, "")}`;
}

/** Toshkent (default footer city) — telefondan oxirgi shahar nomini ajratib bo‘lmaydi */
const FOOTER_CITY_DEFAULT = "Toshkent";

/** `Landing` qatorini hozirgi ko'rinish komponentiga (DemoChoyxonaSite) moslash */
export function landingToDemoContent(l: LandingRecord): DemoChoyxonaContent {
  const phoneDisplay = formatPhoneDisplay(l.phoneTel);
  const telegramDisplay = formatTelegramDisplay(l.telegram);

  return {
    blocks: {
      header: l.blockHeader,
      hero: l.blockHero,
      about: l.blockAbout,
      faq: l.blockFaq,
      contact: l.blockContact,
      footer: l.blockFooter,
    },
    brandName: l.brandName,
    navAbout: l.navAbout,
    navFaq: l.navFaq,
    navContact: l.navContact,
    navCta: l.navCta,

    heroTitle: l.heroTitle,
    heroLead: "",
    heroCta: l.heroCta,
    heroImageUrl: l.heroImageUrl,
    heroCardTitle: "",
    heroCardText: "",

    aboutImageUrl: l.aboutImageUrl,
    aboutBadge: "Biz haqimizda",
    aboutTitle: l.aboutTitle,
    aboutLead: l.aboutLead,
    aboutBullets: [
      l.aboutBullet1,
      l.aboutBullet2,
      l.aboutBullet3,
      l.aboutBullet4,
    ],

    faqBadge: "Savol-javob",
    faqTitle: "Ko'p so'raladigan savollar",
    faqItems: [
      { q: l.faq1Q, a: l.faq1A },
      { q: l.faq2Q, a: l.faq2A },
      { q: l.faq3Q, a: l.faq3A },
      { q: l.faq4Q, a: l.faq4A },
    ],

    contactBadge: "Aloqa",
    contactTitle: "Biz bilan bog'laning",
    contactSubtitle: l.contactSubtitle,
    contactInfoTitle: "Aloqa ma'lumotlari",
    addressLabel: "Manzil",
    address: l.address,
    phoneLabel: "Telefon",
    phoneDisplay,
    phoneTel: l.phoneTel,
    telegramLabel: "Telegram",
    telegramDisplay,
    hoursLabel: "Ish vaqti",
    hours: l.hours,

    footerBrandName: l.brandName,
    footerTagline:
      "Milliy ta'm va shinam muhitda oilaviy uchrashuvlar uchun maskan.",
    footerCol2Title: "Tezkor havolalar",
    footerCol3Title: "Xizmatlar",
    footerCol4Title: "Kontakt",
    footerLinkAbout: l.navAbout,
    footerLinkFaq: l.navFaq,
    footerLinkContact: l.navContact,
    footerSvc1: "Oilaviy zal",
    footerSvc2: "Tadbirlar",
    footerSvc3: "Biznes tushlik",
    footerSvcBron: "Bron qilish",
    footerPhone: phoneDisplay,
    footerTelegram: telegramDisplay,
    footerCity: FOOTER_CITY_DEFAULT,
    footerCopyrightSuffix: l.footerCopyrightSuffix,
  };
}
