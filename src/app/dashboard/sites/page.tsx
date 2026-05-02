import { Topbar } from "@/components/dashboard/topbar";
import { TopbarWalletActions } from "@/components/dashboard/topbar-wallet";
import { SitesList } from "@/components/dashboard/sites-list";

export default function SitesPage() {
  return (
    <>
      <Topbar
        breadcrumb="Saytlarim"
        title="Saytlarim"
        actions={<TopbarWalletActions />}
      />
      <SitesList />
    </>
  );
}
