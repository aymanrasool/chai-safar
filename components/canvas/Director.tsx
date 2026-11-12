"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { computePose, createPose, sceneState, type Pose } from "@/lib/sceneState";

const target = createPose();
const lookAt = new THREE.Vector3();
const DAMP_KEYS: (keyof Pose)[] = ["x", "y", "z", "scale", "level", "showcase", "steam"];

/**
 * Runs first every frame: turns scroll progress into a target pose, damps the live pose
 * toward it (silky even on a notchy mouse wheel) and drives the camera orbit.
 */
const targetColor = new THREE.Color();

export function Director({ pose, color }: { pose: Pose; color: THREE.Color }) {
  useFrame((state, delta) => {
    computePose(target);
    const dt = Math.min(delta, 0.05);
    const k = sceneState.reducedMotion ? 12 : 4.5;
    for (const key of DAMP_KEYS) pose[key] = THREE.MathUtils.damp(pose[key], target[key], k, dt);
    // pour + orbit follow the scrollbar 1:1 (Lenis already smooths them)
    pose.pourHead = target.pourHead;
    pose.pourTail = target.pourTail;
    pose.orbit = THREE.MathUtils.damp(pose.orbit, target.orbit, 6, dt);

    // chai colour eases toward the hovered menu item
    targetColor.set(sceneState.liquidColor);
    color.lerp(targetColor, 1 - Math.exp(-3.2 * dt));

    // camera: orbit around the cup during the ritual, subtle parallax otherwise
    const cam = state.camera;
    const angle = pose.orbit * Math.PI * 2;
    const radius = sceneState.isMobile ? 7.4 : 6.2;
    const { x: mx, y: my } = sceneState.mouse;
    const px = sceneState.reducedMotion ? 0 : mx * 0.25;
    const py = sceneState.reducedMotion ? 0 : my * 0.15;
    cam.position.set(
      Math.sin(angle) * radius + px * Math.cos(angle),
      0.35 + py + Math.sin(angle) * 0.25,
      Math.cos(angle) * radius - px * Math.sin(angle),
    );
    lookAt.set(0, 0.05, 0);
    cam.lookAt(lookAt);
  }, -1);

  return null;
}
