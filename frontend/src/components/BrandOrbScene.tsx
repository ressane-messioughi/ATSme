import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sparkles } from "@react-three/drei";
import type { Mesh } from "three";

// Le "corps" de l'entité : un icosaèdre à la surface vivante (MeshDistortMaterial
// l'ondule légèrement dans le temps), plutôt qu'une sphère lisse — c'est ce qui le fait
// lire comme une présence active ("qui analyse") et pas comme une simple bille décorative.
function OrbBody({ reduceMotion, accent }: { reduceMotion: boolean; accent: string }) {
  const mesh = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    if (!reduceMotion) {
      mesh.current.rotation.y += delta * 0.35;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
    }
    // Légère bascule vers le pointeur : une présence qui "regarde" plutôt qu'un
    // ornement figé, sans jamais aller jusqu'à une vraie interaction 3D.
    const targetY = reduceMotion ? mesh.current.rotation.y : mesh.current.rotation.y + state.pointer.x * 0.15;
    mesh.current.rotation.y += (targetY - mesh.current.rotation.y) * 0.02;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1, 4]} />
      <MeshDistortMaterial
        color={accent}
        emissive={accent}
        emissiveIntensity={0.35}
        roughness={0.15}
        metalness={0.65}
        distort={reduceMotion ? 0.08 : 0.28}
        speed={reduceMotion ? 0 : 1.4}
      />
    </mesh>
  );
}

// Anneau fin qui orbite le corps, seul élément qui évoque directement le balayage d'un
// scanner — le lien visuel avec "analyse de CV" sans dessiner une icône littérale.
function ScanRing({ reduceMotion, accentSoft }: { reduceMotion: boolean; accentSoft: string }) {
  const ring = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ring.current && !reduceMotion) ring.current.rotation.z -= delta * 0.6;
  });
  return (
    <mesh ref={ring} rotation={[Math.PI / 2.3, 0, 0]}>
      <torusGeometry args={[1.5, 0.012, 8, 96]} />
      <meshBasicMaterial color={accentSoft} transparent opacity={0.55} />
    </mesh>
  );
}

// accent/accentSoft viennent du thème actif (lib/theme.ts THEME_ACCENT) : l'entité change
// de couleur avec le reste de l'espace de travail plutôt que de rester violette en
// permanence, ce qui aurait détonné dans les thèmes Émeraude ou Ambre.
export default function BrandOrbScene({
  reduceMotion = false,
  accent = "#7c3aed",
  accentSoft = "#9d7bfb",
}: {
  reduceMotion?: boolean;
  accent?: string;
  accentSoft?: string;
}) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 3.4], fov: 40 }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[2.5, 2, 2.5]} intensity={40} color={accentSoft} />
      <pointLight position={[-2, -1.5, -2]} intensity={12} color={accent} />
      <OrbBody reduceMotion={reduceMotion} accent={accent} />
      <ScanRing reduceMotion={reduceMotion} accentSoft={accentSoft} />
      {!reduceMotion && <Sparkles count={14} scale={2.6} size={1.4} speed={0.25} color={accentSoft} opacity={0.5} />}
    </Canvas>
  );
}
