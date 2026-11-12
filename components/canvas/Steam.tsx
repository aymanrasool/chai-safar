"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { steamFragment, steamVertex } from "./shaders/steam";
import type { Pose } from "@/lib/sceneState";

type Props = { pose: Pose; count: number; simple: boolean; topY: number };

const PLUMES = [
  { x: -0.12, z: 0.05, w: 1.25, h: 2.6, seed: 0.3 },
  { x: 0.16, z: -0.08, w: 1.1, h: 2.3, seed: 1.7 },
  { x: 0.02, z: 0.12, w: 1.45, h: 3.0, seed: 3.1 },
  { x: -0.05, z: -0.15, w: 0.95, h: 2.0, seed: 4.6 },
];

export function Steam({ pose, count, simple, topY }: Props) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 1, 1);
    g.translate(0, 0.5, 0); // pivot at the base so plumes rise from the rim
    return g;
  }, []);

  const materials = useMemo(
    () =>
      PLUMES.slice(0, count).map(
        (p) =>
          new THREE.ShaderMaterial({
            vertexShader: steamVertex,
            fragmentShader: steamFragment.replace("#define OCTAVES OCT", `#define OCTAVES ${simple ? 3 : 4}`),
            uniforms: {
              uTime: { value: 0 },
              uSeed: { value: p.seed },
              uIntensity: { value: 1 },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
          }),
      ),
    [count, simple],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // steam thins as the cup empties and swells with each fresh boil
    const intensity = pose.steam * THREE.MathUtils.smoothstep(pose.level, 0.05, 0.4);
    for (const m of materials) {
      m.uniforms.uTime.value = t;
      m.uniforms.uIntensity.value = intensity;
    }
  });

  return (
    <group position-y={topY - 0.05}>
      {materials.map((m, i) => {
        const p = PLUMES[i];
        return (
          <Billboard key={i} position={[p.x, 0, p.z]} lockX lockZ>
            <mesh geometry={geometry} material={m} scale={[p.w, p.h, 1]} renderOrder={5} />
          </Billboard>
        );
      })}
    </group>
  );
}
