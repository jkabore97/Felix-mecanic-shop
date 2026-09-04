import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { UPLOAD_DIR } from "./upload-config";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Enregistre une image envoyée via un formulaire dans UPLOAD_DIR (servi par /uploads/[name]).
 * Sur un hébergement sans disque persistant, remplacer par un stockage objet (S3, Cloudinary…).
 */
export async function saveImage(file: File | null | undefined): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (max 5 Mo).");
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error("Format d'image non pris en charge (JPG, PNG, WEBP, GIF).");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function saveImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files.slice(0, 6)) {
    const url = await saveImage(f);
    if (url) urls.push(url);
  }
  return urls;
}
