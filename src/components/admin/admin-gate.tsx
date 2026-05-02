"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState<"loading" | "ok" | "no">("loading");

  useEffect(() => {
    let c = true;
    void (async () => {
      try {
        const r = await api<{ isAdmin?: boolean }>("/auth/me");
        if (!c) return;
        if (r.isAdmin) setReady("ok");
        else {
          setReady("no");
          router.replace("/dashboard");
        }
      } catch (e) {
        if (!c) return;
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/login?from=/admin");
        } else {
          router.replace("/dashboard");
        }
        setReady("no");
      }
    })();
    return () => {
      c = false;
    };
  }, [router]);

  if (ready === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
        Yuklanmoqda…
      </div>
    );
  }
  if (ready === "no") return null;
  return <>{children}</>;
}
