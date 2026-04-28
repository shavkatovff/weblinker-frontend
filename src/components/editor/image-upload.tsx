"use client";

import { useRef, useState } from "react";
import { SiteImage } from "@/lib/store/types";
import {
  MAX_IMAGE_BYTES,
  fileToSiteImage,
  formatBytes,
} from "@/lib/image-utils";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  hint?: string;
  value?: SiteImage;
  onChange: (image: SiteImage | undefined) => void;
  aspect?: "square" | "wide";
};

export function ImageUpload({
  label,
  hint,
  value,
  onChange,
  aspect = "wide",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const ratio = aspect === "square" ? "aspect-square" : "aspect-[16/9]";

  const handleFile = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllari qabul qilinadi");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Rasm hajmi ${formatBytes(MAX_IMAGE_BYTES)} dan oshmasligi kerak`);
      return;
    }
    try {
      const image = await fileToSiteImage(file);
      onChange(image);
    } catch {
      setError("Rasmni yuklashda xatolik");
    }
  };

  const onRemove = () => {
    setError(null);
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600">
        {label}
      </label>

      {value ? (
        <div className="rounded-xl border border-[color:var(--border)] bg-white p-3">
          <div className={cn("overflow-hidden rounded-lg bg-neutral-100", ratio)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.dataUrl} alt={value.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-black">{value.name}</p>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                {formatBytes(value.sizeBytes)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="h-8 rounded-md border border-[color:var(--border)] px-3 text-xs font-medium text-black transition-colors hover:border-black"
              >
                Almashtirish
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="h-8 rounded-md border border-[color:var(--border)] px-3 text-xs font-medium text-red-700 transition-colors hover:border-red-700 hover:bg-red-50"
              >
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-white p-6 text-center transition-colors",
            ratio,
            isDragging
              ? "border-black bg-neutral-50"
              : "border-[color:var(--border)] hover:border-black",
          )}
        >
          <UploadIcon />
          <span className="text-sm font-medium text-black">
            Rasmni shu yerga tashlang yoki tanlang
          </span>
          <span className="text-xs text-neutral-500">
            JPG, PNG — {formatBytes(MAX_IMAGE_BYTES)} gacha
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error ? (
        <p className="mt-1.5 text-xs text-red-700">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15V5M12 5L7 10M12 5L17 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17V19C4 20 5 21 6 21H18C19 21 20 20 20 19V17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
