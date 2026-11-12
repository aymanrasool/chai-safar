import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type SpiceKind = "cardamom" | "cinnamon" | "anise" | "ginger" | "leaf";

export type SpiceAsset = {
  parts: { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] }[];
  /** how large it appears when showcased beside its card */
  showcaseScale: number;
};

/** Cardamom pod: a pointed lathe with six flat facets for the ridges. */
function cardamom(): SpiceAsset {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const y = (t - 0.5) * 0.42;
    const r = Math.sin(t * Math.PI) ** 0.75 * 0.1;
    pts.push(new THREE.Vector2(Math.max(r, 0.0001), y));
  }
  const g = new THREE.LatheGeometry(pts, 6);
  g.computeVertexNormals();
  const stem = new THREE.CylinderGeometry(0.008, 0.014, 0.05, 6);
  stem.translate(0, 0.23, 0);
  return {
    showcaseScale: 3.3,
    parts: [
      {
        geometry: mergeGeometries([g.toNonIndexed(), stem.toNonIndexed()])!,
        material: new THREE.MeshStandardMaterial({ color: "#8d9c59", roughness: 0.62, flatShading: true }),
      },
    ],
  };
}

/** Cinnamon quill: two curled, open bark sheets rolled inside one another. */
function cinnamon(): SpiceAsset {
  const outer = new THREE.CylinderGeometry(0.075, 0.075, 0.95, 24, 1, true, 0, Math.PI * 1.7);
  const inner = new THREE.CylinderGeometry(0.05, 0.05, 0.95, 20, 1, true, Math.PI * 0.6, Math.PI * 1.6);
  const geo = mergeGeometries([outer, inner])!;
  geo.rotateZ(Math.PI / 2);
  return {
    showcaseScale: 2.3,
    parts: [
      {
        geometry: geo,
        material: new THREE.MeshStandardMaterial({ color: "#8a4a27", roughness: 0.88, side: THREE.DoubleSide }),
      },
    ],
  };
}

/** Star anise: eight boat-shaped carpels and a glossy seed on each. */
function anise(): SpiceAsset {
  const pods: THREE.BufferGeometry[] = [];
  const seeds: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const pod = new THREE.SphereGeometry(1, 12, 8);
    pod.scale(0.15, 0.05, 0.065);
    pod.translate(0.14, 0, 0);
    pod.rotateY(a);
    pods.push(pod);
    const seed = new THREE.SphereGeometry(0.034, 10, 8);
    seed.scale(1.2, 0.8, 1);
    seed.translate(0.15, 0.04, 0);
    seed.rotateY(a);
    seeds.push(seed);
  }
  const hub = new THREE.CylinderGeometry(0.04, 0.05, 0.06, 10);
  pods.push(hub);
  return {
    showcaseScale: 2.7,
    parts: [
      {
        geometry: mergeGeometries(pods)!,
        material: new THREE.MeshStandardMaterial({ color: "#5c2e1a", roughness: 0.82 }),
      },
      {
        geometry: mergeGeometries(seeds)!,
        material: new THREE.MeshStandardMaterial({ color: "#b07438", roughness: 0.3 }),
      },
    ],
  };
}

/** Ginger slice: an irregular coin with fibrous flesh and a thin papery skin. */
function ginger(): SpiceAsset {
  const g = new THREE.CylinderGeometry(0.2, 0.2, 0.045, 36, 1);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-4) continue;
    const a = Math.atan2(z, x);
    const k = 1 + 0.14 * Math.sin(a * 3 + 1.2) + 0.07 * Math.sin(a * 5 + 0.4) + 0.04 * Math.sin(a * 9);
    pos.setX(i, x * k);
    pos.setZ(i, z * k * 0.82);
  }
  g.computeVertexNormals();
  const skin = new THREE.MeshStandardMaterial({ color: "#a3713f", roughness: 0.92 });
  const flesh = new THREE.MeshStandardMaterial({ color: "#efd59a", roughness: 0.55 });
  return { showcaseScale: 2.6, parts: [{ geometry: g, material: [skin, flesh, flesh] }] };
}

/** Tea leaf: a serrated leaf shape bent along its length and across the midrib. */
function leaf(): SpiceAsset {
  const s = new THREE.Shape();
  s.moveTo(0, -0.22);
  s.bezierCurveTo(0.12, -0.14, 0.13, 0.08, 0, 0.24);
  s.bezierCurveTo(-0.13, 0.08, -0.12, -0.14, 0, -0.22);
  const g = new THREE.ShapeGeometry(s, 14);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, -x * x * 4 + Math.sin((y + 0.22) * 6) * 0.03);
  }
  g.computeVertexNormals();
  const rib = new THREE.CylinderGeometry(0.004, 0.006, 0.44, 4);
  rib.translate(0, 0, 0.003);
  const geometry = mergeGeometries([g.toNonIndexed(), rib.toNonIndexed()])!;
  return {
    showcaseScale: 3.1,
    parts: [
      {
        geometry,
        material: new THREE.MeshStandardMaterial({ color: "#4b5b2b", roughness: 0.48, side: THREE.DoubleSide }),
      },
    ],
  };
}

export function createSpiceAssets(): Record<SpiceKind, SpiceAsset> {
  return { cardamom: cardamom(), cinnamon: cinnamon(), anise: anise(), ginger: ginger(), leaf: leaf() };
}

export function disposeSpiceAssets(assets: Record<SpiceKind, SpiceAsset>) {
  for (const a of Object.values(assets)) {
    for (const p of a.parts) {
      p.geometry.dispose();
      (Array.isArray(p.material) ? p.material : [p.material]).forEach((m) => m.dispose());
    }
  }
}
