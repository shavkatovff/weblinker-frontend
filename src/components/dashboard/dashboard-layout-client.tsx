"use client";

import { MobileNavProvider } from "@/components/dashboard/mobile-nav-context";
import { Sidebar } from "@/components/dashboard/sidebar";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <div className="flex h-screen w-full overflow-hidden bg-neutral-50">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
