export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Bounds = { left: number; right: number; top: number; bottom: number };
export function overlaps(a: Bounds, b: Bounds, gap?: number): boolean;
export function sweptBounds(from: Point, to: Point, size: Size): Bounds;
export function findSafePosition(options: { width: number; height: number; size: Size; obstacles: Bounds[]; current?: Point | null; roam?: boolean; mobile?: boolean; random?: () => number; inset?: number }): Point | null;
export function motionAllowed(): boolean;
export function attachEyes(svg: SVGSVGElement): () => void;
export function attachRoaming(launcher: HTMLButtonElement, options?: { isOpen?: () => boolean }): () => void;
