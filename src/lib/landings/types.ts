/**
 * Bitta landing — `Landing` jadval qatoriga to‘g‘ridan-to‘g‘ri mos struktura
 * (Prisma `Landing` modeli bilan bir xil maydon nomlari).
 */

export type LandingRecord = {
  id: string;
  ownerPublicId: string;

  /** weblinker.uz/{name} */
  name: string;
  /** Biznes turi / yo‘nalish (masalan: Chayxona) */
  category: string;
  plan: string;
  expiredAt: string | null;

  blockHeader: boolean;
  blockHero: boolean;
  blockAbout: boolean;
  blockFaq: boolean;
  blockContact: boolean;
  blockFooter: boolean;
  /** Dizayn shabloni: "1" | "2" | "3" | "4" */
  blocktheme: string;

  brandName: string;
  /** Header logo — to‘liq URL yoki `/uploads/...` (Prisma: `logourl`) */
  logourl: string;
  navAbout: string;
  navFaq: string;
  navContact: string;
  navCta: string;

  heroTitle: string;
  /** Hero ostidagi qisqa matn (Prisma: `description`, DB: `hero_desc`) */
  description: string;
  heroCta: string;
  heroImageUrl: string;

  aboutTitle: string;
  aboutLead: string;
  aboutImageUrl: string;
  aboutBullet1: string;
  aboutBullet2: string;
  aboutBullet3: string;
  aboutBullet4: string;

  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;

  contactSubtitle: string;
  address: string;
  phoneTel: string;
  telegram: string;
  hours: string;

  footerCopyrightSuffix: string;

  createdAt: string;
  updatedAt: string;
};

/** Saqlash/yangilash uchun yuboriladigan maydonlar (server boshqaradigan maydonlar bundan tashqari) */
export type LandingPatch = Partial<
  Omit<
    LandingRecord,
    "id" | "ownerPublicId" | "plan" | "expiredAt" | "createdAt" | "updatedAt"
  >
>;
