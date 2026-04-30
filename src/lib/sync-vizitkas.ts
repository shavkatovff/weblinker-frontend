import { api } from "./api";
import { normalizeSite } from "./store/normalize";
import { replaceVizitkasFromServer } from "./store/store";
import type { UnknownSite } from "./store/types";

/** JWT dagi foydalanuvchining bazadagi vizitkalarini localStorage bilan sinxronlaydi */
export async function syncVizitkasFromServer(): Promise<void> {
  const r = await api<{ items: unknown[] }>("/vizitka/mine");
  const vizitkas: UnknownSite[] = [];
  for (const raw of r.items ?? []) {
    if (!raw || typeof raw !== "object") continue;
    const site = normalizeSite(raw as UnknownSite);
    if (site.type === "vizitka") {
      vizitkas.push(site);
    }
  }
  replaceVizitkasFromServer(vizitkas);
}
