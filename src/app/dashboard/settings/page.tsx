import { Topbar } from "@/components/dashboard/topbar";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function SettingsPage() {
  return (
    <>
      <Topbar breadcrumb="Sozlamalar" title="Sozlamalar" />
      <ComingSoon
        title="Hisob sozlamalari"
        description="Shaxsiy ma'lumotlar, xavfsizlik va bildirishnomalar. Auth tizimi ulangandan keyin faollashadi."
      />
    </>
  );
}
