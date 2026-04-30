import { DashboardGate } from "@/components/auth/dashboard-gate";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGate>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </DashboardGate>
  );
}
