import type {
  DemoChoyxonaBlocks,
  DemoChoyxonaContent,
} from "@/lib/demo-choyxona/types";
import {
  type LandingThemeId,
  DEFAULT_LANDING_THEME,
  getLandingTheme,
} from "@/lib/landings/themes";
import { DemoContactForm } from "./demo-contact-form";

type Props = {
  content: DemoChoyxonaContent;
  titleFontClassName: string;
  /** Tahrir rejimi: preview ustidan maydonga o‘tish */
  onRequestEdit?: (fieldId: string) => void;
  /** Masalan to‘liq preview: mobil nav o‘ngdagi asosiy CTA ni yashirish */
  hideNavCtaOnMobile?: boolean;
  /** Tanlangan rang shabloni (yo‘q bo‘lsa — `saffron`) */
  themeId?: LandingThemeId;
};

/* ------------------------------------------------------------------ */
/* Ikonkalar (SVG, inline)                                              */
/* ------------------------------------------------------------------ */

function PencilIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconPin(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconPhone(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function IconTelegram(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={props.className}
      aria-hidden
    >
      <path d="M21.7 3.3 2.6 10.7c-.9.4-.9 1.6 0 2l4.4 1.7 1.7 5.2c.3.8 1.2 1 1.8.4l2.5-2.4 4.4 3.2c.8.6 2 .2 2.2-.8l3-13.6c.3-1.2-.9-2.3-2-1.8Zm-3.4 5.1-7.7 6.7-.3 3.2-1.5-4.7 9.5-5.2Z" />
    </svg>
  );
}

function IconClock(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconChevron(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconCheck(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Preview ustidagi «Tahrirlash»                                       */
/* ------------------------------------------------------------------ */

function PreviewEditWrap(props: {
  editId: string;
  onRequestEdit?: (fieldId: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const { editId, onRequestEdit, children, className } = props;
  if (!onRequestEdit) return <>{children}</>;
  return (
    <div className={["group relative", className].filter(Boolean).join(" ")}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[20] opacity-0 shadow-[inset_0_0_0_1px_transparent] transition-[opacity,box-shadow] duration-150 max-lg:opacity-100 max-lg:shadow-[inset_0_0_0_1px_rgba(181,107,37,0.22)] group-hover:opacity-100 group-hover:shadow-[inset_0_0_0_2px_rgba(181,107,37,0.4)] lg:opacity-0 lg:group-hover:opacity-100"
      />
      <div className="pointer-events-none absolute right-1.5 top-1.5 z-[21] opacity-0 transition-opacity max-lg:pointer-events-auto max-lg:opacity-100 group-hover:opacity-100 lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:opacity-100">
        <button
          type="button"
          aria-label="Tahrirlash"
          title="Tahrirlash"
          className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#20140c] text-white shadow-md hover:bg-black lg:h-auto lg:w-auto lg:min-h-0 lg:px-2 lg:py-1 lg:text-[11px] lg:font-bold"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRequestEdit(editId);
          }}
        >
          <PencilIcon className="h-[18px] w-[18px] lg:hidden" />
          <span className="hidden lg:inline">Tahrirlash</span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Yordamchilar                                                         */
/* ------------------------------------------------------------------ */

function telegramHref(handle: string): string {
  const h = handle.trim().replace(/^@+/, "");
  return `https://t.me/${encodeURIComponent(h)}`;
}

function primaryScrollHref(blk: DemoChoyxonaBlocks): string | null {
  if (blk.contact) return "#contact";
  if (blk.faq) return "#faq";
  if (blk.about) return "#about";
  if (blk.hero) return "#home";
  return null;
}

/* ------------------------------------------------------------------ */
/* Site                                                                 */
/* ------------------------------------------------------------------ */

export function DemoChoyxonaSite({
  content,
  titleFontClassName,
  onRequestEdit,
  hideNavCtaOnMobile,
  themeId,
}: Props) {
  const blk = content.blocks;
  const bullets = [...content.aboutBullets];
  while (bullets.length < 4) bullets.push("");
  const faqList = [...content.faqItems];
  while (faqList.length < 4) faqList.push({ q: "", a: "" });

  const scrollHref = primaryScrollHref(blk);
  const showNavCta = scrollHref !== null;

  const theme = getLandingTheme(themeId ?? DEFAULT_LANDING_THEME);
  // CSS-variables for the theme are applied here so all descendants can use them.
  const themeStyle = theme.vars as React.CSSProperties;

  return (
    <div
      className="relative isolate overflow-hidden bg-[var(--c-bg)] text-[#20140c]"
      style={themeStyle}
    >
      {/* Sahifa orqa fonidagi yumshoq mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(900px 520px at 88% -80px, var(--c-p-glow), transparent 65%), radial-gradient(700px 480px at -10% 38%, color-mix(in srgb, var(--c-accent) 22%, transparent), transparent 60%), radial-gradient(620px 420px at 110% 92%, color-mix(in srgb, var(--c-p-solid) 16%, transparent), transparent 65%)",
        }}
      />

      {/* ------------------------- NAV ------------------------- */}
      {blk.header && (
        <nav
          className="sticky top-0 z-[99] border-b border-[#20140c]/10 backdrop-blur-md"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--c-bg) 85%, transparent)",
          }}
        >
          <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-[min(18px,4vw)] sm:h-[72px] sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                aria-hidden
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-black shadow-lg sm:inline-flex"
                style={{
                  background:
                    "linear-gradient(135deg, var(--c-p-from), var(--c-p-to))",
                  color: "var(--c-bg)",
                  boxShadow: "0 8px 22px var(--c-p-glow)",
                }}
              >
                {(content.brandName || "C").trim().charAt(0).toUpperCase()}
              </span>
              <PreviewEditWrap
                editId="brandName"
                onRequestEdit={onRequestEdit}
                className="min-w-0"
              >
                <span className={`${titleFontClassName} truncate text-base font-black tracking-tight text-[#20140c] sm:text-[19px]`}>
                  {content.brandName}
                </span>
              </PreviewEditWrap>
            </div>

            {/* Mobil menyu */}
            <details className="relative z-[130] shrink-0 md:hidden">
              <summary className="flex h-11 min-w-[44px] cursor-pointer list-none items-center justify-center rounded-xl border border-[#20140c]/15 bg-white/85 px-3 text-[#20140c] shadow-sm transition-colors marker:hidden hover:bg-white [&::-webkit-details-marker]:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
                <span className="sr-only">Menyu</span>
              </summary>
              <div
                className="choy-anim-fade-up absolute right-0 top-[calc(100%+8px)] min-w-[min(100vw-2rem,260px)] overflow-hidden rounded-2xl border border-[#20140c]/10 bg-[var(--c-bg)] py-2 shadow-[0_20px_50px_rgba(32,20,12,.18)]"
              >
                {blk.hero && (
                  <PreviewEditWrap editId="heroTitle" onRequestEdit={onRequestEdit}>
                    <a
                      href="#home"
                      className="block px-4 py-3 text-[15px] font-bold text-[#4b3828] transition-colors hover:bg-[var(--c-p-tint)] hover:text-[var(--c-p-strong)]"
                    >
                      Bosh sahifa
                    </a>
                  </PreviewEditWrap>
                )}
                {blk.about && (
                  <PreviewEditWrap editId="navAbout" onRequestEdit={onRequestEdit}>
                    <a
                      href="#about"
                      className="block px-4 py-3 text-[15px] font-bold text-[#4b3828] transition-colors hover:bg-[var(--c-p-tint)] hover:text-[var(--c-p-strong)]"
                    >
                      {content.navAbout}
                    </a>
                  </PreviewEditWrap>
                )}
                {blk.faq && (
                  <PreviewEditWrap editId="navFaq" onRequestEdit={onRequestEdit}>
                    <a
                      href="#faq"
                      className="block px-4 py-3 text-[15px] font-bold text-[#4b3828] transition-colors hover:bg-[var(--c-p-tint)] hover:text-[var(--c-p-strong)]"
                    >
                      {content.navFaq}
                    </a>
                  </PreviewEditWrap>
                )}
                {blk.contact && (
                  <PreviewEditWrap editId="navContact" onRequestEdit={onRequestEdit}>
                    <a
                      href="#contact"
                      className="block px-4 py-3 text-[15px] font-bold text-[#4b3828] transition-colors hover:bg-[var(--c-p-tint)] hover:text-[var(--c-p-strong)]"
                    >
                      {content.navContact}
                    </a>
                  </PreviewEditWrap>
                )}
              </div>
            </details>

            {/* Desktop menyu */}
            <div className="hidden items-center gap-7 text-[15px] font-bold text-[#4b3828] md:flex">
              {blk.hero && (
                <PreviewEditWrap editId="heroTitle" onRequestEdit={onRequestEdit}>
                  <a href="#home" className="relative transition-colors hover:text-[var(--c-p-solid)]">
                    Bosh sahifa
                  </a>
                </PreviewEditWrap>
              )}
              {blk.about && (
                <PreviewEditWrap editId="navAbout" onRequestEdit={onRequestEdit}>
                  <a href="#about" className="transition-colors hover:text-[var(--c-p-solid)]">
                    {content.navAbout}
                  </a>
                </PreviewEditWrap>
              )}
              {blk.faq && (
                <PreviewEditWrap editId="navFaq" onRequestEdit={onRequestEdit}>
                  <a href="#faq" className="transition-colors hover:text-[var(--c-p-solid)]">
                    {content.navFaq}
                  </a>
                </PreviewEditWrap>
              )}
              {blk.contact && (
                <PreviewEditWrap editId="navContact" onRequestEdit={onRequestEdit}>
                  <a href="#contact" className="transition-colors hover:text-[var(--c-p-solid)]">
                    {content.navContact}
                  </a>
                </PreviewEditWrap>
              )}
            </div>

            {showNavCta && (
              <div
                className={[
                  "inline-flex shrink-0",
                  hideNavCtaOnMobile ? "max-md:hidden" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <PreviewEditWrap
                  editId="navCta"
                  onRequestEdit={onRequestEdit}
                  className="inline-flex"
                >
                  <a
                    href={scrollHref ?? "#"}
                    className="choy-cta inline-flex max-w-[min(46vw,12rem)] items-center justify-center gap-1.5 truncate rounded-full px-4 py-2 text-center text-[12px] font-extrabold leading-tight text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] sm:max-w-none sm:px-5 sm:py-2.5 sm:text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--c-p-from), var(--c-p-to))",
                      boxShadow: "0 14px 30px var(--c-p-glow)",
                    }}
                  >
                    {content.navCta}
                  </a>
                </PreviewEditWrap>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* ------------------------- HERO ------------------------- */}
      {blk.hero && (
        <header
          id="home"
          className="relative overflow-hidden pb-16 pt-12 sm:pb-[80px] sm:pt-[90px]"
        >
          {/* Dekorativ shakllar */}
          <div
            aria-hidden
            className="choy-anim-float pointer-events-none absolute -right-[140px] -top-[180px] h-[460px] w-[460px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--c-p-glow), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="choy-anim-float-delay pointer-events-none absolute -left-[100px] top-[40%] h-[300px] w-[300px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--c-accent) 18%, transparent), transparent 70%)",
            }}
          />

          <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-[min(18px,4vw)] lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
            <div className="text-center lg:text-left">
              <PreviewEditWrap editId="heroTitle" onRequestEdit={onRequestEdit}>
                <h1
                  className={`${titleFontClassName} choy-anim-fade-up mb-6 text-balance text-[clamp(34px,7vw,76px)] font-extrabold leading-[1.04] tracking-[-1.2px] text-[#20140c]`}
                  style={{ animationDelay: "60ms" }}
                >
                  {content.heroTitle}
                </h1>
              </PreviewEditWrap>

              {scrollHref && (
                <div
                  className="choy-anim-fade-up flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                  style={{ animationDelay: "140ms" }}
                >
                  <PreviewEditWrap
                    editId="heroCta"
                    onRequestEdit={onRequestEdit}
                    className="inline-block"
                  >
                    <a
                      href={scrollHref}
                      className="choy-cta inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-extrabold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] sm:h-[52px] sm:text-[15px]"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--c-p-from), var(--c-p-to))",
                        boxShadow: "0 18px 38px var(--c-p-glow)",
                      }}
                    >
                      {content.heroCta}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </a>
                  </PreviewEditWrap>
                </div>
              )}
            </div>

            <PreviewEditWrap editId="heroImageUrl" onRequestEdit={onRequestEdit}>
              <div className="choy-anim-zoom-in relative">
                <div
                  aria-hidden
                  className="absolute -inset-3 -z-10 rounded-[30px] blur-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--c-p-solid) 30%, transparent), color-mix(in srgb, var(--c-accent) 20%, transparent))",
                  }}
                />
                <div className="overflow-hidden rounded-[26px] ring-1 ring-[#20140c]/10 shadow-[0_30px_80px_rgba(89,51,18,.22)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.heroImageUrl}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                </div>
              </div>
            </PreviewEditWrap>
          </div>
        </header>
      )}

      {/* ------------------------- ABOUT ------------------------- */}
      {blk.about && (
        <section
          id="about"
          className="relative border-t border-[#20140c]/5 bg-white/55 py-16 sm:py-24"
        >
          <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-[min(18px,4vw)] lg:grid-cols-2 lg:gap-16">
            <PreviewEditWrap
              editId="aboutImageUrl"
              onRequestEdit={onRequestEdit}
              className="order-2 lg:order-1"
            >
              <div className="choy-anim-fade-up relative">
                <div
                  aria-hidden
                  className="absolute -inset-2 -z-10 rounded-[28px] blur-xl"
                  style={{
                    background:
                      "linear-gradient(45deg, color-mix(in srgb, var(--c-accent) 14%, transparent), color-mix(in srgb, var(--c-p-solid) 22%, transparent))",
                  }}
                />
                <div className="overflow-hidden rounded-[26px] ring-1 ring-[#20140c]/10 shadow-[0_24px_70px_rgba(89,51,18,.16)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.aboutImageUrl}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                  />
                </div>
              </div>
            </PreviewEditWrap>

            <div className="order-1 lg:order-2">
              <PreviewEditWrap
                editId="aboutBadge"
                onRequestEdit={onRequestEdit}
                className="mb-3 inline-block"
              >
                <div className="choy-anim-fade-up inline-flex rounded-full bg-[var(--c-p-tint)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--c-p-strong)]">
                  {content.aboutBadge}
                </div>
              </PreviewEditWrap>
              <PreviewEditWrap editId="aboutTitle" onRequestEdit={onRequestEdit}>
                <h2
                  className={`${titleFontClassName} choy-anim-fade-up mb-4 text-balance text-3xl font-bold tracking-tight text-[#20140c] sm:text-[40px] sm:leading-[1.1]`}
                  style={{ animationDelay: "60ms" }}
                >
                  {content.aboutTitle}
                </h2>
              </PreviewEditWrap>
              <PreviewEditWrap editId="aboutLead" onRequestEdit={onRequestEdit}>
                <p
                  className="choy-anim-fade-up mb-7 text-pretty text-[17px] leading-relaxed text-[#755f4b] sm:text-lg"
                  style={{ animationDelay: "120ms" }}
                >
                  {content.aboutLead}
                </p>
              </PreviewEditWrap>
              <ul className="grid gap-3">
                {bullets.slice(0, 4).map((line, i) => (
                  <PreviewEditWrap
                    key={i}
                    editId={`aboutBullet${i + 1}`}
                    onRequestEdit={onRequestEdit}
                  >
                    <li
                      className="choy-anim-fade-up flex items-start gap-3 rounded-xl bg-white/65 px-3.5 py-2.5 text-[15px] font-medium text-[#20140c] ring-1 ring-[#20140c]/[0.04] transition-colors hover:bg-white"
                      style={{ animationDelay: `${160 + i * 70}ms` }}
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--c-accent)] text-white shadow-sm">
                        <IconCheck className="h-3.5 w-3.5" />
                      </span>
                      <span>{line}</span>
                    </li>
                  </PreviewEditWrap>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------- FAQ ------------------------- */}
      {blk.faq && (
        <section
          id="faq"
          className="relative border-t border-[#20140c]/5 py-16 sm:py-24"
        >
          <div className="mx-auto w-full max-w-[1180px] px-[min(18px,4vw)]">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <PreviewEditWrap
                editId="faqBadge"
                onRequestEdit={onRequestEdit}
                className="mb-3 inline-block"
              >
                <div className="choy-anim-fade-up inline-flex rounded-full bg-[var(--c-p-tint)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--c-p-strong)]">
                  {content.faqBadge}
                </div>
              </PreviewEditWrap>
              <PreviewEditWrap editId="faqTitle" onRequestEdit={onRequestEdit}>
                <h2
                  className={`${titleFontClassName} choy-anim-fade-up text-balance text-3xl font-bold tracking-tight text-[#20140c] sm:text-[40px] sm:leading-[1.1]`}
                  style={{ animationDelay: "60ms" }}
                >
                  {content.faqTitle}
                </h2>
              </PreviewEditWrap>
            </div>
            <div className="mx-auto grid max-w-[900px] gap-3">
              {faqList.slice(0, 4).map((item, i) => (
                <PreviewEditWrap
                  key={i}
                  editId={`faq${i + 1}Q`}
                  onRequestEdit={onRequestEdit}
                >
                  <details
                    className="choy-anim-fade-up choy-card group overflow-hidden rounded-2xl border border-[#20140c]/10 bg-white/85 shadow-[0_8px_24px_rgba(89,51,18,.06)] open:shadow-[0_16px_40px_rgba(89,51,18,.12)]"
                    style={{ animationDelay: `${i * 80}ms` }}
                    open={i === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[15px] font-bold text-[#20140c] marker:hidden sm:px-6 sm:py-5 sm:text-base [&::-webkit-details-marker]:hidden">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--c-p-tint)] text-[12px] font-black text-[var(--c-p-strong)]">
                          {i + 1}
                        </span>
                        <span className="min-w-0">{item.q || `Savol ${i + 1}`}</span>
                      </span>
                      <span
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--c-bg)] text-[var(--c-p-strong)] ring-1 ring-[#20140c]/10 transition-transform duration-300 group-open:rotate-180 group-open:bg-[var(--c-p-solid)] group-open:text-white"
                      >
                        <IconChevron className="h-4 w-4" />
                      </span>
                    </summary>
                    <div className="border-t border-[#20140c]/[0.06] px-5 pb-5 pt-3 text-[15px] leading-relaxed text-[#755f4b] sm:px-6 sm:pb-6">
                      {item.a}
                    </div>
                  </details>
                </PreviewEditWrap>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------- CONTACT ------------------------- */}
      {blk.contact && (
        <section
          id="contact"
          className="relative border-t border-[#20140c]/5 py-16 sm:py-24"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.70), var(--c-bg) 50%, var(--c-p-tint))",
          }}
        >
          <div className="mx-auto w-full max-w-[1180px] px-[min(18px,4vw)]">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <PreviewEditWrap
                editId="contactBadge"
                onRequestEdit={onRequestEdit}
                className="mb-3 inline-block"
              >
                <div className="choy-anim-fade-up inline-flex rounded-full bg-[var(--c-p-tint)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--c-p-strong)]">
                  {content.contactBadge}
                </div>
              </PreviewEditWrap>
              <PreviewEditWrap editId="contactTitle" onRequestEdit={onRequestEdit}>
                <h2
                  className={`${titleFontClassName} choy-anim-fade-up text-balance text-3xl font-bold tracking-tight text-[#20140c] sm:text-[40px] sm:leading-[1.1]`}
                  style={{ animationDelay: "60ms" }}
                >
                  {content.contactTitle}
                </h2>
              </PreviewEditWrap>
              <PreviewEditWrap
                editId="contactSubtitle"
                onRequestEdit={onRequestEdit}
                className="mt-3 block"
              >
                <p
                  className="choy-anim-fade-up text-pretty text-[#755f4b] sm:text-[17px]"
                  style={{ animationDelay: "120ms" }}
                >
                  {content.contactSubtitle}
                </p>
              </PreviewEditWrap>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
              {/* Info kartochka */}
              <div className="choy-anim-fade-up choy-card relative overflow-hidden rounded-[26px] border border-[#20140c]/10 bg-white p-5 shadow-[0_20px_60px_rgba(89,51,18,.10)] sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in srgb, var(--c-p-solid) 18%, transparent), transparent 70%)",
                  }}
                />
                <PreviewEditWrap editId="contactInfoTitle" onRequestEdit={onRequestEdit}>
                  <h3 className={`${titleFontClassName} text-[20px] font-bold text-[#20140c] sm:text-[22px]`}>
                    {content.contactInfoTitle}
                  </h3>
                </PreviewEditWrap>

                <div className="mt-5 space-y-3 text-sm sm:mt-6 sm:space-y-3.5">
                  <PreviewEditWrap editId="address" onRequestEdit={onRequestEdit}>
                    <ContactRow
                      label={content.addressLabel}
                      icon={<IconPin className="h-5 w-5" />}
                    >
                      <span className="text-[#755f4b]">{content.address}</span>
                    </ContactRow>
                  </PreviewEditWrap>

                  <PreviewEditWrap editId="phoneDisplay" onRequestEdit={onRequestEdit}>
                    <ContactRow
                      label={content.phoneLabel}
                      icon={<IconPhone className="h-5 w-5" />}
                    >
                      <a
                        className="font-semibold text-[var(--c-p-solid)] transition-colors hover:text-[var(--c-p-strong)] hover:underline"
                        href={`tel:${content.phoneTel || content.phoneDisplay}`}
                      >
                        {content.phoneDisplay}
                      </a>
                    </ContactRow>
                  </PreviewEditWrap>

                  <PreviewEditWrap editId="telegramDisplay" onRequestEdit={onRequestEdit}>
                    <ContactRow
                      label={content.telegramLabel}
                      icon={<IconTelegram className="h-5 w-5" />}
                    >
                      <a
                        className="font-semibold text-[var(--c-p-solid)] transition-colors hover:text-[var(--c-p-strong)] hover:underline"
                        href={telegramHref(content.telegramDisplay)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {content.telegramDisplay}
                      </a>
                    </ContactRow>
                  </PreviewEditWrap>

                  <PreviewEditWrap editId="hours" onRequestEdit={onRequestEdit}>
                    <ContactRow
                      label={content.hoursLabel}
                      icon={<IconClock className="h-5 w-5" />}
                    >
                      <span className="text-[#755f4b]">{content.hours}</span>
                    </ContactRow>
                  </PreviewEditWrap>
                </div>
              </div>

              {/* Forma kartochka */}
              <div
                className="choy-anim-fade-up choy-card relative overflow-hidden rounded-[26px] border border-[#20140c]/10 bg-white p-5 shadow-[0_20px_60px_rgba(89,51,18,.10)] sm:p-7"
                style={{ animationDelay: "100ms" }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in srgb, var(--c-accent) 18%, transparent), transparent 70%)",
                  }}
                />
                <h3 className={`${titleFontClassName} mb-4 text-[20px] font-bold text-[#20140c] sm:mb-5 sm:text-[22px]`}>
                  Murojaat qoldiring
                </h3>
                <DemoContactForm />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------- FOOTER ------------------------- */}
      {blk.footer && (
        <footer
          className="relative overflow-hidden py-12"
          style={{
            backgroundColor: "var(--c-footer-bg)",
            color: "var(--c-footer-fg)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--c-p-solid) 28%, transparent), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-10 h-52 w-52 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--c-accent) 20%, transparent), transparent 70%)",
            }}
          />
          <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-6 px-[min(18px,4vw)] text-center">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-base font-black"
                style={{
                  background:
                    "linear-gradient(135deg, var(--c-p-from), var(--c-p-to))",
                  color: "var(--c-bg)",
                  boxShadow: "0 10px 24px var(--c-p-glow)",
                }}
              >
                {(content.brandName || "C").trim().charAt(0).toUpperCase()}
              </span>
              <span className={`${titleFontClassName} text-lg font-black tracking-tight`}>
                {content.brandName}
              </span>
            </div>

            {blk.contact && (
              <div
                className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold"
                style={{ color: "var(--c-footer-fg-2)" }}
              >
                {content.phoneDisplay && (
                  <a
                    href={`tel:${content.phoneTel || content.phoneDisplay}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <IconPhone className="h-3.5 w-3.5" />
                    {content.phoneDisplay}
                  </a>
                )}
                {content.telegramDisplay && (
                  <a
                    href={telegramHref(content.telegramDisplay)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <IconTelegram className="h-3.5 w-3.5" />
                    {content.telegramDisplay}
                  </a>
                )}
              </div>
            )}

            <PreviewEditWrap
              editId="footerCopyrightSuffix"
              onRequestEdit={onRequestEdit}
              className="inline-block"
            >
              <span
                className="text-[12px]"
                style={{ color: "var(--c-footer-fg-2)" }}
              >
                © {new Date().getFullYear()} {content.footerCopyrightSuffix}
              </span>
            </PreviewEditWrap>
          </div>
        </footer>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aloqa qatori                                                         */
/* ------------------------------------------------------------------ */

function ContactRow(props: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const { label, icon, children } = props;
  return (
    <div className="flex items-start gap-3 rounded-xl px-1.5 py-1 transition-colors hover:bg-[var(--c-p-tint)]">
      <span
        className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--c-p-from) 18%, transparent), color-mix(in srgb, var(--c-p-to) 18%, transparent))",
          color: "var(--c-p-strong)",
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--c-p-strong)]">
          {label}
        </div>
        <div className="mt-0.5 text-[15px] leading-snug">{children}</div>
      </div>
    </div>
  );
}
