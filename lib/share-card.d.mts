export type ShareFormat = "story" | "post" | "link";
export type ShareTemplate = "aurora" | "sunrise" | "ocean" | "paper";
export type ShareItem = { kind?: "blog" | "project" | "post"; title: string; description?: string; category?: string; meta?: string; cta?: string; path?: string; site?: string; author?: string };
export declare const SHARE_FORMATS: Record<ShareFormat, { width: number; height: number; name: string }>;
export declare const SHARE_TEMPLATES: Record<ShareTemplate, { name: string; bg: string[]; blobs: string[]; ink: string; muted: string; glass: string; line: string; button: string; buttonInk: string }>;
export declare function wrapText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number): string[];
export declare function fitTitle(ctx: CanvasRenderingContext2D, value: string, maxWidth: number, maxLines: number, startSize: number, minSize: number, weight?: number): { size: number; lines: string[]; lineHeight: number };
export declare function drawShareCard(ctx: CanvasRenderingContext2D, item: ShareItem, format?: ShareFormat, template?: ShareTemplate): { width: number; height: number };
