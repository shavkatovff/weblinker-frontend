import { Topbar } from "@/components/dashboard/topbar";
import { CreateSiteForm } from "@/components/dashboard/create-site-form";

export default function NewSitePage() {
  return (
    <>
      <Topbar breadcrumb="Saytlarim › Yangi" title="Yangi sayt yaratish" />
      <CreateSiteForm />
    </>
  );
}
