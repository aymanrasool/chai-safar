import { noiseGLSL } from "./noise";

/**
 * Liquid body: a unit open cylinder (y in 0..1) reshaped in the vertex shader to
 * hug the tapered inside of the glass up to the current fill level.
 */
export const liquidBodyVertex = /* glsl */ `
uniform float uBottomY;
uniform float uTopY;
uniform float uBottomR;
uniform float uTopR;
uniform float uLevel;
varying float vH;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  float levelY = mix(uBottomY, uTopY, uLevel);
  float y = mix(uBottomY + 0.002, levelY, position.y);
  float t = (y - uBottomY) / (uTopY - uBottomY);
  float r = mix(uBottomR, uTopR, t) - 0.006;
  vec3 p = vec3(position.x * r, y, position.z * r);
  vH = position.y;

  vec4 world = modelMatrix * vec4(p, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * vec3(position.x, 0.0, position.z));
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const liquidBodyFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
varying float vH;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  float facing = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
  // deeper at the bottom, creamier toward the surface
  vec3 deep = uColor * 0.42;
  vec3 col = mix(deep, uColor * 1.05, smoothstep(0.0, 1.0, vH));
  // light passing through the glass wall: brighter where we look straight in
  col *= 0.7 + 0.45 * pow(facing, 1.5);
  // warm key light from the upper left
  float key = clamp(dot(normalize(vNormalW), normalize(vec3(-0.6, 0.2, 0.8))), 0.0, 1.0);
  col += uColor * key * 0.25;
  // a faint milky haze line just below the surface
  col = mix(col, uColor * 1.25, smoothstep(0.86, 1.0, vH) * 0.35);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Liquid surface: a subdivided disc with swirling milk, meniscus lift and pour ripples. */
export const liquidSurfaceVertex = /* glsl */ `
uniform float uRadius;
uniform float uTime;
uniform float uPour;
varying vec2 vP;
varying float vR;

void main() {
  vec3 p = position;
  float r = length(p.xy);
  vR = r;
  vP = p.xy;
  float meniscus = smoothstep(0.8, 1.0, r) * 0.028;
  float ripple = sin(r * 30.0 - uTime * 10.0) * 0.006 * uPour * (1.0 - r);
  p.xy *= uRadius;
  p.z += meniscus + ripple;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const liquidSurfaceFragment = /* glsl */ `
#define OCTAVES OCT
uniform vec3 uColor;
uniform float uTime;
uniform float uPour;
varying vec2 vP;
varying float vR;
${noiseGLSL}

void main() {
  float r = vR;
  float ang = atan(vP.y, vP.x);
  // spiral coordinates: rotate faster near the centre for a slow whirlpool
  float swirl = ang + r * 3.4 - uTime * (0.22 + uPour * 0.9) / (0.35 + r);
  vec2 q = vec2(cos(swirl), sin(swirl)) * (0.4 + r * 1.6);
  float n = fbm(q * 1.7 + vec2(uTime * 0.03, -uTime * 0.02));
  float streak = smoothstep(0.42, 0.78, n);

  vec3 milk = mix(uColor, vec3(0.97, 0.9, 0.79), 0.5);
  vec3 col = mix(uColor * 0.82, milk, streak * 0.55);

  // tiny froth bubbles near the edge
  float froth = smoothstep(0.72, 0.8, fbm(vP * 14.0 + uTime * 0.05)) * smoothstep(0.55, 0.95, r);
  col = mix(col, milk * 1.1, froth * 0.45);

  // meniscus: a bright ring where the chai climbs the glass
  col += vec3(1.0, 0.86, 0.66) * smoothstep(0.86, 0.995, r) * 0.22;
  // soft specular reflection of the key light
  float spec = smoothstep(0.32, 0.0, length(vP - vec2(-0.32, 0.36)));
  col += vec3(1.0, 0.93, 0.8) * spec * spec * 0.35;
  // pour splash: aerated foam at the impact point
  col = mix(col, milk * 1.15, uPour * smoothstep(0.35, 0.0, r) * 0.6);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
