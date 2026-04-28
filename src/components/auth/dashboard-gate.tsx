"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { syncVizitkasFromServer } from "@/lib/sync-vizitkas";

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [ok, setOk] = useState(false);
  const [bootError, setBootError] = useState<"network" | "server" | null>(null);

  useEffect(() => {
    let c = true;
    setBootError(null);
    void (async () => {
      for (let i = 0; i < 5; i++) {
        try {
          await api("/auth/me");
          await syncVizitkasFromServer().catch(() => {
            /* tarmoq yoki vizitka yo‘q — dashboard baribir ochilsin */
          });
          if (c) setOk(true);
          return;
        } catch (e) {
          if (!c) return;
          if (e instanceof ApiError) {
            if (e.status === 401) {
              if (c) router.replace(`/login?from=${encodeURIComponent(path ?? "/dashboard")}`);
              return;
            }
            if (c) setBootError("server");
            return;
          }
          if (i < 4) await sleep(400);
          else if (c) setBootError("network");
        }
      }
    })();
    return () => {
      c = false;
    };
  }, [path, router]);

  if (bootError) {
    const msg =
      bootError === "network"
        ? "API serveriga ulanib bo‘lmadi (tarmoq yoki server hali yoqilmagan). Bir oz kutib, sahifani yangilang."
        : "Server javobi kutilmagandek. Keyinroq qayta urinib ko‘ring.";
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-5 text-center text-sm text-neutral-600">
        <p className="max-w-md">{msg}</p>
        <button
          type="button"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          onClick={() => window.location.reload()}
        >
          Sahifani yangilash
        </button>
      </div>
    );
  }

  if (!ok) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
        Yuklanmoqda…
      </div>
    );
  }

  return <>{children}</>;
}
