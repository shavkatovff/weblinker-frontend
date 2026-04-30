/**
 * Brauzerda API chaqiruvlari bir xil domen orqali (/auth, /vizitka, …) —
 * `api.*` subdomen DNS bo‘lmasa ham ishlaydi.
 * Server (RSC): ichki Nest — INTERNAL_API_URL yoki 127.0.0.1:8001.
 */
export function apiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return (
    process.env.INTERNAL_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8001"
  );
}
