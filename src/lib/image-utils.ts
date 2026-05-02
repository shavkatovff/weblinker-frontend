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

/** Hero/logo yaratishdan keyin serverga multipart yuklash uchun */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const safeName = filename.replace(/[^\w.-]/g, "_") || `image.${ext}`;
  return new File([blob], safeName.includes(".") ? safeName : `${safeName}.${ext}`, {
    type: blob.type || "image/jpeg",
  });
}
