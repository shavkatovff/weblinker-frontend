import { Logo } from "@/components/marketing/logo";

type Props = {
  title: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
};

export function Topbar({ title, breadcrumb, actions }: Props) {
  return (
    <>
      <div className="flex h-14 items-center border-b border-[color:var(--border)] bg-white px-5 lg:hidden">
        <Logo />
      </div>
      <div className="flex flex-col gap-4 border-b border-[color:var(--border)] bg-white px-5 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-10">
        <div>
          {breadcrumb ? (
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
              {breadcrumb}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            {title}
          </h1>
        </div>
        {actions ? <div className="flex flex-shrink-0 gap-2">{actions}</div> : null}
      </div>
    </>
  );
}
