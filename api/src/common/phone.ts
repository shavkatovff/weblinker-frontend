/**
 * Bitta format: +998901234567 (O‘zbekiston, 9 ta raqam 998 dan keyin)
 */
export function normalizeUzPhone(input: string): string {
  const d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("998")) {
    return `+${d}`;
  }
  if (d.length === 9) {
    return `+998${d}`;
  }
  if (d.length === 11 && d.startsWith("8")) {
    // 8 90 ... → 99890...
    return `+998${d.slice(1)}`;
  }
  if (d.length === 13 && d.startsWith("998")) {
    return `+${d}`;
  }
  throw new Error("Telefon noto'g'ri kiritilgan");
}

export function formatPhoneForDisplay(phone: string): string {
  const n = phone.replace(/\D/g, "");
  const p = n.startsWith("998") && n.length === 12 ? n.slice(3) : n.length === 9 ? n : n;
  if (p.length !== 9) return phone;
  return `+998 ${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 7)} ${p.slice(7, 9)}`;
}
