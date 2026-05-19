/** Kalendar bo‘yicha qolgan kunlar (00:00 oralig‘ida) */
export function calendarDaysUntilExpiry(iso: string): number | null {
  try {
    const end = new Date(iso);
    if (Number.isNaN(end.getTime())) return null;
    const now = new Date();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((endDay.getTime() - today.getTime()) / 86400000);
  } catch {
    return null;
  }
}

export function expiryParts(iso: string | null | undefined): {
  dateLine: string;
  daysLine: string;
  daysClass: string;
} {
  if (!iso?.trim()) {
    return {
      dateLine: "—",
      daysLine: "Tugash sanasi yo‘q",
      daysClass: "text-zinc-400",
    };
  }
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) {
    return {
      dateLine: "—",
      daysLine: "Noto‘g‘ri sana",
      daysClass: "text-amber-700",
    };
  }
  const dateLine = end.toLocaleString("uz-UZ", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const left = calendarDaysUntilExpiry(iso);
  if (left === null) {
    return { dateLine, daysLine: "", daysClass: "text-zinc-500" };
  }
  if (left > 0) {
    return {
      dateLine,
      daysLine: `${left} kun qoldi`,
      daysClass: left <= 7 ? "text-amber-700" : "text-teal-700",
    };
  }
  if (left === 0) {
    return {
      dateLine,
      daysLine: "Bugun tugaydi",
      daysClass: "text-amber-800",
    };
  }
  return {
    dateLine,
    daysLine: `Tugagan (${Math.abs(left)} kun oldin)`,
    daysClass: "text-red-700",
  };
}

export function formatTodayUz(): string {
  return new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function planLabel(plan: string): string {
  if (plan === "10kun") return "Sinov (10 kun)";
  if (plan === "6oy") return "6 oy";
  if (plan === "12oy") return "12 oy";
  return plan || "—";
}
