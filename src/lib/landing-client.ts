import { api } from "./api";

/** Landing paketi narxini balansdan yechib olish (6 yoki 12 oy) */
export async function chargeLandingCreatePackage(
  months: 6 | 12,
): Promise<{ ok: true }> {
  return api<{ ok: true }>("/landings/charge-create-package", {
    method: "POST",
    body: JSON.stringify({ months }),
  });
}

/** AI bilan landing boshlang‘ich paketi — balansdan bir martalik yechim */
export async function chargeLandingAiStarter(): Promise<{ ok: true }> {
  return api<{ ok: true }>("/landings/charge-ai-starter", {
    method: "POST",
  });
}
