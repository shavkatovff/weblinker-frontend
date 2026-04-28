import Link from "next/link";

export function NotFoundPublic({ slug }: { slug: string }) {
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
          <span className="font-mono">weblinker.uz/{slug}</span> manzilida
          hozircha hech qanday sayt yo&apos;q. Balki biznes egasi saytini keyinroq
          ishga tushiradi.
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
