import { cn } from "@/lib/cn";

const IPHONE_15_PRO_WIDTH = 393;
const IPHONE_15_PRO_HEIGHT = 852;

export function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto inline-block", className)}>
      <div
        className="relative rounded-[54px] bg-black p-[10px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]"
      >
        <div
          className="relative overflow-hidden rounded-[46px] bg-white"
          style={{ width: IPHONE_15_PRO_WIDTH, height: IPHONE_15_PRO_HEIGHT }}
        >
          <div
            aria-hidden
            className="absolute left-1/2 top-3 z-20 h-[32px] w-[118px] -translate-x-1/2 rounded-full bg-black"
          />
          {children}
        </div>
      </div>
    </div>
  );
}

export const PHONE_WIDTH = IPHONE_15_PRO_WIDTH;
export const PHONE_HEIGHT = IPHONE_15_PRO_HEIGHT;
