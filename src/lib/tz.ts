/** Vaqt zonasi (ixtiyor: `.env` da `NEXT_PUBLIC_TZ`, yo‘q bo‘lsa Asia/Tashkent) */
export const APP_TIMEZONE = process.env.NEXT_PUBLIC_TZ ?? "Asia/Tashkent";

/** Brauzerda Tashkent vaqtini ko‘rsatish */
export function formatTashkent(
  input: Date | string | number = new Date(),
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = input instanceof Date ? input : new Date(input);
  return d.toLocaleString("uz-UZ", {
    timeZone: APP_TIMEZONE,
    ...options,
  });
}
