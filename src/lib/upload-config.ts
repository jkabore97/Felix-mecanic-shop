import path from "node:path";

/** Dossier de stockage des photos (hors /public). Surcharger avec UPLOAD_DIR en production. */
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
