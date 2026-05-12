import { DEFAULT_LANDING_THEME } from "./themes";
import type { LandingRecord } from "./types";

/** Server bilan ulanmagan vaqtdagi taxminiy ko'rinish — namuna bilan to'ldirilgan */
export function sampleLanding(): LandingRecord {
  const now = new Date().toISOString();
  return {
    id: "local",
    ownerPublicId: "",

    name: "mening-saytim",
    plan: "10kun",
    expiredAt: null,

    blockHeader: true,
    blockHero: true,
    blockAbout: true,
    blockFaq: true,
    blockContact: true,
    blockFooter: true,
    blocktheme: DEFAULT_LANDING_THEME,

    brandName: "Nomdor Choyxonasi",
    navAbout: "Biz haqimizda",
    navFaq: "FAQ",
    navContact: "Aloqa",
    navCta: "Joy band qilish",

    heroTitle: "Nomdor Choyxonasida haqiqiy dam olish zavqini his qiling",
    heroCta: "Biz bilan bog'lanish",
    heroImageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",

    aboutTitle: "Milliy an'ana va zamonaviy xizmat uyg'unligi",
    aboutLead:
      "Nomdor Choyxonasi mehmonlarga milliy taomlar, sifatli xizmat va yoqimli muhit taqdim etadi.",
    aboutImageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    aboutBullet1: "Keng, shinam va toza zallar",
    aboutBullet2: "Tezkor xizmat va xushmuomala jamoa",
    aboutBullet3: "Oilaviy va alohida suhbat xonalari",
    aboutBullet4: "Oldindan stol band qilish imkoniyati",

    faq1Q: "Oldindan stol band qilish mumkinmi?",
    faq1A: "Ha, telefon yoki forma orqali band qilishingiz mumkin.",
    faq2Q: "Oilaviy xonalar bormi?",
    faq2A: "Ha, oilaviy va alohida xonalar mavjud.",
    faq3Q: "Tadbir o'tkazsa bo'ladimi?",
    faq3A: "Ha, kichik marosim va tadbirlar uchun xizmat ko'rsatamiz.",
    faq4Q: "Yetkazib berish bormi?",
    faq4A: "Ayrim hududlarga yetkazib berish mavjud.",

    contactSubtitle:
      "Savolingiz bormi yoki stol band qilmoqchimisiz? Ma'lumotlaringizni qoldiring.",
    address: "Toshkent shahri, Markaziy ko'cha 12-uy",
    phoneTel: "+998901234567",
    telegram: "@nomdor_choyxonasi",
    hours: "Har kuni 09:00 — 23:00",

    footerCopyrightSuffix:
      "Nomdor Choyxonasi. Barcha huquqlar himoyalangan.",

    createdAt: now,
    updatedAt: now,
  };
}
