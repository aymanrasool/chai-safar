"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { ScrollTrigger } from "@/lib/gsap";
import { destroyLenis, getLenis, initLenis } from "@/lib/lenis";
import { useAppStore } from "@/lib/store";
import { Preloader } from "@/components/ui/Preloader";
import { Cursor } from "@/components/ui/Cursor";
import { Nav } from "@/components/ui/Nav";
import { Marquee } from "@/components/ui/Marquee";
import { Hero } from "@/components/sections/Hero";
import { Pour } from "@/components/sections/Pour";
import { Ingredients } from "@/components/sections/Ingredients";
import { Ritual } from "@/components/sections/Ritual";
import { Menu } from "@/components/sections/Menu";
import { Story } from "@/components/sections/Story";
import { Footer } from "@/components/sections/Footer";

// The WebGL scene is split into its own chunk and only ever runs in the browser.
const Scene = dynamic(() => import("@/components/canvas/Scene"), { ssr: false });

export default function Experience() {
  const introDone = useAppStore((s) => s.introDone);

  // smooth scroll foundation: Lenis driven by the GSAP ticker
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.classList.add("is-loading");
    const lenis = initLenis();
    lenis?.stop();
    return () => destroyLenis();
  }, []);

  // release the page once the curtain lifts
  useEffect(() => {
    if (!introDone) return;
    document.documentElement.classList.remove("is-loading");
    getLenis()?.start();
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    const t = window.setTimeout(refresh, 600);
    return () => window.clearTimeout(t);
  }, [introDone]);

  return (
    <>
      <Preloader />
      <Scene />
      <Cursor />
      <div className="grain" aria-hidden />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <Pour />
        <Ingredients />
        <Ritual />
        <Menu />
        <Story />
      </main>
      <Footer />
    </>
  );
}
