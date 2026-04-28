import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Overview } from "@/components/dashboard/overview";

export default function DashboardPage() {
  return (
    <>
      <Topbar
        breadcrumb="Dashboard"
        title="Bosh sahifa"
        actions={
          <Button href="/dashboard/sites/new" size="sm">
            Yangi sayt
          </Button>
        }
      />
      <Overview />
    </>
  );
}
