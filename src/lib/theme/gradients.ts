function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function monoGradient(seed: string, index = 0): string {
  const h = hashStr(seed + ":" + index);
  const lightDark = 6 + (h % 14);
  const dark = 18 + ((h >> 3) % 18);
  const mid = 36 + ((h >> 6) % 18);
  const angle = 120 + ((h >> 9) % 80);
  return `linear-gradient(${angle}deg, hsl(0 0% ${lightDark}%), hsl(0 0% ${dark}%) 40%, hsl(0 0% ${mid}%))`;
}

export function noiseOverlay(): string {
  return "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)";
}

export function paperBackground(seed: string): string {
  const h = hashStr(seed);
  const tone = 96 + (h % 4);
  return `hsl(0 0% ${tone}%)`;
}
