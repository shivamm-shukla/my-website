import { existsSync } from "node:fs";
import path from "node:path";

/** Only called with our own asset names from server components. */
export function publicImage(name: string): string | undefined {
  for (const extension of ["webp", "png", "avif", "jpg"]) {
    const file = name + "." + extension;
    if (existsSync(path.join(process.cwd(), "public/images", file))) return "/images/" + file;
  }
  return undefined;
}
