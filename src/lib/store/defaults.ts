import {
  FeatureItem,
  LandingContent,
  ServiceItem,
  StatItem,
  Testimonial,
  VizitkaContent,
  GalleryItem,
} from "./types";

export function defaultVizitkaContent(businessName = "Biznesingiz nomi"): VizitkaContent {
  return {
    businessName,
    category: "Xizmat / Biznes turi",
    tagline: "Qisqa va lo'nda taqdimot",
    description:
      "Mijozlarga o'zingiz haqingizda bir-ikki jumlada gapiring. Nima qilasiz va nima uchun sizni tanlashlari kerak.",
    phone: "+998 90 123 45 67",
    address: "Toshkent sh., Chilonzor tumani",
    mapsUrl: "",
    hoursLine: "Du – Sh: 09:00 – 20:00",
    social: [],
    accentInitials: deriveInitials(businessName),
    heroImage: undefined,
    logoImage: undefined,
    colorTheme: "mono",
    pattern: "none",
  };
}

export function defaultLandingContent(businessName = "Biznesingiz nomi"): LandingContent {
  return {
    ...defaultVizitkaContent(businessName),
    layoutVariant: "simple",
    sectionBlocks: [
      {
        id: "sb-1",
        title: "Biz haqimizda",
        body:
          "Bu yerda kompaniyangiz yoki xizmatlaringiz haqida batafsil yozing — tarix, vaqf-muvaffaqiyat, ish tamoyilingiz.",
      },
      {
        id: "sb-2",
        title: "Nima uchun aynan biz?",
        body:
          "Mijozlar uchun afzalliklaringizni aniq va sodda tilda yozing: tezkorlik, kafolat, individual yondashuv va hokazo.",
      },
    ],
    contactSectionTitle: "Ariza qoldiring",
    contactSectionSubtitle:
      "Ism, telefon va Telegram — javob berish uchun yetarli. Xabar qoldiring, biz tezda bog‘lanamiz.",
    heroEyebrow: "O'ZBEKISTON · TOSHKENT",
    heroTitle: `${businessName} — xizmatlaringiz sarhisobi`,
    heroSubtitle:
      "Mijozlarga o'zingizni, xizmatlaringizni va narxlaringizni bir sahifada toza va tushunarli taqdim eting.",
    about:
      "Biznesingizning tarixi, jamoangiz va uslubingiz haqida qisqacha yozing. Mijoz sizni tushunishi uchun bu bo'lim muhim.",
    hours: "Du – Sh: 09:00 – 20:00\nYak: dam olish kuni",
    services: defaultServices(),
    gallery: defaultGallery(),
    features: defaultFeatures(),
    stats: defaultStats(),
    testimonials: defaultTestimonials(),
    ctaTitle: "Bugun bog'laning — tezda javob beramiz",
    ctaSubtitle:
      "Telefon qilish yoki xabar yozish — har ikkisi ham ochiq. Savollaringizga 24 soat ichida javob beramiz.",
  };
}

function defaultServices(): ServiceItem[] {
  return [
    { id: "svc-1", name: "Asosiy xizmat", price: "100 000 so'm", description: "Mijozlar eng ko'p buyurtma qiladigan xizmat." },
    { id: "svc-2", name: "Kengaytirilgan xizmat", price: "250 000 so'm", description: "Premium variant — qo'shimcha imkoniyatlar bilan." },
    { id: "svc-3", name: "Individual taklif", price: "Kelishuv asosida", description: "Katta buyurtmalar uchun shaxsiy narx." },
  ];
}

function defaultGallery(): GalleryItem[] {
  return [
    { id: "g-1", caption: "Namuna #1" },
    { id: "g-2", caption: "Namuna #2" },
    { id: "g-3", caption: "Namuna #3" },
    { id: "g-4", caption: "Namuna #4" },
  ];
}

function defaultFeatures(): FeatureItem[] {
  return [
    { id: "f-1", icon: "star", title: "Sifat kafolati", description: "Har bir xizmat shaxsiy nazorat ostida bajariladi." },
    { id: "f-2", icon: "clock", title: "Aniq vaqtda", description: "Kelishilgan muddatda, kechikmasdan topshiramiz." },
    { id: "f-3", icon: "shield", title: "Halol narx", description: "Yashirin to'lovlar yo'q — barcha narxlar oldindan aytiladi." },
    { id: "f-4", icon: "users", title: "Qo'llab-quvvatlash", description: "Telefon yoki Telegram orqali — har doim aloqada." },
  ];
}

function defaultStats(): StatItem[] {
  return [
    { id: "st-1", value: "500+", label: "Mamnun mijoz" },
    { id: "st-2", value: "5 yil", label: "Bozorda tajriba" },
    { id: "st-3", value: "24 soat", label: "Javob beramiz" },
    { id: "st-4", value: "100%", label: "Sifat kafolati" },
  ];
}

function defaultTestimonials(): Testimonial[] {
  return [
    { id: "t-1", author: "Aziza K.", role: "Doimiy mijoz", rating: 5, text: "Juda yoqdi. Har safar professionallik darajasida xizmat ko'rsatishadi. Tavsiya qilaman!" },
    { id: "t-2", author: "Sardor M.", role: "Biznes hamkor", rating: 5, text: "Ishonchli va aniq. Kelishilgan vaqtda topshirib berishadi, natija har safar yuqori." },
    { id: "t-3", author: "Malika R.", role: "Yangi mijoz", rating: 5, text: "Do'stim tavsiya qilgan edi, ajoyib tajriba bo'ldi. Narx-sifat munosabati juda yaxshi." },
  ];
}

export function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "WB";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
