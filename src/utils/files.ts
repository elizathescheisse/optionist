import type { DesignOption } from "../types/domain";

export const ALLOWED_MIME_TYPES: DesignOption["imageMimeType"][] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function isAllowedMimeType(
  type: string
): type is DesignOption["imageMimeType"] {
  return (ALLOWED_MIME_TYPES as string[]).includes(type);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export type FileValidationError =
  | "invalid-type"
  | "too-large"
  | "empty";

export function validateImageFile(file: File): FileValidationError | null {
  if (file.size === 0) return "empty";
  if (!isAllowedMimeType(file.type)) return "invalid-type";
  if (file.size > MAX_FILE_SIZE_BYTES) return "too-large";
  return null;
}
