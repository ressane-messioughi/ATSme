// « Conseil du jour » : même bureau 3D que l'accueil, plan fixe rapproché sur le
// personnage qui boit son café (cycle idle), sans poussière ni chat en balade — adapté de
// design_handoff_atsme_3d/vignette.html en composant React Three Fiber.
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createOffice } from "../three/office-scene.js";
import { ROOM3D } from "../three/theme3d.js";
import type { Theme3DId } from "../lib/theme3d.ts";

const POS = new THREE.Vector3(-1.38, 1.5, -0.62);
const TGT = new THREE.Vector3(-0.36, 0.92, 0.3);

function VignetteOffice({ themeId }: { themeId: Theme3DId }) {
  const office = useMemo(() => createOffice(THREE), []);
  const { camera } = useThree();
  const t = useRef(0);

  useEffect(() => {
    office.theme(ROOM3D[themeId]);
    const dust = office.group.getObjectByName("dust");
    if (dust) dust.visible = false;
    const walker = office.group.getObjectByName("catWalker");
    if (walker) walker.visible = false;
  }, [office, themeId]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    t.current += dt;
    const c = 0.5 - 0.5 * Math.cos(t.current * 0.55);
    const p = 0.445 + 0.06 * c;
    camera.position.copy(POS).add(new THREE.Vector3(0, Math.sin(t.current * 0.3) * 0.008, Math.sin(t.current * 0.2) * 0.02));
    camera.lookAt(TGT);
    office.update({ p, vel: 0, t: t.current, dt, camPos: camera.position });
  });

  return <primitive object={office.group} />;
}

export default function OfficeVignette({ themeId }: { themeId: Theme3DId }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 34, near: 0.03, far: 30, position: [-1.38, 1.5, -0.62] }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <color attach="background" args={[ROOM3D[themeId].bg]} />
      <fog attach="fog" args={[ROOM3D[themeId].bg, 3, 8]} />
      <VignetteOffice themeId={themeId} />
    </Canvas>
  );
}
