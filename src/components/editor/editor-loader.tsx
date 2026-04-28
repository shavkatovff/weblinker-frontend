"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSiteById } from "@/lib/store/hooks";
import { normalizeSite } from "@/lib/store/normalize";
import { Editor } from "./editor";

export function EditorLoader({ id }: { id: string }) {
  const { site, ready } = useSiteById(id);
  const normalized = useMemo(() => (site ? normalizeSite(site) : undefined), [site]);

  if (!ready) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center text-sm text-neutral-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (!site || !normalized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="mx-auto max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-black">Sayt topilmadi</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Bunday sayt mavjud emas yoki o&apos;chirilgan. Ro&apos;yxatga qaytib,
            saytni qayta toping.
          </p>
          <div className="mt-5">
            <Link
              href="/dashboard/sites"
              className="inline-flex h-10 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white"
            >
              Saytlar ro&apos;yxati
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Editor initialSite={normalized} />;
}
