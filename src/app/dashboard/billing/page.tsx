import { Topbar } from "@/components/dashboard/topbar";
import { ClickTopUpPanel } from "@/components/dashboard/click-top-up";

const publicSiteBase = () =>
  (process.env.NEXT_PUBLIC_APP_URL ?? "https://weblinker.uz").replace(/\/$/, "");

export default function BillingPage() {
  const site = publicSiteBase();
  return (
    <>
      <Topbar breadcrumb="To'lov va obuna" title="To'lov va obuna" />
      <div className="mx-auto max-w-2xl px-5 py-8 lg:px-10">
        <ClickTopUpPanel />
        <p className="mt-6 text-xs text-neutral-500">
          CLICK merchant kabinetida (o&apos;tkazmalar) quyidagi URL larni ko&apos;rsating
          (asosiy domen, alohida API domeni shart emas):
        </p>
        <ul className="mt-2 list-inside list-disc text-xs text-neutral-500">
          <li>
            <span className="font-medium text-neutral-700">Prepare:</span>{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {site}/api/payments/click/prepare
            </code>
          </li>
          <li>
            <span className="font-medium text-neutral-700">Complete:</span>{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {site}/api/payments/click/complete
            </code>
          </li>
        </ul>
        <p className="mt-2 text-xs text-neutral-500">
          Lokal / tunnel: <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">NEXT_PUBLIC_APP_URL</code>{" "}
          orqali yoki to&apos;g&apos;ridan-to&apos;g&apos;ri{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
            http://127.0.0.1:8001/api/payments/click/prepare
          </code>{" "}
          (Next rewrites yoki to&apos;g&apos;ri API).
        </p>
      </div>
    </>
  );
}
