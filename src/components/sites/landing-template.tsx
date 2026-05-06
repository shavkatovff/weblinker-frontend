import { LandingContent } from "@/lib/store/types";
import type { TemplateId } from "@/lib/store/types";
import { monoGradient } from "@/lib/theme/gradients";
import { SocialRow } from "./social-icons";
import { FeatureIcon } from "./feature-icons";
import { SimpleLandingTemplate } from "./simple-landing-template";

type Props = {
  content: LandingContent;
  templateId: TemplateId;
  slug: string;
};

export function LandingTemplate({ content, templateId, slug }: Props) {
  if (templateId === "simple") {
    return <SimpleLandingTemplate content={content} slug={slug} />;
  }
  return (
    <div className="flex min-h-full w-full flex-col bg-white">
      <Nav content={content} />
      <Hero content={content} />
      {content.stats.length ? <Stats content={content} /> : null}
      {content.features.length ? <Features content={content} /> : null}
      <About content={content} />
      <Services content={content} />
      {content.gallery.length ? <Gallery content={content} /> : null}
      {content.testimonials.length ? <Testimonials content={content} /> : null}
      <Contact content={content} />
      <Footer content={content} />
    </div>
  );
}

function Nav({ content }: { content: LandingContent }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-[12px] font-semibold text-white"
          >
            {content.accentInitials || "WL"}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-black">
              {content.businessName}
            </p>
            {content.category ? (
              <p className="text-[11px] text-neutral-500">{content.category}</p>
            ) : null}
          </div>
        </div>
        <nav
          className="hidden items-center gap-7 text-sm text-neutral-700 md:flex"
          aria-label="Sayt navigatsiyasi"
        >
          <a href="#why" className="hover:text-black">Nima uchun biz</a>
          <a href="#services" className="hover:text-black">Xizmatlar</a>
          <a href="#gallery" className="hover:text-black">Portfolio</a>
          <a href="#contact" className="hover:text-black">Aloqa</a>
        </nav>
        {content.phone ? (
          <a
            href={`tel:${content.phone.replace(/\s/g, "")}`}
            className="hidden h-10 items-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800 sm:inline-flex"
          >
            <span aria-hidden>☎</span>
            <span className="font-mono">{content.phone}</span>
          </a>
        ) : null}
      </div>
    </header>
  );
}

function Hero({ content }: { content: LandingContent }) {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--border)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.07),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full"
        style={{ backgroundImage: monoGradient(content.businessName, 2), opacity: 0.06 }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {content.heroEyebrow ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
              <span className="h-1.5 w-1.5 rounded-full bg-black" aria-hidden />
              {content.heroEyebrow}
            </p>
          ) : null}
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-black sm:text-5xl md:text-6xl lg:text-7xl">
            {content.heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-neutral-600 sm:text-xl">
            {content.heroSubtitle}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-2 sm:flex-row">
            {content.phone ? (
              <a
                href={`tel:${content.phone.replace(/\s/g, "")}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 sm:h-13"
              >
                Qo&apos;ng&apos;iroq qilish
              </a>
            ) : null}
            <a
              href="#services"
              className="inline-flex h-12 items-center justify-center rounded-md border border-black px-6 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white sm:h-13"
            >
              Xizmatlarni ko&apos;rish
            </a>
          </div>

          {content.stats.length ? (
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-neutral-600">
              {content.stats.slice(0, 4).map((s, i) => (
                <span key={s.id} className="inline-flex items-center gap-2">
                  <span className="font-semibold text-black">{s.value}</span>
                  <span>{s.label}</span>
                  {i < content.stats.slice(0, 4).length - 1 ? (
                    <span aria-hidden className="hidden text-neutral-300 sm:inline">·</span>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Stats({ content }: { content: LandingContent }) {
  return (
    <section className="border-b border-[color:var(--border)] bg-neutral-50">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {content.stats.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-[color:var(--border)] bg-white p-5 text-center sm:text-left"
            >
              <div className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500 sm:text-sm sm:normal-case sm:tracking-normal sm:text-neutral-600">
                {s.label}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Features({ content }: { content: LandingContent }) {
  return (
    <section id="why" className="border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Nima uchun biz
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl md:text-5xl">
            Mijozlar nima uchun bizni tanlaydi
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {content.features.map((f) => (
            <li
              key={f.id}
              className="group rounded-2xl border border-[color:var(--border)] bg-white p-6 transition-colors hover:border-black"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border)] text-black transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">
                <FeatureIcon kind={f.icon} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-black">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {f.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function About({ content }: { content: LandingContent }) {
  if (!content.about && !content.description) return null;
  return (
    <section id="about" className="border-b border-[color:var(--border)] bg-neutral-50">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Biz haqimizda
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              {content.businessName}
            </h2>
            {content.hours ? (
              <div className="mt-8 rounded-xl border border-[color:var(--border)] bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Ish vaqti
                </p>
                <p className="mt-2 whitespace-pre-line text-sm text-black">
                  {content.hours}
                </p>
              </div>
            ) : null}
          </div>
          <div className="space-y-4 text-base leading-relaxed text-neutral-700">
            {content.description ? <p>{content.description}</p> : null}
            {content.about ? <p>{content.about}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services({ content }: { content: LandingContent }) {
  if (!content.services.length) return null;
  return (
    <section id="services" className="border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Xizmatlar
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl md:text-5xl">
              Xizmatlar va narxlar
            </h2>
          </div>
          <p className="max-w-sm text-sm text-neutral-600">
            Narxlar ko&apos;rsatkich uchun. Aniqroq hisob-kitob uchun bog&apos;laning.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {content.services.map((service, idx) => (
            <li
              key={service.id}
              className="flex gap-4 rounded-2xl border border-[color:var(--border)] bg-white p-5 transition-colors hover:border-black"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-900 font-mono text-xs font-semibold text-white"
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-black">
                    {service.name}
                  </h3>
                  <span className="flex-shrink-0 whitespace-nowrap font-mono text-sm font-semibold text-black">
                    {service.price}
                  </span>
                </div>
                {service.description ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                    {service.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Gallery({ content }: { content: LandingContent }) {
  return (
    <section id="gallery" className="border-b border-[color:var(--border)] bg-neutral-50">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Portfolio
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl md:text-5xl">
              Bizning ishlarimiz
            </h2>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {content.gallery.map((item, idx) => (
            <li
              key={item.id}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-[color:var(--border)]"
              style={{ backgroundImage: monoGradient(content.businessName, idx + 1) }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.14]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <div className="text-white">
                  {item.emoji ? (
                    <div className="mb-2 text-3xl">{item.emoji}</div>
                  ) : (
                    <div className="mb-2 font-mono text-[10px] font-semibold tracking-[0.15em] text-white/70">
                      {String(idx + 1).padStart(2, "0")} / {String(content.gallery.length).padStart(2, "0")}
                    </div>
                  )}
                  <div className="text-sm font-semibold leading-tight">
                    {item.caption || `Namuna ${idx + 1}`}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Testimonials({ content }: { content: LandingContent }) {
  return (
    <section className="border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Mijozlarning fikri
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl md:text-5xl">
            Haqiqiy odamlar, haqiqiy taassurotlar
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {content.testimonials.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-5 rounded-2xl border border-[color:var(--border)] bg-white p-6"
            >
              <StarRow rating={t.rating} />
              <p className="text-[15px] leading-relaxed text-black">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-auto flex items-center gap-3 border-t border-[color:var(--border)] pt-4">
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-black"
                >
                  {t.author
                    .trim()
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-black">{t.author}</p>
                  {t.role ? (
                    <p className="text-xs text-neutral-500">{t.role}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StarRow({ rating }: { rating: number }) {
  const stars = Math.round(Math.max(1, Math.min(5, rating)));
  return (
    <div className="flex gap-1 text-black">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill={i < stars ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M7 1.5L8.8 5.2L12.7 5.7L9.9 8.5L10.7 12.3L7 10.4L3.3 12.3L4.1 8.5L1.3 5.7L5.2 5.2L7 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

function Contact({ content }: { content: LandingContent }) {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-b border-[color:var(--border)] bg-black text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Aloqa
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {content.ctaTitle}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-300">
              {content.ctaSubtitle}
            </p>

            <ul className="mt-8 space-y-3">
              {content.phone ? (
                <ContactLine
                  href={`tel:${content.phone.replace(/\s/g, "")}`}
                  label="Telefon"
                  value={content.phone}
                />
              ) : null}
              {content.address ? (
                <ContactLine
                  href={
                    content.mapsUrl ||
                    `https://www.google.com/maps/search/${encodeURIComponent(content.address)}`
                  }
                  label="Manzil"
                  value={content.address}
                  external
                />
              ) : null}
              {content.hoursLine ? (
                <ContactLine label="Ish vaqti" value={content.hoursLine} />
              ) : null}
            </ul>

            <div className="mt-8">
              <SocialRow social={content.social} variant="dark" />
            </div>
          </div>

          <ContactForm businessName={content.businessName} />
        </div>
      </div>
    </section>
  );
}

function ContactLine({
  href,
  label,
  value,
  external,
}: {
  href?: string;
  label: string;
  value: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
        {label}
      </span>
      <span className="block text-base font-medium text-white">{value}</span>
    </>
  );
  if (href) {
    return (
      <li>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="block rounded-xl border border-white/15 bg-white/[0.03] p-4 transition-colors hover:border-white/40 hover:bg-white/[0.06]"
        >
          {inner}
        </a>
      </li>
    );
  }
  return <li className="rounded-xl border border-white/10 p-4">{inner}</li>;
}

function ContactForm({ businessName }: { businessName: string }) {
  return (
    <form
      className="flex flex-col gap-3 rounded-2xl bg-white p-6 text-black sm:p-7"
      onSubmit={(e) => {
        e.preventDefault();
        alert(
          `Xabaringiz qabul qilindi!\nTelegram botga yuboriladi (MVP rejimda demo).\n— ${businessName}`,
        );
      }}
    >
      <div>
        <p className="text-sm font-semibold text-black">Bizga yozing</p>
        <p className="mt-1 text-xs text-neutral-500">
          Tez orada Telegram orqali javob beramiz
        </p>
      </div>
      <input
        type="text"
        placeholder="Ismingiz"
        required
        className="h-11 rounded-md border border-[color:var(--border)] px-3 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
      />
      <input
        type="tel"
        placeholder="+998 90 123 45 67"
        required
        className="h-11 rounded-md border border-[color:var(--border)] px-3 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
      />
      <textarea
        placeholder="Qisqacha izoh (ixtiyoriy)"
        rows={3}
        className="rounded-md border border-[color:var(--border)] px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
      />
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-md bg-black text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Yuborish
      </button>
      <p className="mt-1 text-center text-[11px] text-neutral-500">
        Telegram botga bildirishnoma yuboriladi
      </p>
    </form>
  );
}

function Footer({ content }: { content: LandingContent }) {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-7 sm:flex-row">
        <p className="text-xs text-neutral-500">
          © {new Date().getFullYear()} {content.businessName}
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          weblinker.uz orqali yaratilgan
        </p>
      </div>
    </footer>
  );
}
