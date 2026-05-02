/**
 * `multer` paketi JS-only; serverda @types/multer bo‘lmasa TS7016 chiqmasligi uchun.
 * Faqat `diskStorage` imzosidan foydalanamiz.
 */
declare module "multer" {
  import type { Request } from "express";

  interface MulterFileInfo {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
  }

  export function diskStorage(options: {
    destination?: (
      req: Request,
      file: MulterFileInfo,
      callback: (error: Error | null, destination: string) => void,
    ) => void;
    filename?: (
      req: Request,
      file: MulterFileInfo,
      callback: (error: Error | null, filename: string) => void,
    ) => void;
  }): unknown;
}
