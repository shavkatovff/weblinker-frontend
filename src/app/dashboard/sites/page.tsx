import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { SitesList } from "@/components/dashboard/sites-list";

export default function SitesPage() {
  return (
    <>
      <Topbar
        breadcrumb="Saytlarim"
        title="Saytlarim"
        actions={
          <Button href="/dashboard/sites/new" size="sm">
            Yangi sayt
          </Button>
        }
      />
      <SitesList />
    </>
  );
}
