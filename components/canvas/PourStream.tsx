"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pourFragment, pourVertex } from "./shaders/pour";
import { CUP_MODEL } from "@/lib/config";
import type { Pose } from "@/lib/sceneState";

/**
 * A ribbon of chai poured "from height": it leaves an unseen kettle spout high above
 * and to the left, arcs slightly, and falls straight into the glass.
 */
export function PourStream({ pose, color, simple }: { pose: Pose; color: THREE.Color; simple: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.35, 5.4, 0),
      new THREE.Vector3(-0.7, 5.1, 0),
      new THREE.Vector3(-0.2, 4.2, 0),
      new THREE.Vector3(-0.04, 2.8, 0),
      new THREE.Vector3(0, 1.6, 0),
      new THREE.Vector3(0, CUP_MODEL.inner.bottomY + 0.05, 0),
    ]);
    return new THREE.TubeGeometry(curve, simple ? 90 : 160, 0.05, simple ? 8 : 14, false);
  }, [simple]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pourVertex,
        fragmentShader: pourFragment,
        uniforms: {
          uColor: { value: color },
          uTime: { value: 0 },
          uHead: { value: 0 },
          uTail: { value: 0 },
        },
      }),
    [color],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uHead.value = pose.pourHead;
    material.uniforms.uTail.value = pose.pourTail;
    if (meshRef.current) meshRef.current.visible = pose.pourHead > 0.001 && pose.pourTail < 0.999;
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} visible={false} frustumCulled={false} />;
}
