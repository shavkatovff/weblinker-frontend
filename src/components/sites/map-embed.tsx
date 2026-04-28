import { cn } from "@/lib/cn";

type Props = {
  address: string;
  className?: string;
  height?: number;
  rounded?: string;
  label?: string;
};

export function MapEmbed({
  address,
  className,
  height = 160,
  rounded = "rounded-xl",
  label,
}: Props) {
  if (!address.trim()) return null;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=uz&z=15&output=embed`;
  return (
    <div
      className={cn(
        "overflow-hidden border border-[color:var(--border)]",
        rounded,
        className,
      )}
      style={{ height }}
    >
      <iframe
        src={src}
        title={label ?? `${address} xarita`}
        width="100%"
        height={height}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-full w-full border-0 grayscale-[30%]"
      />
    </div>
  );
}
