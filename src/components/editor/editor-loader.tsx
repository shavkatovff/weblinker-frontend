"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchVizitkaById } from "@/lib/vizitka-client";
import { getSiteById, saveSite } from "@/lib/store/store";
import { normalizeSite } from "@/lib/store/normalize";
import type { UnknownSite } from "@/lib/store/types";
import { Editor } from "./editor";

export function EditorLoader({ id }: { id: string }) {
  const [site, setSite] = useState<UnknownSite | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [serverBacked, setServerBacked] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const remote = await fetchVizitkaById(id);
        if (cancel) return;
        if (remote?.site) {
          const n = normalizeSite(remote.site as UnknownSite);
          saveSite(n);
          setSite(n);
          setServerBacked(true);
          setReady(true);
          return;
        }
      } catch {
        /* tarmoq */
      }
      if (cancel) return;
      const local = getSiteById(id);
      setServerBacked(false);
      setSite(local ? normalizeSite(local) : undefined);
      setReady(true);
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  if (!ready) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center text-sm text-neutral-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (!site) {
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

  return (
    <Editor initialSite={site} serverBackedVizitka={serverBacked} />
  );
}
