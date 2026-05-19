"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  editHref: string;
  viewHref: string;
  onExtend?: () => void;
  menu: ReactNode;
};

/** Saytlarim kartasi — mobil: 2 ustun, obuna + menyu pastki qator */
export function SiteCardActions({
  editHref,
  viewHref,
  onExtend,
  menu,
}: Props) {
  const hasExtend = onExtend != null;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          href={editHref}
          size="sm"
          className="!flex h-10 w-full min-w-0 justify-center px-2"
        >
          Tahrirlash
        </Button>
        <Link
          href={viewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-md border border-[color:var(--border)] px-2 text-sm font-medium text-black transition-colors hover:border-black"
        >
          Ko&apos;rish
        </Link>
      </div>
      <div
        className={cn(
          "grid gap-2",
          hasExtend ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1 justify-items-end",
        )}
      >
        {hasExtend ? (
          <button
            type="button"
            onClick={onExtend}
            className="inline-flex h-10 min-w-0 items-center justify-center rounded-md border border-[color:var(--border)] px-2 text-xs font-medium text-black transition-colors hover:border-black sm:text-sm"
          >
            Obunani uzaytirish
          </button>
        ) : null}
        {menu}
      </div>
    </div>
  );
}

