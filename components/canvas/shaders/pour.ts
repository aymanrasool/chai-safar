import { noiseGLSL } from "./noise";

/** Pour stream along a TubeGeometry. uv.x runs 0 (top, the spout) → 1 (the cup). */
export const pourVertex = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  vUv = uv;
  vec3 p = position;
  // the ribbon wobbles and thins slightly as it falls
  float wobble = sin(uv.x * 46.0 - uTime * 22.0) * 0.006 + sin(uv.x * 13.0 - uTime * 9.0) * 0.004;
  float thin = mix(1.0, 0.72, uv.x);
  p += normal * (wobble - 0.03 * (1.0 - thin));
  vec4 world = modelMatrix * vec4(p, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const pourFragment = /* glsl */ `
#define OCTAVES 3
uniform vec3 uColor;
uniform float uTime;
uniform float uHead;
uniform float uTail;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;
${noiseGLSL}

void main() {
  // reveal from the spout down (head) and retract from the spout (tail)
  if (vUv.x > uHead || vUv.x < uTail) discard;

  float flow = fbm(vec2(vUv.x * 9.0 - uTime * 3.2, vUv.y * 3.0));
  float facing = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
  vec3 col = uColor * (0.65 + 0.5 * facing);
  col = mix(col, uColor * 1.35 + 0.05, smoothstep(0.55, 0.85, flow) * 0.5);
  // glossy rim highlight
  col += vec3(1.0, 0.9, 0.75) * pow(1.0 - facing, 3.0) * 0.45;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
