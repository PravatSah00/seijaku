import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { env } from "../config.js";

type StoredUpload = {
  url: string;
  width?: number;
  height?: number;
};

function sanitizeFileName(name: string) {
  const baseName = name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return baseName || "asset";
}

function resolveFileName(originalName: string) {
  const extension = path.extname(originalName) || ".bin";
  const stem = sanitizeFileName(path.basename(originalName, extension));
  return `${stem}-${crypto.randomUUID()}${extension.toLowerCase()}`;
}

async function storeLocally(fileName: string, buffer: Buffer): Promise<StoredUpload> {
  const uploadDir = path.resolve(process.cwd(), env.LOCAL_UPLOAD_DIR);
  const targetPath = path.join(uploadDir, fileName);
  console.log(`[storage] Storing file locally. Target path: ${targetPath}`);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(targetPath, buffer);
  } catch (err: any) {
    console.error(`[storage] Failed to write file to local disk at ${targetPath}:`, err.message);
    throw err;
  }

  return {
    url: `/uploads/${fileName}`,
  } satisfies StoredUpload;
}

export async function storeUpload(args: {
  buffer: Buffer;
  contentType?: string;
  originalName: string;
}): Promise<StoredUpload> {
  const fileName = resolveFileName(args.originalName);
  return storeLocally(fileName, args.buffer);
}
