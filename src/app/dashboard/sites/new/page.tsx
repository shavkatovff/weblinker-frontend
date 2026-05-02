import { Topbar } from "@/components/dashboard/topbar";
import { TopbarWalletActions } from "@/components/dashboard/topbar-wallet";
import { CreateSiteForm } from "@/components/dashboard/create-site-form";
import { Suspense } from "react";

export default function NewSitePage() {
  return (
    <>
      <Topbar
        breadcrumb="Saytlarim › Yangi"
        title="Yangi sayt yaratish"
        actions={<TopbarWalletActions />}
      />
      <Suspense
        fallback={
          <div className="px-5 py-10 text-center text-sm text-neutral-500 lg:px-10">
            Yuklanmoqda…
          </div>
        }
      >
        <CreateSiteForm />
      </Suspense>
    </>
  );
}
