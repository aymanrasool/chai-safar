"use client";

import { Bloom, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { QUALITY } from "@/lib/config";

/**
 * Cinematic finish: soft bloom on highlights, ACES tone mapping, film grain and a warm
 * vignette, merged into as few passes as possible. Depth of field is the most expensive
 * effect, so it is off unless QUALITY.depthOfField is enabled in lib/config.ts.
 */
export function Effects({ quality }: { quality: "high" | "low" }) {
  const high = quality === "high";
  return (
    <EffectComposer multisampling={0} resolutionScale={1}>
      <Bloom
        mipmapBlur
        intensity={high ? 0.7 : 0.5}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.25}
        radius={0.7}
        levels={high ? 6 : 4}
        resolutionScale={0.5}
      />
      {high && QUALITY.depthOfField && (
        <DepthOfField target={[0, 0, 0]} worldFocusRange={4.5} bokehScale={2.2} resolutionScale={0.5} />
      )}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
      <Vignette eskil={false} offset={0.22} darkness={0.72} />
    </EffectComposer>
  );
}
