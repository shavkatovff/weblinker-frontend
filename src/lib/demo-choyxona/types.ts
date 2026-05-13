export type DemoChoyxonaFaqItem = {
  q: string;
  a: string;
};

/** Sahifa bo‘limlarini yoqish/o‘chirish (tahrir / ko‘rinish) */
export type DemoChoyxonaBlocks = {
  header: boolean;
  hero: boolean;
  about: boolean;
  faq: boolean;
  contact: boolean;
  footer: boolean;
};

export type DemoChoyxonaContent = {
  blocks: DemoChoyxonaBlocks;
  brandName: string;
  logoUrl: string;
  navAbout: string;
  navFaq: string;
  navContact: string;
  navCta: string;
  heroTitle: string;
  heroLead: string;
  heroCta: string;
  heroImageUrl: string;
  heroCardTitle: string;
  heroCardText: string;
  aboutImageUrl: string;
  /** About bo‘limidagi kichik yorliq (pill) matni */
  aboutBadge: string;
  aboutTitle: string;
  aboutLead: string;
  aboutBullets: string[];
  /** FAQ bo‘limidagi kichik yorliq (pill) matni */
  faqBadge: string;
  faqTitle: string;
  faqItems: DemoChoyxonaFaqItem[];
  /** Aloqa bo‘limidagi kichik yorliq (pill) matni */
  contactBadge: string;
  contactTitle: string;
  contactSubtitle: string;
  contactInfoTitle: string;
  addressLabel: string;
  address: string;
  phoneLabel: string;
  phoneDisplay: string;
  phoneTel: string;
  telegramLabel: string;
  telegramDisplay: string;
  hoursLabel: string;
  hours: string;
  footerBrandName: string;
  /** Footer brend nomi ostidagi qisqa ta’rif */
  footerTagline: string;
  footerCol2Title: string;
  footerCol3Title: string;
  footerCol4Title: string;
  footerLinkAbout: string;
  footerLinkFaq: string;
  footerLinkContact: string;
  footerSvc1: string;
  footerSvc2: string;
  footerSvc3: string;
  footerSvcBron: string;
  footerPhone: string;
  footerTelegram: string;
  footerCity: string;
  footerCopyrightSuffix: string;
};
