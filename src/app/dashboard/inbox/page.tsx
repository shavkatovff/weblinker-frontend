import { Topbar } from "@/components/dashboard/topbar";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function InboxPage() {
  return (
    <>
      <Topbar breadcrumb="Aloqa so'rovlari" title="Aloqa so'rovlari" />
      <ComingSoon
        title="Telegram orqali so'rovlar"
        description="Mijozlaringiz aloqa formasiga yozgan har bir xabar to'g'ridan-to'g'ri Telegram botingizga tushadi. Shu yerda ro'yxat holatida ham ko'rsatamiz."
        hint="Telegram bot ulanishi keyingi bosqichda tayyor bo'ladi."
      />
    </>
  );
}
