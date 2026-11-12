import { noiseGLSL } from "./noise";

export const steamVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Wispy steam: a column that widens as it rises, bent by low-frequency noise (the curl)
 * and broken up by high-frequency noise (the wisps), fading in at the rim and out at the top.
 */
export const steamFragment = /* glsl */ `
#define OCTAVES OCT
uniform float uTime;
uniform float uSeed;
uniform float uIntensity;
varying vec2 vUv;
${noiseGLSL}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.11 + uSeed * 3.7;

  float bend = (fbm(vec2(uv.y * 1.3 - t * 1.6, uSeed)) - 0.5) * 0.75 * uv.y;
  bend += sin(uv.y * 5.0 - t * 4.0 + uSeed) * 0.05 * uv.y;
  float x = uv.x - 0.5 + bend;

  float width = mix(0.06, 0.34, smoothstep(0.0, 1.0, uv.y));
  float column = smoothstep(width, width * 0.1, abs(x));

  float n = fbm(vec2(x * 3.2 + uSeed * 1.3, uv.y * 2.2 - t * 2.6));
  float wisps = smoothstep(0.38, 0.82, n);

  float fade = smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.42, uv.y);
  float a = column * wisps * fade * uIntensity * 0.5;

  gl_FragColor = vec4(vec3(1.0, 0.95, 0.88), a);
  #include <colorspace_fragment>
}
`;
