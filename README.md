# Chai Safar

An immersive, scroll-driven site for a luxury chai brand, built with Next.js (App Router), React Three Fiber, GSAP + ScrollTrigger + SplitText, and Lenis.

```bash
npm install
npm run dev        # http://localhost:3000 (webpack)
npm run build && npm start
```

`npm run dev` uses webpack because this machine's Windows Application Control blocks Next's native SWC/Turbopack binaries. On an unrestricted machine, `npm run dev:turbo` uses Turbopack.

## Rename the brand

Edit `BRAND` in `lib/config.ts`. All copy lives in `lib/content.ts`.

## Structure

```
app/                     layout (fonts, metadata), page, global CSS + Tailwind theme
components/
  Experience.tsx         client root: Lenis, preloader, fixed canvas, sections
  canvas/                all 3D (lazy-loaded, client only)
    Scene.tsx            <Canvas>, DPR cap, perf monitor, Suspense
    Director.tsx         scroll progress → cup pose, camera orbit, liquid colour
    ChaiCup.tsx          float / spin / mouse tilt, contact shadow
    GlassCup.tsx         procedural fluted "cutting chai" glass (LatheGeometry)
    GlbCup.tsx           loads your own .glb instead (see below)
    Liquid.tsx           shader liquid body + swirling surface with meniscus
    Steam.tsx            noise-shader steam plumes
    PourStream.tsx       TubeGeometry pour with reveal shader
    Ingredients.tsx      orbiting spices → showcase beside their cards
    Lighting.tsx         Lightformer environment, lights, backdrop, dust
    Effects.tsx          bloom, depth of field, tone mapping, grain, vignette
    shaders/             GLSL
  sections/              Hero, Pour, Ingredients, Ritual, Menu, Story, Footer
  ui/                    Preloader, Cursor, MagneticButton, RevealText, Marquee, Nav
lib/
  gsap.ts                plugin registration + shared media queries
  lenis.ts               Lenis driven by the GSAP ticker
  scroll.ts              segmentTrigger(): ScrollTrigger → sceneState
  sceneState.ts          shared per-frame state + the pose "director"
  store.ts               tiny React store (preloader / intro / canvas sleep)
  content.ts, config.ts  copy and brand settings
public/images/story/     SVG parallax layers (swap for photos any time)
tooling/                 JS Tailwind scanner for PostCSS (see postcss.config.mjs)
```

## Use your own cup model

1. Put the file at `public/models/cup.glb`.
2. In `lib/config.ts`, set `CUP_MODEL.url = "/models/cup.glb"`.
3. Adjust `scale` and `offsetY` so the cup's base sits at y = 0 and it is about 1.5 units tall.
4. Tune `CUP_MODEL.inner` (bottom/top y and radius of the inside) so the procedural chai, steam and pour fit inside your model.

Meshes whose material is transparent, or whose name contains "glass", are upgraded to a transmissive glass material automatically.
