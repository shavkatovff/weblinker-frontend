"use client";

import { useCallback, useEffect, useState } from "react";
import { listSites, subscribe, getSiteById, getSiteBySlug } from "./store";
import { UnknownSite } from "./types";

export function useSites(): { sites: UnknownSite[]; ready: boolean } {
  const [sites, setSites] = useState<UnknownSite[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => setSites(listSites());
    refresh();
    setReady(true);
    const unsub = subscribe(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("weblinker.")) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { sites, ready };
}

export function useSiteById(id: string | undefined): {
  site: UnknownSite | undefined;
  ready: boolean;
  reload: () => void;
} {
  const [site, setSite] = useState<UnknownSite | undefined>(undefined);
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => {
    if (!id) {
      setSite(undefined);
      return;
    }
    setSite(getSiteById(id));
  }, [id]);

  useEffect(() => {
    reload();
    setReady(true);
    const unsub = subscribe(reload);
    return unsub;
  }, [reload]);

  return { site, ready, reload };
}

export function useSiteBySlug(slug: string | undefined): {
  site: UnknownSite | undefined;
  ready: boolean;
} {
  const [site, setSite] = useState<UnknownSite | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setSite(getSiteBySlug(slug));
    setReady(true);
    const unsub = subscribe(() => setSite(getSiteBySlug(slug)));
    return unsub;
  }, [slug]);

  return { site, ready };
}
