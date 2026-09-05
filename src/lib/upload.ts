import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { del, put } from "@vercel/blob";
import { UPLOAD_DIR } from "./upload-config";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Enregistre une image envoyée via un formulaire.
 * - Si BLOB_READ_WRITE_TOKEN est défini (Vercel Blob) : stockage objet, URL publique.
 * - Sinon : disque local dans UPLOAD_DIR, servi par /uploads/[name] (développement).
 */
export async function saveImage(file: File | null | undefined): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (max 5 Mo).");
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error("Format d'image non pris en charge (JPG, PNG, WEBP, GIF).");
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`pieces/${name}`, bytes, { access: "public", contentType: file.type, addRandomSuffix: false });
    return blob.url;
  }
  if (process.env.VERCEL) {
    throw new Error("Stockage des images non configuré : ajoutez un Blob Store Vercel (BLOB_READ_WRITE_TOKEN).");
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
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

/** Supprime des images (best-effort). Sur Vercel Blob, supprime les objets ; en local, ignore. */
export async function deleteImages(urls: string[]) {
  if (urls.length === 0) return;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blobUrls = urls.filter((u) => u.startsWith("http"));
    if (blobUrls.length) {
      try {
        await del(blobUrls);
      } catch {
        /* nettoyage non bloquant */
      }
    }
  }
}
