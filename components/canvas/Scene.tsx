"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { appStore, useAppStore } from "@/lib/store";
import { createPose, DEFAULT_LIQUID, sceneState } from "@/lib/sceneState";
import { ChaiCup } from "./ChaiCup";
import { Director } from "./Director";
import { Effects } from "./Effects";
import { Ingredients } from "./Ingredients";
import { Lighting } from "./Lighting";

/** Flags the preloader once the first frame with all assets has actually rendered. */
function ReadySignal() {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => appStore.set({ sceneReady: true }));
  });
  return null;
}

export default function Scene() {
  const canvasActive = useAppStore((s) => s.canvasActive);
  const [isMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  const [degraded, setDegraded] = useState(false);
  const simple = isMobile || degraded;

  const pose = useMemo(() => createPose(), []);
  const color = useMemo(() => new THREE.Color(DEFAULT_LIQUID), []);

  // device / preference flags + pointer tracking, written straight into sceneState
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      sceneState.isMobile = mqMobile.matches;
      sceneState.reducedMotion = mqReduce.matches;
    };
    sync();
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __scene?: typeof sceneState }).__scene = sceneState; // dev-only debug handle
    }
    mqMobile.addEventListener("change", sync);
    mqReduce.addEventListener("change", sync);

    const onMove = (e: PointerEvent) => {
      sceneState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      mqMobile.removeEventListener("change", sync);
      mqReduce.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{ fov: 35, position: [0, 0.35, 6.2], near: 0.1, far: 40 }}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
        frameloop={canvasActive ? "always" : "never"}
      >
        <color attach="background" args={["#1a0f0a"]} />
        <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={2} />
        <AdaptiveDpr />
        <Suspense fallback={null}>
          <Director pose={pose} color={color} />
          <Lighting simple={simple} />
          <ChaiCup pose={pose} color={color} simple={simple} />
          <Ingredients pose={pose} count={isMobile ? 7 : 14} />
          <Effects quality={simple ? "low" : "high"} />
          <ReadySignal />
        </Suspense>
      </Canvas>
    </div>
  );
}
