import { useId } from "react";
import { PatternId } from "@/lib/store/types";
import { cn } from "@/lib/cn";

type Props = {
  pattern: PatternId;
  color: string;
  className?: string;
};

export function PatternLayer({ pattern, color, className }: Props) {
  const autoId = useId();
  if (pattern === "none") return null;
  const patternId = `wl-pattern-${autoId.replace(/:/g, "")}`;

  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>{renderDef(pattern, patternId, color)}</defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function renderDef(kind: PatternId, id: string, color: string) {
  switch (kind) {
    case "dots":
      return (
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.4" fill={color} fillOpacity="0.22" />
        </pattern>
      );
    case "grid":
      return (
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M24 0 L0 0 0 24"
            fill="none"
            stroke={color}
            strokeOpacity="0.14"
            strokeWidth="1"
          />
        </pattern>
      );
    case "diagonal":
      return (
        <pattern
          id={id}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="7"
            y1="0"
            x2="7"
            y2="14"
            stroke={color}
            strokeOpacity="0.14"
            strokeWidth="1.2"
          />
        </pattern>
      );
    case "stripes":
      return (
        <pattern id={id} width="20" height="12" patternUnits="userSpaceOnUse">
          <line
            x1="0"
            y1="6"
            x2="20"
            y2="6"
            stroke={color}
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        </pattern>
      );
    case "checker":
      return (
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={color} fillOpacity="0.09" />
          <rect
            x="12"
            y="12"
            width="12"
            height="12"
            fill={color}
            fillOpacity="0.09"
          />
        </pattern>
      );
    case "none":
    default:
      return null;
  }
}
