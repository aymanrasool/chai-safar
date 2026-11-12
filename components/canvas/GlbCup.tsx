"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CUP_MODEL } from "@/lib/config";

/**
 * Loads your own cup model from CUP_MODEL.url (see lib/config.ts).
 * Glass-looking materials are upgraded to a transmissive physical material so they
 * sit in the same lighting as the procedural cup.
 */
export function GlbCup({ url, simple }: { url: string; simple: boolean }) {
  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const looksLikeGlass = mat && (mat.transparent || /glass/i.test(mat.name || mesh.name));
      if (looksLikeGlass && !simple) {
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: mat.color ?? new THREE.Color("#fff3e4"),
          roughness: 0.06,
          transmission: 1,
          thickness: 0.35,
          ior: 1.5,
          clearcoat: 1,
        });
      }
    });
    return root;
  }, [scene, simple]);

  return <primitive object={model} scale={CUP_MODEL.scale} position-y={CUP_MODEL.offsetY} />;
}
