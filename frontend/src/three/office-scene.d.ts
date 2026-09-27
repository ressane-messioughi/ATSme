import type * as THREE from "three";

export type Chapter = { id: string; p: number; label: string };
export const CHAPTERS: Chapter[];

export function toonGradient(THREE_: typeof THREE): THREE.Texture;
export function skyTexture(THREE_: typeof THREE): THREE.Texture;
export function addOutlines(THREE_: typeof THREE, root: THREE.Object3D, color?: string, k?: number): void;

export type CameraPose = { position: THREE.Vector3; target: THREE.Vector3; offset: number };
export type Pickable = { action: string; object: THREE.Object3D };
export type UpdateArgs = { p: number; vel: number; t: number; dt: number; camPos: THREE.Vector3; greet?: number };
export type Room3D = Record<string, unknown>;

export type Office = {
  group: THREE.Object3D;
  update: (args: UpdateArgs) => void;
  camera: (p: number) => CameraPose;
  pickables: Pickable[];
  anchors: Record<string, THREE.Vector3>;
  react: (action: string) => void;
  theme: (room: Room3D) => void;
  attachAvatar?: (...args: unknown[]) => void;
};

export function createOffice(THREE_: typeof THREE): Office;
