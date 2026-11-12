"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useAppStore } from "@/lib/store";
import { sceneState } from "@/lib/sceneState";
import { scrollToTarget } from "@/lib/lenis";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const introDone = useAppStore((s) => s.introDone);

  useGSAP(
    () => {
      if (!introDone) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // cup rises into frame as the curtain lifts
      gsap.to(sceneState, { intro: 1, duration: reduced ? 0.01 : 2.2, ease: "expo.out" });

      if (reduced) {
        gsap.from(".hero-fade", { opacity: 0, duration: 0.8, stagger: 0.1 });
        return;
      }

      const split = SplitText.create(".hero-title", {
        type: "chars,words",
        charsClass: "inline-block will-change-transform",
      });
      const tl = gsap.timeline({ delay: 0.35 });
      tl.from(split.chars, {
        opacity: 0,
        yPercent: 70,
        rotateX: -70,
        filter: "blur(8px)",
        clearProps: "filter", // drop the filter afterwards so the headline isn't a filtered layer while scrolling
        duration: 1.6,
        ease: "expo.out",
        stagger: { each: 0.045, from: "start" },
      })
        .from(".hero-fade", { opacity: 0, y: 24, duration: 1.1, stagger: 0.1, ease: "power3.out" }, "-=1.1")
        .from(".hero-line", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.inOut" }, "<");

      // headline drifts apart and fades as you scroll into the pour
      gsap.to(".hero-title-a", {
        xPercent: -12,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-title-b", {
        xPercent: 12,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-scroll", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "20% top", scrub: true },
      });

      return () => split.revert();
    },
    { scope: root, dependencies: [introDone] },
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative flex h-svh min-h-[640px] flex-col justify-between overflow-hidden px-5 pt-28 pb-8 md:px-10 md:pt-32 md:pb-10"
    >
      {/* soft vignette so type stays legible over the 3D scene */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(26,15,10,0.65)_100%)]" />

      <div className="relative flex items-center gap-4">
        <span className="hero-fade text-[11px] tracking-[0.45em] text-saffron uppercase">Est. on the Grand Trunk Road</span>
        <span className="hero-line hidden h-px flex-1 bg-chai/25 md:block" />
        <span className="hero-fade hidden text-[11px] tracking-[0.45em] text-chai/70 uppercase md:block">Lahore — 1,600 miles — Kolkata</span>
      </div>

      <h1 className="hero-title relative font-serif leading-[0.88] tracking-tight text-cream [perspective:800px]" aria-label="Every Sip Tells a Story">
        <span className="hero-title-a block text-[clamp(3.6rem,12vw,13rem)]">Every Sip</span>
        <span className="hero-title-b block text-right text-[clamp(3.6rem,12vw,13rem)] italic text-chai">
          Tells a <span className="text-saffron">Story</span>
        </span>
      </h1>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <p className="hero-fade max-w-sm text-sm leading-relaxed text-chai/85 md:text-base">
          Slow-brewed chai from the roadside dhabas of the subcontinent, with whole spices, full-cream milk and a long
          pour from height. Pull up a stool.
        </p>
        <div className="hero-fade flex items-center gap-4">
          <MagneticButton href="#menu" onClick={() => scrollToTarget("#menu")} className="bg-saffron text-espresso">
            Explore the Menu
          </MagneticButton>
          <MagneticButton href="#story" onClick={() => scrollToTarget("#story")} className="border border-chai/40 text-cream">
            Our Story
          </MagneticButton>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToTarget("#pour")}
        className="hero-scroll hero-fade absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        aria-label="Scroll to the pour"
      >
        <span className="text-[10px] tracking-[0.5em] text-chai/70 uppercase">Scroll</span>
        <span className="relative block h-14 w-px overflow-hidden bg-chai/20">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollPulse_2s_ease-in-out_infinite] bg-saffron" />
        </span>
      </button>
    </section>
  );
}
