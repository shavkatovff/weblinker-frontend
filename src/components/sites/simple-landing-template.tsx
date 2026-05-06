import { LandingContent } from "@/lib/store/types";
import { monoGradient } from "@/lib/theme/gradients";
import { LandingInquiryForm } from "./landing-inquiry-form";

type Props = {
  content: LandingContent;
  slug: string;
};

export function SimpleLandingTemplate({ content, slug }: Props) {
  const blocks = content.sectionBlocks ?? [];
  const first = blocks[0] ?? {
    id: "sb-1",
    title: "Birinchi bo‘lim",
    body: "",
  };
  const second = blocks[1] ?? {
    id: "sb-2",
    title: "Ikkinchi bo‘lim",
    body: "",
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-black text-[12px] font-semibold text-white"
            >
              {content.accentInitials || "WL"}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-black">
                {content.businessName}
              </p>
              {content.category ? (
                <p className="truncate text-[11px] text-neutral-500">{content.category}</p>
              ) : null}
            </div>
          </div>
          <nav className="hidden flex-shrink-0 items-center gap-5 text-xs font-medium text-neutral-700 sm:flex">
            <a href="#block-1" className="hover:text-black">
              {first.title || "Bo‘lim 1"}
            </a>
            <a href="#block-2" className="hover:text-black">
              {second.title || "Bo‘lim 2"}
            </a>
            <a href="#contact" className="hover:text-black">
              Aloqa
            </a>
          </nav>
        </div>
      </header>

      <section className="border-b border-[color:var(--border)] bg-neutral-50/50">
        <div
          aria-hidden
          className="pointer-events-none mx-auto max-w-3xl px-5 pt-14 pb-10"
        >
          <div
            className="h-32 rounded-2xl opacity-[0.07]"
            style={{
              backgroundImage: monoGradient(content.businessName, 2),
            }}
          />
        </div>
        <div className="mx-auto max-w-3xl px-5 pb-16 text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            {content.heroTitle || content.businessName}
          </h1>
          {content.heroSubtitle ? (
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-neutral-600">
              {content.heroSubtitle}
            </p>
          ) : null}
        </div>
      </section>

      <section
        id="block-1"
        className="mx-auto w-full max-w-3xl scroll-mt-20 px-5 py-14"
      >
        <h2 className="text-xl font-semibold text-black">{first.title}</h2>
        <div className="mt-4 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
          {first.body}
        </div>
      </section>

      <section
        id="block-2"
        className="border-t border-[color:var(--border)] bg-neutral-50/40 py-14"
      >
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-xl font-semibold text-black">{second.title}</h2>
          <div className="mt-4 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
            {second.body}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-20 border-t border-[color:var(--border)] py-16"
      >
        <div className="mx-auto max-w-lg px-5">
          <h2 className="text-center text-2xl font-semibold text-black">
            {content.contactSectionTitle ?? "Aloqa"}
          </h2>
          {content.contactSectionSubtitle ? (
            <p className="mt-2 text-center text-sm text-neutral-600">
              {content.contactSectionSubtitle}
            </p>
          ) : null}
          <div className="mt-8">
            <LandingInquiryForm slug={slug} />
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-[color:var(--border)] py-8 text-center text-xs text-neutral-500">
        <p>{content.businessName}</p>
        {content.phone ? (
          <p className="mt-1 font-mono text-neutral-700">{content.phone}</p>
        ) : null}
      </footer>
    </div>
  );
}
