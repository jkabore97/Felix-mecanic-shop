import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UPLOAD_DIR } from "@/lib/upload-config";

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

/** Sert les photos envoyées par les utilisateurs (stockées hors de /public pour fonctionner après le build). */
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(name)) return new NextResponse("Not found", { status: 404 });
  const file = path.join(UPLOAD_DIR, name);
  try {
    const [buf, info] = await Promise.all([readFile(file), stat(file)]);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[name.split(".").pop()!.toLowerCase()] ?? "application/octet-stream",
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
