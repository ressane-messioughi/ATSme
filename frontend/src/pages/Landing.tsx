import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createOffice, CHAPTERS } from "../three/office-scene.js";
import { ROOM3D } from "../three/theme3d.js";
import { useTheme3D, THEME3D_META } from "../lib/theme3d.ts";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

function Office({ themeId, onAction }: { themeId: string; onAction: (a: string) => void }) {
  const office = useMemo(() => createOffice(THREE), []);
  const { camera, size } = useThree();
  const s = useRef({ lastY: 0, vel: 0, p: 0, t: 0, mx: 0, my: 0, tmx: 0, tmy: 0 });

  useEffect(() => {
    office.theme(ROOM3D[themeId]);
  }, [office, themeId]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      s.current.tmx = e.clientX / innerWidth - 0.5;
      s.current.tmy = e.clientY / innerHeight - 0.5;
    };
    addEventListener("pointermove", onMove);
    s.current.lastY = scrollY;
    return () => removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const st = s.current;
    const dt = Math.min(0.05, delta);
    st.t += dt;
    const target = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
    st.p += (target - st.p) * Math.min(1, dt * 5);
    const dy = Math.abs(scrollY - st.lastY);
    st.lastY = scrollY;
    st.vel += (clamp(dy / 14) - st.vel) * Math.min(1, dt * 6);
    st.mx += (st.tmx - st.mx) * Math.min(1, dt * 3);
    st.my += (st.tmy - st.my) * Math.min(1, dt * 3);
    const pose = office.camera(st.p);
    camera.position.copy(pose.position).add(new THREE.Vector3(st.mx * 0.1 * pose.offset, -st.my * 0.05 * pose.offset, 0));
    camera.lookAt(pose.target);
    const shift = size.width >= 760 ? 0.13 * pose.offset : 0;
    if (shift > 0.001) camera.setViewOffset(size.width, size.height, -size.width * shift, 0, size.width, size.height);
    else camera.clearViewOffset();
    office.update({ p: st.p, vel: st.vel, t: st.t, dt, camPos: camera.position });
  });

  const byObject = useMemo(() => new Map(office.pickables.map((p: { object: unknown; action: string }) => [p.object, p.action])), [office]);
  const actionOf = (o: THREE.Object3D | null) => {
    while (o) {
      if (byObject.has(o)) return byObject.get(o);
      o = o.parent;
    }
    return null;
  };

  return (
    <primitive
      object={office.group}
      onClick={(e: { object: THREE.Object3D; stopPropagation: () => void }) => {
        const a = actionOf(e.object);
        if (!a) return;
        e.stopPropagation();
        if (["chat", "lampe", "plante"].includes(a)) office.react(a);
        onAction(a);
      }}
      onPointerOver={(e: { object: THREE.Object3D }) => {
        if (actionOf(e.object)) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    />
  );
}

export default function Landing() {
  const { theme: themeId, setTheme: setThemeId } = useTheme3D();
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    function onScroll() {
      const p = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
      let idx = 0;
      for (let i = 0; i < CHAPTERS.length; i++) if (p >= CHAPTERS[i].p) idx = i;
      setChapter(idx);
    }
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  function goToChapter(i: number) {
    const p = CHAPTERS[i].p;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTo({ top: p * max, behavior: "smooth" });
  }

  function onAction(action: string) {
    if (action === "ouvrir") goToChapter(CHAPTERS.length - 1);
    if (action === "comparer") goToChapter(3);
  }

  return (
    <div style={{ background: "var(--t-bg)", color: "var(--t-ink)" }}>
      <a
        href="#contenu"
        style={{
          position: "absolute",
          left: 8,
          top: -60,
          background: "var(--t-accent)",
          color: "var(--t-accent-ink)",
          padding: "10px 16px",
          borderRadius: 8,
          zIndex: 50,
        }}
        onFocus={(e) => (e.currentTarget.style.top = "8px")}
        onBlur={(e) => (e.currentTarget.style.top = "-60px")}
      >
        Aller au contenu
      </a>

      <div style={{ height: "600vh", position: "relative" }}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ fov: 34, near: 0.03, far: 50, position: [2.2, 1.5, 1.3] }}
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
          style={{ position: "fixed", inset: 0 }}
          aria-label="Scène illustrée : une personne rédige son CV à son bureau, à côté de son chat."
        >
          <color attach="background" args={[ROOM3D[themeId].bg]} />
          <fog attach="fog" args={[ROOM3D[themeId].bg, 5, 12]} />
          <Office themeId={themeId} onAction={onAction} />
        </Canvas>

        {/* Barre du haut : logo + CTAs */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px clamp(16px, 4vw, 40px)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--t-ink)", pointerEvents: "auto" }}>ATSme</span>
          <div style={{ display: "flex", gap: 10, pointerEvents: "auto" }}>
            <Link
              to="/connexion"
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--t-ink)",
                background: "var(--t-surface)",
                border: "1px solid var(--t-track)",
              }}
            >
              Se connecter
            </Link>
            <Link
              to="/inscription"
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--t-accent-ink)",
                background: "var(--t-accent)",
              }}
            >
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Titre du chapitre courant */}
        <div
          style={{
            position: "fixed",
            left: "clamp(16px, 4vw, 40px)",
            bottom: 96,
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--t-muted)", margin: 0 }}>
            Chapitre {chapter + 1} / {CHAPTERS.length}
          </p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "4px 0 0", color: "var(--t-ink)" }}>{CHAPTERS[chapter].label}</h1>
        </div>

        {/* Points de navigation entre chapitres */}
        <div
          style={{
            position: "fixed",
            left: "clamp(16px, 4vw, 40px)",
            bottom: 56,
            display: "flex",
            gap: 8,
            zIndex: 20,
          }}
        >
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => goToChapter(i)}
              aria-label={c.label}
              aria-current={i === chapter}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: i === chapter ? "var(--t-accent)" : "var(--t-track)",
              }}
            />
          ))}
        </div>

        {/* Sélecteur de thème */}
        <div
          style={{
            position: "fixed",
            right: "clamp(16px, 4vw, 40px)",
            bottom: 56,
            display: "flex",
            gap: 8,
            zIndex: 20,
            background: "var(--t-surface)",
            padding: 6,
            borderRadius: 999,
            border: "1px solid var(--t-track)",
          }}
        >
          {THEME3D_META.map(({ id, label, swatch }) => (
            <button
              key={id}
              type="button"
              onClick={() => setThemeId(id)}
              aria-label={label}
              aria-pressed={id === themeId}
              title={label}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                cursor: "pointer",
                background: swatch,
                border: id === themeId ? "2px solid var(--t-ink)" : "2px solid transparent",
              }}
            />
          ))}
        </div>
      </div>

      <div id="contenu" tabIndex={-1} />
    </div>
  );
}
