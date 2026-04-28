import { SiteImage } from "@/lib/store/types";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function fileToSiteImage(file: File): Promise<SiteImage> {
  const dataUrl = await readAsDataUrl(file);
  return {
    dataUrl,
    sizeBytes: file.size,
    name: file.name,
  };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}
