import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

export function NotFoundPublic({ slug }: { slug?: string }) {
  const displaySlug = slug?.trim() || "name";

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-100 via-white to-teal-50/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[28px] border border-white/80 bg-white/85 p-8 text-center shadow-[0_24px_80px_-32px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-10">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
            404 · weblinker.uz
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Bunday sayt topilmadi
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            <span className="font-mono text-neutral-800">
              weblinker.uz/{displaySlug}
            </span>{" "}
            manzilida hozircha hech qanday sayt yo&apos;q. Bu nom ostida sizning
            saytingiz bo&apos;lishi mumkin.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800 sm:w-auto"
            >
              Weblinker haqida
            </Link>
            <Link
              href="/dashboard/sites/new"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-black/10 bg-neutral-50 px-5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 sm:w-auto"
            >
              O&apos;z saytingizni yarating
            </Link>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Logo className="opacity-40 transition-opacity hover:opacity-65" />
        </div>
      </div>
    </div>
  );
}
