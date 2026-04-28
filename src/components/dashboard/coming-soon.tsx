import Link from "next/link";

type Props = {
  title: string;
  description: string;
  hint?: string;
};

export function ComingSoon({ title, description, hint }: Props) {
  return (
    <div className="px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-[color:var(--border)] bg-white p-8 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Tez orada
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          {description}
        </p>
        {hint ? (
          <p className="mt-4 text-xs text-neutral-500">{hint}</p>
        ) : null}
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Bosh sahifaga
          </Link>
        </div>
      </div>
    </div>
  );
}
