import Link from "next/link";

export function NotFoundPublic() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
          404 · weblinker.uz
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Bunday sayt topilmadi
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          <span className="font-mono">weblinker.uz/name</span> manzilida hozircha
          hech qanday sayt yo&apos;q. Bu nom ostida sizning saytingiz bo&apos;lishi
          mumkin.
        </p>
        <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Weblinker haqida
          </Link>
          <Link
            href="/dashboard/sites/new"
            className="inline-flex h-11 items-center justify-center rounded-md border border-black px-5 text-sm font-medium text-black hover:bg-black hover:text-white"
          >
            O&apos;z saytingizni yarating
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PausedSite({ businessName }: { businessName: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
          Vaqtincha to&apos;xtatilgan
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          {businessName}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          Bu sayt vaqtincha o&apos;chirilgan. Biznes egasi obunani yangilashi
          bilan qayta ishga tushadi.
        </p>
      </div>
    </div>
  );
}

/** Obuna tugaganda yoki muddati o&apos;tganda (jamoat ko&apos;rinishi) */
export function PausedSiteSubscriptionExpired({
  businessName,
  slug,
}: {
  businessName: string;
  slug: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
          Vaqtincha to&apos;xtatilgan
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          {businessName}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          <span className="font-mono text-neutral-800">weblinker.uz/{slug}</span>{" "}
          manzilidagi bu nomdagi sayt vaqtincha to&apos;xtatilgan. Davom etish uchun
          obunani yangilang yoki o&apos;z vizitkangizni yarating.
        </p>
        <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-gradient-to-b from-teal-50/60 to-white p-5 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-800">
            Weblinker
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            Online biznes vizitkasi — kontaktlar, ijtimoiy tarmoqlar, manzil bitta
            sahifada, mobilga mos.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/dashboard/sites/new"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              O&apos;z saytingizni yarating
            </Link>
            <Link
              href="/"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Bosh sahifa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}