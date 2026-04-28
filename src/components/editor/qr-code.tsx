"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/cn";

export function SiteQRCode({
  url,
  filename = "qr-code",
  size = 220,
  className,
}: {
  url: string;
  filename?: string;
  size?: number;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 10,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((d) => {
        if (!cancelled) setDataUrl(d);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-[color:var(--border)] bg-white p-4",
        className,
      )}
    >
      <div
        className="flex items-center justify-center overflow-hidden rounded-md border border-[color:var(--border)] bg-white"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR kod" width={size} height={size} />
        ) : (
          <span className="text-xs text-neutral-500">Yaratilmoqda...</span>
        )}
      </div>
      <p className="text-[11px] font-mono text-neutral-500">{url}</p>
      <button
        type="button"
        onClick={handleDownload}
        disabled={!dataUrl}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M7 2V9M3.5 6L7 9.5L10.5 6M2.5 11.5H11.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        PNG yuklash
      </button>
    </div>
  );
}

export async function downloadSiteQRCode(url: string, filename: string) {
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 12,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
