import { MobileNavProvider } from "@/components/dashboard/mobile-nav-context";

export default function TahrirLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MobileNavProvider>
      <div className="min-h-[100dvh] bg-neutral-100 text-neutral-900">{children}</div>
    </MobileNavProvider>
  );
}
