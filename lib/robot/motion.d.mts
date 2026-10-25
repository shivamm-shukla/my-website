export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export const COMPANION_DOCK_BREAKPOINT: number;
export function companionHome(options: { width: number; height: number; size: Size; slot?: { left: number; top: number; width: number; height: number }; safeBottom?: number }): Point;
export function nextRoamPosition(options: { home: Point; current?: Point; random?: () => number }): Point;
export function motionAllowed(): boolean;
export function attachEyes(svg: SVGSVGElement): () => void;
export function attachRoaming(launcher: HTMLButtonElement, options?: { isOpen?: () => boolean }): () => void;
