"use client";

import Image from "next/image";
import { useState } from "react";

export function OptionalImage({ src, className, width, height, eager = false }: {
  src?: string; className?: string; width: number; height: number; eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <Image src={src} alt="" width={width} height={height} className={className}
    sizes={eager ? "(max-width: 700px) 90vw, 44vw" : "(max-width: 600px) 90vw, 33vw"}
    loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />;
}
