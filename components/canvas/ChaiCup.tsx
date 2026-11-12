"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { CUP_MODEL } from "@/lib/config";
import { sceneState, type Pose } from "@/lib/sceneState";
import { GlassCup } from "./GlassCup";
import { GlbCup } from "./GlbCup";
import { Liquid } from "./Liquid";
import { Steam } from "./Steam";
import { PourStream } from "./PourStream";

type Props = {
  pose: Pose;
  color: THREE.Color;
  simple: boolean;
};

const CUP_HALF = 0.75;

export function ChaiCup({ pose, color, simple }: Props) {
  const rootRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const root = rootRef.current;
    const tilt = tiltRef.current;
    const spin = spinRef.current;
    if (!root || !tilt || !spin) return;
    const t = state.clock.elapsedTime;
    const reduced = sceneState.reducedMotion;
    const float = reduced ? 0 : Math.sin(t * 0.9) * 0.06;

    root.position.set(pose.x, pose.y + float, pose.z);
    root.scale.setScalar(pose.scale);

    // slow turntable spin on its own
    if (!reduced) spin.rotation.y += delta * 0.18;

    // gentle tilt toward the cursor, smoothed
    const { x, y } = sceneState.mouse;
    tilt.rotation.x = THREE.MathUtils.damp(tilt.rotation.x, reduced ? 0 : -y * 0.16, 3, delta);
    tilt.rotation.z = THREE.MathUtils.damp(tilt.rotation.z, reduced ? 0 : -x * 0.14, 3, delta);
  });

  return (
    <group ref={rootRef}>
      <group ref={tiltRef}>
        <group position-y={-CUP_HALF}>
          <group ref={spinRef}>
            {CUP_MODEL.url ? <GlbCup url={CUP_MODEL.url} simple={simple} /> : <GlassCup simple={simple} />}
            <Liquid pose={pose} color={color} simple={simple} />
          </group>
          <Steam pose={pose} count={simple ? 2 : 4} simple={simple} topY={CUP_MODEL.inner.topY} />
        </group>
      </group>
      <group position-y={-CUP_HALF}>
        <PourStream pose={pose} color={color} simple={simple} />
        <ContactShadows
          position-y={-0.02}
          opacity={0.5}
          scale={2.6}
          blur={2.6}
          far={1.6}
          resolution={simple ? 128 : 256}
          color="#000000"
        />
      </group>
    </group>
  );
}
