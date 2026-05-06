import { getColorTheme, type LandingContent } from "@/lib/store/types";
import { SocialRow } from "./social-icons";
import { LandingInquiryForm } from "./landing-inquiry-form";
import { LandingFaqAccordion } from "./landing-faq-accordion";

type Props = {
  content: LandingContent;
  slug: string;
};

export function MarketingLandingTemplate({ content, slug }: Props) {
  const theme = getColorTheme(content.colorTheme);
  const primary = theme.primary;
  const primaryDark = theme.primaryDark;
  const contrast = theme.primaryContrast;

  const heroPrimary = content.heroCtaPrimaryLabel?.trim() || "Buyurtma berish";
  const heroSecondary = content.heroCtaSecondaryLabel?.trim() || "Xizmatlar";

  const servicesTitle = content.servicesSectionTitle?.trim() || "Xizmatlar va tariflar";
  const servicesSubtitle =
    content.servicesSectionSubtitle?.trim() ||
    "Har bir paket — aniq narx va qisqa tavsif. Batafsil uchun bog‘laning.";

  const processTitle = content.processSectionTitle?.trim() || "Qanday ishlaymiz";
  const steps = content.processSteps ?? [];

  const faqTitle = content.faqSectionTitle?.trim() || "Ko‘p beriladigan savollar";
  const faqItems = content.faqItems ?? [];

  return (
    <div className="flex min-h-full w-full flex-col bg-white text-black">
      <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[12px] font-bold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark})` }}
            >
              {content.accentInitials || "WL"}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{content.businessName}</p>
              {content.category ? (
                <p className="truncate text-[11px] text-neutral-500">{content.category}</p>
              ) : null}
            </div>
          </div>
          <nav
            className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex"
            aria-label="Asosiy navigatsiya"
          >
            <a href="#services" className="transition-colors hover:text-black">
              Xizmatlar
            </a>
            <a href="#process" className="transition-colors hover:text-black">
              Jarayon
            </a>
            <a href="#faq" className="transition-colors hover:text-black">
              FAQ
            </a>
            <a href="#contact" className="transition-colors hover:text-black">
              Aloqa
            </a>
          </nav>
          {content.phone ? (
            <a
              href={`tel:${content.phone.replace(/\s/g, "")}`}
              className="hidden h-10 flex-shrink-0 items-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:inline-flex"
              style={{ background: primary }}
            >
              {content.phone}
            </a>
          ) : null}
        </div>
      </header>

      <section
        className="relative overflow-hidden px-4 pb-16 pt-14 text-white sm:px-5 sm:pb-24 sm:pt-20"
        style={{
          background: `linear-gradient(145deg, ${primary} 0%, ${primaryDark} 55%, #0a0a0a 100%)`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 0%, white 0, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          {content.heroEyebrow ? (
            <p
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ backgroundColor: `${contrast}18`, color: contrast }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden />
              {content.heroEyebrow}
            </p>
          ) : null}
          <h1 className="mt-6 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            {content.heroTitle || content.businessName}
          </h1>
          {content.heroSubtitle ? (
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed opacity-90 sm:text-lg">
              {content.heroSubtitle}
            </p>
          ) : null}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#contact"
              className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl px-8 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: contrast, color: primaryDark }}
            >
              {heroPrimary}
            </a>
            <a
              href="#services"
              className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl border-2 border-white/35 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              {heroSecondary}
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-20 border-b border-[color:var(--border)] bg-neutral-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Tariflar
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              {servicesTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">{servicesSubtitle}</p>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.services.map((svc, idx) => (
              <li
                key={svc.id}
                className="flex flex-col rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark})` }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-right font-mono text-sm font-semibold text-black">{svc.price}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug">{svc.name}</h3>
                {svc.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{svc.description}</p>
                ) : null}
                {svc.bullets && svc.bullets.length > 0 ? (
                  <ul className="mt-4 space-y-2 border-t border-[color:var(--border)] pt-4 text-sm text-neutral-700">
                    {svc.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-400" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="process" className="scroll-mt-20 border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Bosqichlar
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{processTitle}</h2>
          </div>
          {steps.length ? (
            <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <li
                  key={step.id}
                  className="relative rounded-2xl border border-[color:var(--border)] bg-white p-5"
                >
                  <span
                    className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: primary }}
                  >
                    {step.step}
                  </span>
                  <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.body}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-b border-[color:var(--border)] bg-neutral-50/40">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-5 sm:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{faqTitle}</h2>
          </div>
          <div className="mt-10">
            <LandingFaqAccordion items={faqItems} accentColor={primary} />
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-20 border-b border-[color:var(--border)] py-16 sm:py-20"
        style={{
          background: `linear-gradient(180deg, ${theme.soft} 0%, white 45%)`,
        }}
      >
        <div className="mx-auto max-w-lg px-4 sm:px-5">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            {content.contactSectionTitle ?? "Ariza qoldiring"}
          </h2>
          {content.contactSectionSubtitle ? (
            <p className="mt-2 text-center text-sm text-neutral-600">{content.contactSectionSubtitle}</p>
          ) : null}
          <div className="mt-10 rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm sm:p-8">
            <LandingInquiryForm slug={slug} />
          </div>
        </div>
      </section>

      <footer className="border-t border-[color:var(--border)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-semibold">{content.businessName}</p>
            {content.phone ? (
              <a
                href={`tel:${content.phone.replace(/\s/g, "")}`}
                className="mt-1 inline-block font-mono text-sm text-neutral-600 hover:text-black"
              >
                {content.phone}
              </a>
            ) : null}
          </div>
          <SocialRow social={content.social} variant="light" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            © {new Date().getFullYear()} · weblinker.uz
          </p>
        </div>
      </footer>
    </div>
  );
}
