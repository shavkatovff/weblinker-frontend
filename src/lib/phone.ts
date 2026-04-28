/** 9 xonali mahalliy: 90XXXXXXX */
export function nineToE164(nine: string): string {
  const d = nine.replace(/\D/g, "");
  if (d.length !== 9) throw new Error("9 ta raqam kerak");
  return `+998${d}`;
}

export function e164ToDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  const p = d.length === 12 && d.startsWith("998") ? d.slice(3) : d;
  if (p.length !== 9) return phone;
  return `+998 ${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 7)} ${p.slice(7, 9)}`;
}
