"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural "cutting chai" glass: a short, flared tumbler with a thick base and
 * fluted walls (flat-shaded lathe segments give the classic vertical ridges).
 * Profile is traced bottom → outer wall → rim → inner wall → inner floor.
 */
function cupProfile() {
  const pts: [number, number][] = [
    [0, 0],
    [0.5, 0],
    [0.54, 0.02],
    [0.555, 0.06],
    [0.6, 0.45],
    [0.66, 0.95],
    [0.72, 1.42],
    [0.735, 1.485],
    [0.728, 1.5],
    [0.712, 1.5],
    [0.7, 1.485],
    [0.685, 1.46],
    [0.63, 0.95],
    [0.57, 0.45],
    [0.505, 0.18],
    [0.48, 0.16],
    [0, 0.16],
  ];
  return pts.map(([x, y]) => new THREE.Vector2(x, y));
}

export function GlassCup({ simple }: { simple: boolean }) {
  const geometry = useMemo(() => {
    const g = new THREE.LatheGeometry(cupProfile(), simple ? 18 : 22);
    g.computeVertexNormals();
    return g;
  }, [simple]);

  const material = useMemo(() => {
    if (simple) {
      // Mobile / low-power: a cheap transparent glass, no transmission pass
      return new THREE.MeshPhysicalMaterial({
        color: "#f3e6d2",
        roughness: 0.12,
        metalness: 0,
        transparent: true,
        opacity: 0.32,
        flatShading: true,
        envMapIntensity: 1.4,
        clearcoat: 1,
        depthWrite: false,
      });
    }
    return new THREE.MeshPhysicalMaterial({
      color: "#fff3e4",
      roughness: 0.06,
      metalness: 0,
      transmission: 1,
      thickness: 0.35,
      ior: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      attenuationColor: new THREE.Color("#f1d9b5"),
      attenuationDistance: 2.4,
      specularIntensity: 1,
      envMapIntensity: 1.5,
      flatShading: true,
    });
  }, [simple]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  return <mesh geometry={geometry} material={material} renderOrder={2} />;
}
