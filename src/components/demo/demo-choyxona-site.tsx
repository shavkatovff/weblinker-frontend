import type { DemoChoyxonaBlocks, DemoChoyxonaContent } from "@/lib/demo-choyxona/types";
import { DemoContactForm } from "./demo-contact-form";

type Props = {
  content: DemoChoyxonaContent;
  titleFontClassName: string;
};

function telegramHref(handle: string): string {
  const h = handle.trim().replace(/^@+/, "");
  return `https://t.me/${encodeURIComponent(h)}`;
}

/** Birinchi mavjud bo‘limga skroll (tugmalar uchun) */
function primaryScrollHref(blk: DemoChoyxonaBlocks): string | null {
  if (blk.contact) return "#contact";
  if (blk.faq) return "#faq";
  if (blk.about) return "#about";
  if (blk.hero) return "#home";
  return null;
}

export function DemoChoyxonaSite({ content, titleFontClassName }: Props) {
  const blk = content.blocks;
  const bullets = [...content.aboutBullets];
  while (bullets.length < 4) bullets.push("");
  const faqList = [...content.faqItems];
  while (faqList.length < 4) faqList.push({ q: "", a: "" });

  const scrollHref = primaryScrollHref(blk);
  const showNavCta = scrollHref !== null;

  return (
    <>
      {blk.header && (
        <nav className="sticky top-0 z-[99] border-b border-black/10 bg-[#fff8ed]/90 backdrop-blur-md">
          <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between gap-6 px-[min(18px,4vw)]">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#b56b25] to-[#df9c4f] text-lg text-white shadow-[0_10px_26px_rgba(181,107,37,.35)]">
                ☕
              </span>
              <span className="truncate text-lg font-black text-[#20140c]">{content.brandName}</span>
            </div>
            <div className="hidden items-center gap-5 text-[15px] font-bold text-[#4b3828] md:flex">
              {blk.hero && (
                <a href="#home" className="hover:text-[#b56b25]">
                  Bosh sahifa
                </a>
              )}
              {blk.about && (
                <a href="#about" className="hover:text-[#b56b25]">
                  {content.navAbout}
                </a>
              )}
              {blk.faq && (
                <a href="#faq" className="hover:text-[#b56b25]">
                  {content.navFaq}
                </a>
              )}
              {blk.contact && (
                <a href="#contact" className="hover:text-[#b56b25]">
                  {content.navContact}
                </a>
              )}
            </div>
            {showNavCta && (
              <a
                href={scrollHref}
                className="hidden shrink-0 rounded-full bg-[#b56b25] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(181,107,37,.28)] transition hover:bg-[#7e4312] sm:inline-flex"
              >
                {content.navCta}
              </a>
            )}
          </div>
        </nav>
      )}

      {blk.hero && (
        <header
          id="home"
          className="relative overflow-hidden pb-14 pt-16 sm:pb-[70px] sm:pt-[88px]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[120px] -top-[140px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(181,107,37,.26),transparent_68%)]"
          />
          <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-[min(18px,4vw)] lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(181,107,37,.12)] px-3.5 py-2 text-sm font-extrabold text-[#7e4312]">
                ✨ Milliy ta’m, shinam muhit
              </div>
              <h1
                className={`${titleFontClassName} mb-5 text-[clamp(40px,6vw,76px)] font-extrabold leading-[1.06] tracking-[-1.6px] text-[#20140c]`}
              >
                {content.heroTitle}
              </h1>
              <p className="mb-7 max-w-xl text-lg leading-relaxed text-[#755f4b]">{content.heroLead}</p>
              {scrollHref && (
                <div className="flex flex-wrap gap-3">
                  <a
                    href={scrollHref}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#b56b25] px-6 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(181,107,37,.28)] transition hover:bg-[#7e4312]"
                  >
                    {content.heroCta}
                  </a>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-[26px] shadow-[0_24px_70px_rgba(89,51,18,.16)] ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.heroImageUrl}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-[22px] bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[min(360px,calc(100%-2rem))]">
                <p className={`${titleFontClassName} text-lg font-bold text-[#20140c]`}>
                  {content.heroCardTitle}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#755f4b]">{content.heroCardText}</p>
              </div>
            </div>
          </div>
        </header>
      )}

      {blk.about && (
        <section id="about" className="border-t border-black/5 bg-white/40 py-16 sm:py-20">
          <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-[min(18px,4vw)] lg:grid-cols-2 lg:gap-14">
            <div className="overflow-hidden rounded-[26px] shadow-[0_24px_70px_rgba(89,51,18,.12)] ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.aboutImageUrl}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div>
              <div className="mb-3 inline-flex rounded-full bg-[rgba(181,107,37,.12)] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#7e4312]">
                Biz haqimizda
              </div>
              <h2
                className={`${titleFontClassName} mb-4 text-3xl font-bold tracking-tight text-[#20140c] sm:text-4xl`}
              >
                {content.aboutTitle}
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-[#755f4b]">{content.aboutLead}</p>
              <ul className="grid gap-3">
                {bullets.slice(0, 4).map((line, i) => (
                  <li key={i} className="flex gap-3 text-[15px] font-medium text-[#20140c]">
                    <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[#355b33]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {blk.faq && (
        <section id="faq" className="border-t border-black/5 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1180px] px-[min(18px,4vw)]">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <div className="mb-3 inline-flex rounded-full bg-[rgba(181,107,37,.12)] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#7e4312]">
                Savol-javob
              </div>
              <h2
                className={`${titleFontClassName} text-3xl font-bold tracking-tight text-[#20140c] sm:text-4xl`}
              >
                {content.faqTitle}
              </h2>
            </div>
            <div className="mx-auto grid max-w-[900px] gap-3">
              {faqList.slice(0, 4).map((item, i) => (
                <details
                  key={i}
                  className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm open:shadow-md"
                  open={i === 0}
                >
                  <summary className="cursor-pointer list-none px-5 py-4 text-[15px] font-bold text-[#20140c] marker:hidden [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      {item.q || `Savol ${i + 1}`}
                      <span className="text-neutral-400 transition group-open:rotate-180">▼</span>
                    </span>
                  </summary>
                  <div className="border-t border-black/5 px-5 pb-4 pt-0 text-sm leading-relaxed text-[#755f4b]">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {blk.contact && (
        <section id="contact" className="border-t border-black/5 bg-white/35 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1180px] px-[min(18px,4vw)]">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <div className="mb-3 inline-flex rounded-full bg-[rgba(181,107,37,.12)] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#7e4312]">
                Aloqa
              </div>
              <h2
                className={`${titleFontClassName} text-3xl font-bold tracking-tight text-[#20140c] sm:text-4xl`}
              >
                {content.contactTitle}
              </h2>
              <p className="mt-3 text-[#755f4b]">{content.contactSubtitle}</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(89,51,18,.08)]">
                <h3 className="text-lg font-bold text-[#20140c]">{content.contactInfoTitle}</h3>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex gap-3">
                    <span className="text-lg">📍</span>
                    <div>
                      <div className="font-bold text-[#20140c]">{content.addressLabel}</div>
                      <div className="text-[#755f4b]">{content.address}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg">☎</span>
                    <div>
                      <div className="font-bold text-[#20140c]">{content.phoneLabel}</div>
                      <a className="text-[#b56b25] hover:underline" href={`tel:${content.phoneTel}`}>
                        {content.phoneDisplay}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <div className="font-bold text-[#20140c]">{content.telegramLabel}</div>
                      <a
                        className="text-[#b56b25] hover:underline"
                        href={telegramHref(content.telegramDisplay)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {content.telegramDisplay}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg">⏰</span>
                    <div>
                      <div className="font-bold text-[#20140c]">{content.hoursLabel}</div>
                      <div className="text-[#755f4b]">{content.hours}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(89,51,18,.08)]">
                <DemoContactForm />
              </div>
            </div>
          </div>
        </section>
      )}

      {blk.footer && (
        <footer className="border-t border-white/10 bg-[#20140c] py-14 text-[#fff2de]">
          <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-[min(18px,4vw)] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#b56b25] to-[#df9c4f] text-lg text-white">
                  ☕
                </span>
                <span className="text-lg font-black">{content.footerBrandName}</span>
              </div>
              <p className="text-sm leading-relaxed text-[#d9c5ad]">
                Milliy ta’m va shinam muhit — oilaviy dam olish va uchrashuvlar uchun.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-white">{content.footerCol2Title}</h3>
              <div className="grid gap-2 text-sm text-[#d9c5ad]">
                {blk.hero && (
                  <a href="#home" className="hover:text-white">
                    Bosh sahifa
                  </a>
                )}
                {blk.about && (
                  <a href="#about" className="hover:text-white">
                    {content.footerLinkAbout}
                  </a>
                )}
                {blk.faq && (
                  <a href="#faq" className="hover:text-white">
                    {content.footerLinkFaq}
                  </a>
                )}
                {blk.contact && (
                  <a href="#contact" className="hover:text-white">
                    {content.footerLinkContact}
                  </a>
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-white">{content.footerCol3Title}</h3>
              <div className="grid gap-2 text-sm text-[#d9c5ad]">
                <span>{content.footerSvc1}</span>
                <span>{content.footerSvc2}</span>
                <span>{content.footerSvc3}</span>
                {blk.contact ? (
                  <a href="#contact" className="hover:text-white">
                    {content.footerSvcBron}
                  </a>
                ) : (
                  <span>{content.footerSvcBron}</span>
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-white">{content.footerCol4Title}</h3>
              <div className="grid gap-2 text-sm text-[#d9c5ad]">
                <a href={`tel:${content.phoneTel}`} className="hover:text-white">
                  {content.footerPhone}
                </a>
                <a
                  href={telegramHref(content.footerTelegram)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  {content.footerTelegram}
                </a>
                <p>{content.footerCity}</p>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-10 w-full max-w-[1180px] border-t border-white/10 px-[min(18px,4vw)] pt-8 text-center text-xs text-[#d9c5ad]">
            <span>© {new Date().getFullYear()} {content.footerCopyrightSuffix}</span>
            <span className="mx-2 opacity-40">·</span>
            <span>{content.footerTechLine}</span>
          </div>
        </footer>
      )}
    </>
  );
}
