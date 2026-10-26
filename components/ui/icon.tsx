import type { CSSProperties } from "react";

export type IconName = "arrow-up-right" | "arrow-right" | "arrow-up" | "arrow-left" | "chevron" | "sun" | "moon" | "menu" | "close" | "command" | "search" | "sparkles" | "code" | "heart" | "book" | "graduation" | "check" | "send" | "message" | "file" | "folder" | "globe" | "lock" | "mail" | "bookmark" | "share" | "volume" | "link";

const paths: Record<IconName, React.ReactNode> = {
  "arrow-up-right": <><path d="M6 18 18 6M6 6h12v12" /></>,
  "arrow-right": <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
  "arrow-up": <><path d="M12 20V4m-6 6 6-6 6 6" /></>,
  "arrow-left": <><path d="M20 12H4m6-6-6 6 6 6" /></>,
  chevron: <path d="m8 4 8 8-8 8" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  moon: <path d="M20.3 14A8.5 8.5 0 0 1 10 3.7 8.5 8.5 0 1 0 20.3 14Z" />,
  menu: <><path d="M4 8h16M4 16h16" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  command: <><path d="M8 8h8v8H8z" /><path d="M8 8H5a3 3 0 1 1 3-3v3Zm8 0V5a3 3 0 1 1 3 3h-3ZM8 16v3a3 3 0 1 1-3-3h3Zm8 0h3a3 3 0 1 1-3 3v-3Z" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  sparkles: <><path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z" /><path d="M20 2v4m-2-2h4" /></>,
  code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-5-15-4 18" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  book: <><path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" /></>,
  graduation: <><path d="m2 9 10-6 10 6-10 6L2 9Zm4 3v6c4 3 8 3 12 0v-6m4-3v8" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  send: <><path d="m22 2-7 20-4-9-9-4L22 2ZM11 13 22 2" /></>,
  message: <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h5" /></>,
  folder: <path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" />,
  globe: <><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" /><path d="M2 12h20" /></>,
  lock: <><rect x="5" y="10" width="14" height="12" rx="3" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m3 6 9 7 9-7" /></>,
  bookmark: <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z" />,
  share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 7.4 6.6 4.4"/></>,
  volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3A5 5 0 0 0 13.46 3.46l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.08 7.08l1.72-1.72"/></>,
};

export function Icon({ name, size = 20, className, style }: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>{paths[name]}</svg>;
}
