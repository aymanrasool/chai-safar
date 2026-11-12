"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CUP_MODEL } from "@/lib/config";
import {
  liquidBodyFragment,
  liquidBodyVertex,
  liquidSurfaceFragment,
  liquidSurfaceVertex,
} from "./shaders/liquid";
import type { Pose } from "@/lib/sceneState";

type Props = {
  pose: Pose;
  color: THREE.Color;
  simple: boolean;
};

const { inner } = CUP_MODEL;

export function Liquid({ pose, color, simple }: Props) {
  const surfaceRef = useRef<THREE.Mesh>(null);

  const bodyGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 1, 1, simple ? 32 : 56, 1, true);
    g.translate(0, 0.5, 0);
    return g;
  }, [simple]);
  const surfaceGeo = useMemo(() => new THREE.RingGeometry(0, 1, simple ? 40 : 72, simple ? 6 : 14), [simple]);

  const bodyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: liquidBodyVertex,
        fragmentShader: liquidBodyFragment,
        uniforms: {
          uColor: { value: color },
          uTime: { value: 0 },
          uLevel: { value: pose.level },
          uBottomY: { value: inner.bottomY },
          uTopY: { value: inner.topY },
          uBottomR: { value: inner.bottomRadius },
          uTopR: { value: inner.topRadius },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color],
  );

  const surfaceMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: liquidSurfaceVertex,
        fragmentShader: liquidSurfaceFragment.replace("#define OCTAVES OCT", `#define OCTAVES ${simple ? 3 : 5}`),
        uniforms: {
          uColor: { value: color },
          uTime: { value: 0 },
          uRadius: { value: 0.6 },
          uPour: { value: 0 },
        },
      }),
    [color, simple],
  );

  useEffect(
    () => () => {
      bodyGeo.dispose();
      surfaceGeo.dispose();
    },
    [bodyGeo, surfaceGeo],
  );
  useEffect(
    () => () => {
      bodyMat.dispose();
      surfaceMat.dispose();
    },
    [bodyMat, surfaceMat],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const level = THREE.MathUtils.clamp(pose.level, 0.02, 0.97);
    bodyMat.uniforms.uLevel.value = level;
    bodyMat.uniforms.uTime.value = t;
    surfaceMat.uniforms.uTime.value = t;
    surfaceMat.uniforms.uPour.value = pose.pourHead * (1 - pose.pourTail);

    const y = THREE.MathUtils.lerp(inner.bottomY, inner.topY, level);
    const r = THREE.MathUtils.lerp(inner.bottomRadius, inner.topRadius, level) - 0.008;
    surfaceMat.uniforms.uRadius.value = r;
    if (surfaceRef.current) surfaceRef.current.position.y = y;
  });

  return (
    <group>
      <mesh geometry={bodyGeo} material={bodyMat} renderOrder={1} frustumCulled={false} />
      <mesh
        ref={surfaceRef}
        geometry={surfaceGeo}
        material={surfaceMat}
        rotation-x={-Math.PI / 2}
        renderOrder={1}
        frustumCulled={false}
      />
    </group>
  );
}
