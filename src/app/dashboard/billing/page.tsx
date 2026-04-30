import { Topbar } from "@/components/dashboard/topbar";
import { ClickTopUpPanel } from "@/components/dashboard/click-top-up";

export default function BillingPage() {
  return (
    <>
      <Topbar breadcrumb="To'lov va obuna" title="To'lov va obuna" />
      <div className="mx-auto max-w-2xl px-5 py-8 lg:px-10">
        <ClickTopUpPanel />
        <p className="mt-6 text-xs text-neutral-500">
          CLICK merchant kabinetida (o&apos;tkazmalar) quyidagi URL larni ko&apos;rsating — API
          domeningiz bilan almashtiring, masalan{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
            https://api.weblinker.uz
          </code>
          :
        </p>
        <ul className="mt-2 list-inside list-disc text-xs text-neutral-500">
          <li>
            <span className="font-medium text-neutral-700">Prepare:</span>{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              https://api.weblinker.uz/api/payments/click/prepare
            </code>
          </li>
          <li>
            <span className="font-medium text-neutral-700">Complete:</span>{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              https://api.weblinker.uz/api/payments/click/complete
            </code>
          </li>
        </ul>
        <p className="mt-2 text-xs text-neutral-500">
          Lokalda:{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
            http://localhost:8001/api/payments/click/prepare
          </code>{" "}
          (CLICK serveridan ko&apos;rinadigan tunnel kerak).
        </p>
      </div>
    </>
  );
}
