import { Topbar } from "@/components/dashboard/topbar";
import { ClickTopUpPanel } from "@/components/dashboard/click-top-up";

export default function BillingPage() {
  return (
    <>
      <Topbar breadcrumb="To'lov va obuna" title="To'lov va obuna" />
      <div className="mx-auto max-w-2xl px-5 py-8 lg:px-10">
        <ClickTopUpPanel />
      </div>
    </>
  );
}
