"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FX_LAYER, sceneState, smoothstep, type Pose } from "@/lib/sceneState";
import { createSpiceAssets, disposeSpiceAssets, type SpiceKind } from "./ingredientGeometries";

/** Order matches the Ingredients section panels. */
const FEATURED: SpiceKind[] = ["cardamom", "cinnamon", "anise", "ginger", "leaf"];
const EXTRA: SpiceKind[] = ["leaf", "cardamom", "anise", "leaf", "cinnamon", "cardamom", "ginger", "leaf", "anise"];

type Item = {
  kind: SpiceKind;
  featuredIndex: number; // -1 if just decorative
  radius: number;
  angle: number;
  height: number;
  speed: number;
  depth: number;
  scale: number;
  spin: THREE.Vector3;
};

function buildItems(count: number): Item[] {
  const kinds = [...FEATURED, ...EXTRA].slice(0, count);
  return kinds.map((kind, i) => {
    const golden = i * 2.399963; // golden angle spreads items evenly around the cup
    return {
      kind,
      featuredIndex: i < FEATURED.length ? i : -1,
      radius: 1.55 + ((i * 37) % 10) / 10 * 0.9,
      angle: golden,
      height: Math.sin(i * 1.7) * 1.05 + 0.15,
      speed: 0.1 + ((i * 13) % 7) / 70,
      depth: 0.4 + ((i * 29) % 10) / 10,
      scale: 0.85 + ((i * 17) % 5) / 10,
      spin: new THREE.Vector3(Math.sin(i) * 0.5, 0.4 + Math.cos(i * 2) * 0.3, Math.cos(i * 3) * 0.4),
    };
  });
}

const tmpTarget = new THREE.Vector3();
const tmpOrbit = new THREE.Vector3();
const showZ = new THREE.Vector3(0, 0, 0.8);

export function Ingredients({ pose, count }: { pose: Pose; count: number }) {
  const items = useMemo(() => buildItems(count), [count]);
  const assets = useMemo(() => createSpiceAssets(), []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const featuredSmooth = useRef(-1);
  const { camera, viewport } = useThree();

  useEffect(() => () => disposeSpiceAssets(assets), [assets]);

  // spices live on the FX layer: visible to the main camera, invisible to contact shadows
  useEffect(() => {
    camera.layers.enable(FX_LAYER);
    refs.current.forEach((g) => g?.traverse((o) => o.layers.set(FX_LAYER)));
  }, [camera, items]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const reduced = sceneState.reducedMotion;
    const { x: mx, y: my } = sceneState.mouse;
    const vp = viewport.getCurrentViewport(camera, showZ);
    const stacked = sceneState.stacked;

    // stacked (mobile / reduced): snap between whole indices, smoothly
    featuredSmooth.current = THREE.MathUtils.damp(featuredSmooth.current, sceneState.featured, 5, delta);

    items.forEach((it, i) => {
      const g = refs.current[i];
      if (!g) return;

      const a = it.angle + (reduced ? 0 : t * it.speed);
      const r = it.radius * pose.scale;
      tmpOrbit.set(
        pose.x + Math.cos(a) * r + mx * it.depth * 0.35,
        pose.y + it.height * pose.scale + (reduced ? 0 : Math.sin(t * 0.7 + i) * 0.1) + my * it.depth * 0.22,
        Math.sin(a) * r * 0.55 - 0.2,
      );

      let w = 0;
      let showcaseScale = 1;
      if (it.featuredIndex >= 0 && pose.showcase > 0.001) {
        const asset = assets[it.kind];
        showcaseScale = asset.showcaseScale;
        if (!stacked) {
          // Desktop: each spice rides along with its own horizontal panel (panel 0 is the intro)
          const d = it.featuredIndex + 1 - sceneState.featured; // 0 = its panel is centred
          tmpTarget.set(-vp.width * 0.22 + d * vp.width, Math.max(0, d) * 0.9 + Math.sin(t * 0.8 + i) * 0.06, showZ.z);
          w = smoothstep(it.featuredIndex * 0.06, 0.55 + it.featuredIndex * 0.06, pose.showcase);
        } else {
          const near = 1 - Math.min(1, Math.abs(featuredSmooth.current - it.featuredIndex) * 1.25);
          const onMobile = sceneState.isMobile;
          tmpTarget.set(onMobile ? 0 : -vp.width * 0.24, onMobile ? vp.height * 0.3 : 0, showZ.z);
          w = Math.max(0, near) * pose.showcase;
          showcaseScale *= onMobile ? 0.7 : 1;
        }
      }

      const ease = w * w * (3 - 2 * w);
      g.position.lerpVectors(tmpOrbit, tmpTarget, ease);
      const s = THREE.MathUtils.lerp(it.scale * pose.scale, showcaseScale, ease);
      g.scale.setScalar(s);

      if (!reduced) {
        const spinRate = THREE.MathUtils.lerp(1, 0.35, ease);
        g.rotation.x += it.spin.x * delta * spinRate;
        g.rotation.y += it.spin.y * delta * spinRate;
        g.rotation.z += it.spin.z * delta * spinRate;
      }
    });
  });

  return (
    <group>
      {items.map((it, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          rotation={[i * 0.7, i * 1.3, i * 0.4]}
        >
          {assets[it.kind].parts.map((p, j) => (
            <mesh key={j} geometry={p.geometry} material={p.material} />
          ))}
        </group>
      ))}
    </group>
  );
}
