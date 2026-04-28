import Link from "next/link";
import { cn } from "@/lib/cn";

export type LogoVariantKey = "v1" | "v2" | "v3";

type LogoProps = {
  className?: string;
  variant?: "default" | "inverse";
  mark?: LogoVariantKey;
};

export function Logo({ className, variant = "default", mark = "v2" }: LogoProps) {
  const inverse = variant === "inverse";
  return (
    <Link
      href="/"
      aria-label="Weblinker bosh sahifa"
      className={cn(
        "inline-flex items-center gap-2.5 text-[16px] font-semibold tracking-tight",
        inverse ? "text-white" : "text-black",
        className,
      )}
    >
      <LogoMark variant={mark} inverse={inverse} size={24} />
      <span>Weblinker</span>
    </Link>
  );
}

export function LogoMark({
  variant = "v1",
  inverse = false,
  size = 24,
}: {
  variant?: LogoVariantKey;
  inverse?: boolean;
  size?: number;
}) {
  const viewBox = 24;
  const insetMap: Record<LogoVariantKey, number> = {
    v1: 4,
    v2: 5,
    v3: 6,
  };
  const inset = insetMap[variant];
  const outerRx = 5;
  const innerRx = Math.max(0.5, outerRx - inset * 0.7);

  const outerFill = inverse ? "#ffffff" : "#000000";
  const innerFill = inverse ? "#000000" : "#ffffff";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="0"
        y="0"
        width={viewBox}
        height={viewBox}
        rx={outerRx}
        fill={outerFill}
      />
      <rect
        x={inset}
        y={inset}
        width={viewBox - inset * 2}
        height={viewBox - inset * 2}
        rx={innerRx}
        fill={innerFill}
      />
    </svg>
  );
}
