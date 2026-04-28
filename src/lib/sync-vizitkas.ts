import { api } from "./api";
import { normalizeSite } from "./store/normalize";
import { saveSite } from "./store/store";
import type { UnknownSite } from "./store/types";

/** JWT dagi foydalanuvchining bazadagi vizitkalarini localStorage bilan sinxronlaydi */
export async function syncVizitkasFromServer(): Promise<void> {
  const r = await api<{ items: unknown[] }>("/vizitka/mine");
  for (const raw of r.items ?? []) {
    if (!raw || typeof raw !== "object") continue;
    const site = normalizeSite(raw as UnknownSite);
    if (site.type === "vizitka") {
      saveSite(site);
    }
  }
}
