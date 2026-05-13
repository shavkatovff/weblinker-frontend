import type { DemoChoyxonaContent } from "./types";

export function defaultDemoChoyxonaContent(): DemoChoyxonaContent {
  return {
    blocks: {
      header: true,
      hero: true,
      about: true,
      faq: true,
      contact: true,
      footer: true,
    },
    brandName: "Nomdor Choyxonasi",
    logoUrl: "",
    navAbout: "Biz haqimizda",
    navFaq: "FAQ",
    navContact: "Aloqa",
    navCta: "Joy band qilish",
    heroTitle: "Nomdor Choyxonasida haqiqiy dam olish zavqini his qiling",
    heroLead:
      "Oilaviy uchrashuvlar, do‘stlar davrasi, biznes tushlik va maxsus tadbirlar uchun qulay, toza va milliy uslubdagi maskan.",
    heroCta: "Biz bilan bog‘lanish",
    heroImageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
    heroCardTitle: "Bugungi tavsiya: Osh va ko‘k choy",
    heroCardText:
      "Yangi tayyorlangan osh, tandir non va xushbo‘y choy bilan kuningizni yanada yoqimli qiling.",
    aboutImageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    aboutBadge: "Biz haqimizda",
    aboutTitle: "Milliy an’ana va zamonaviy xizmat uyg‘unligi",
    aboutLead:
      "Nomdor Choyxonasi mehmonlarga milliy taomlar, sifatli xizmat va yoqimli muhit taqdim etadi. Biz uchun har bir mehmon aziz, har bir buyurtma esa mas’uliyatdir.",
    aboutBullets: [
      "Keng, shinam va toza zallar",
      "Tezkor xizmat va xushmuomala jamoa",
      "Oilaviy va alohida suhbat xonalari",
      "Oldindan stol band qilish imkoniyati",
    ],
    faqBadge: "Savol-javob",
    faqTitle: "Ko‘p so‘raladigan savollar",
    faqItems: [
      {
        q: "Oldindan stol band qilish mumkinmi?",
        a: "Ha, telefon orqali yoki pastdagi forma orqali stol band qilishingiz mumkin.",
      },
      {
        q: "Oilaviy xonalar bormi?",
        a: "Ha, oilaviy va alohida suhbat uchun qulay xonalar mavjud.",
      },
      {
        q: "Tadbir o‘tkazish mumkinmi?",
        a: "Ha, tug‘ilgan kun, uchrashuv va kichik marosimlar uchun xizmat ko‘rsatamiz.",
      },
      {
        q: "Yetkazib berish xizmati bormi?",
        a: "Hozircha ayrim hududlarga yetkazib berish mavjud. Batafsil ma’lumot uchun telefon orqali bog‘laning.",
      },
    ],
    contactBadge: "Aloqa",
    contactTitle: "Biz bilan bog‘laning",
    contactSubtitle: "Savolingiz bormi yoki stol band qilmoqchimisiz? Ma’lumotlaringizni qoldiring.",
    contactInfoTitle: "Aloqa ma’lumotlari",
    addressLabel: "Manzil",
    address: "Toshkent shahri, Markaziy ko‘cha 12-uy",
    phoneLabel: "Telefon",
    phoneDisplay: "+998 90 123 45 67",
    phoneTel: "+998901234567",
    telegramLabel: "Telegram",
    telegramDisplay: "@nomdor_choyxonasi",
    hoursLabel: "Ish vaqti",
    hours: "Har kuni 09:00 — 23:00",
    footerBrandName: "Nomdor Choyxonasi",
    footerTagline:
      "Milliy ta’m va shinam muhitda oilaviy uchrashuvlar, totuv da’fda va biznes tushliklar uchun maskan.",
    footerCol2Title: "Tezkor havolalar",
    footerCol3Title: "Xizmatlar",
    footerCol4Title: "Kontakt",
    footerLinkAbout: "Biz haqimizda",
    footerLinkFaq: "FAQ",
    footerLinkContact: "Aloqa",
    footerSvc1: "Oilaviy zal",
    footerSvc2: "Tadbirlar",
    footerSvc3: "Biznes tushlik",
    footerSvcBron: "Bron qilish",
    footerPhone: "+998 90 123 45 67",
    footerTelegram: "@nomdor_choyxonasi",
    footerCity: "Toshkent",
    footerCopyrightSuffix: "Nomdor Choyxonasi. Barcha huquqlar himoyalangan.",
  };
}
