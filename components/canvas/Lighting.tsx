"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { FX_LAYER } from "@/lib/sceneState";

const tmp = new THREE.Vector3();

/**
 * Warm studio lighting. The environment map is generated in-scene from Lightformers
 * (soft boxes + rim strips), so it works offline and costs a single cube render.
 */
export function Lighting({ simple }: { simple: boolean }) {
  return (
    <>
      <ambientLight intensity={0.25} color="#ffd9a8" />
      <spotLight position={[-3.5, 5, 4]} angle={0.5} penumbra={1} intensity={60} color="#ffc98a" distance={20} />
      <pointLight position={[3, 1.5, -2.5]} intensity={14} color="#e8a33d" distance={10} />
      <pointLight position={[0, -1.5, 3]} intensity={4} color="#7a8b5a" distance={8} />

      <Environment resolution={simple ? 128 : 256} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#ffd8a6" position={[-4, 3, 3]} scale={[4, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#e8a33d" position={[5, 1, -2]} scale={[2, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.2} color="#fff1dd" position={[0, 6, 0]} scale={[6, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="ring" intensity={1.2} color="#ffb45e" position={[2.5, -1, 4]} scale={1.6} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#7a8b5a" position={[0, -3, -4]} scale={[10, 2, 1]} />
      </Environment>

      <Backdrop />
      <Sparkles
        ref={(p: THREE.Points | null) => p?.layers.set(FX_LAYER)}
        count={simple ? 18 : 60} scale={[9, 6, 4]} size={simple ? 2 : 2.6} speed={0.25} opacity={0.5} color="#f2c27a" noise={0.6} />
    </>
  );
}

/** A large warm glow behind the cup, like a lamp in a dark dhaba. */
function Backdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uInner: { value: new THREE.Color("#5a2f15") },
          uOuter: { value: new THREE.Color("#1a0f0a") },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uInner;
          uniform vec3 uOuter;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv - vec2(0.5, 0.55);
            p.x *= 1.6;
            float d = length(p);
            vec3 col = mix(uInner, uOuter, smoothstep(0.0, 0.5, d));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `,
        depthWrite: false,
      }),
    [],
  );
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => {
    const m = ref.current;
    if (!m) return;
    // always sit on the far side of the cup, facing the camera (works during the orbit)
    tmp.set(camera.position.x, 0, camera.position.z).normalize().multiplyScalar(-7);
    m.position.set(tmp.x, 0, tmp.z);
    m.lookAt(camera.position.x, 0, camera.position.z);
  });
  return (
    <mesh ref={ref} position={[0, 0, -7]} renderOrder={-1} material={material}>
      <planeGeometry args={[40, 24]} />
    </mesh>
  );
}
