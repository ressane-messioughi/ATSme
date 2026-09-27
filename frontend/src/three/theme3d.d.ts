export type Room3D = {
  bg: string;
  ui: Record<string, string>;
  [key: string]: unknown;
};

export const ROOM3D: Record<string, Room3D>;
export const THEMES3D: Record<string, Record<string, string>>;
export function themeName(): string;
export function paintScene(scene: unknown, P: unknown): void;
export function catLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, P: unknown): void;
export const LOGO_PARTS: unknown[];
