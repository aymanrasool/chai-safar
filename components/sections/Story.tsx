"use client";

/* eslint-disable @next/next/no-img-element -- decorative SVG layers, no optimisation needed */
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { segmentTrigger } from "@/lib/scroll";
import { appStore } from "@/lib/store";
import { STORY } from "@/lib/content";
import { RevealText } from "@/components/ui/RevealText";

const LAYERS = [
  { src: "/images/story/sky.svg", depth: 0.06 },
  { src: "/images/story/hills.svg", depth: 0.14 },
  { src: "/images/story/dhaba.svg", depth: 0.24 },
  { src: "/images/story/foreground.svg", depth: 0.38 },
];

/**
 * Chapter V. Layered dusk scene of a GT Road dhaba with deep parallax, opening through
 * a clip-path mask. Copy reveals line by line and a closing line fills with light.
 */
export function Story() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // the cup floats away and the canvas sleeps while opaque sections cover it
      segmentTrigger("storyEnter", { trigger: el, start: "top bottom", end: "top 20%" });
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => ScrollTrigger.maxScroll(window) + 1,
        onToggle: (self) => appStore.set({ canvasActive: !self.isActive }),
      });

      // stats count up
      gsap.utils.toArray<HTMLElement>(".story-stat").forEach((s) => {
        const target = Number(s.dataset.value);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: reduced ? 0.01 : 2,
          ease: "power2.out",
          scrollTrigger: { trigger: s, start: "top 85%", once: true },
          onUpdate: () => {
            s.textContent = Math.round(obj.v).toLocaleString("en-US");
          },
        });
      });

      if (reduced) return;

      const frame = el.querySelector<HTMLElement>(".story-frame")!;
      gsap.fromTo(
        frame,
        { clipPath: "inset(18% 14% 18% 14% round 40px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 28px)",
          ease: "none",
          scrollTrigger: { trigger: frame, start: "top 95%", end: "top 15%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>(".story-layer").forEach((layer) => {
        const depth = Number(layer.dataset.depth);
        // layers are 130% of the frame height, so ±11% travel never exposes an edge
        gsap.fromTo(
          layer,
          { yPercent: depth * 30 },
          {
            yPercent: -depth * 30,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      gsap.from(".story-frame-title", {
        yPercent: 120,
        ease: "expo.out",
        duration: 1.6,
        scrollTrigger: { trigger: frame, start: "top 40%", once: true },
      });

      // closing line fills with light, one line after another
      const split = SplitText.create(".story-fill", {
        type: "lines",
        linesClass: "story-fill-line",
        autoSplit: true,
        onSplit(self) {
          return gsap.to(self.lines, {
            backgroundPositionX: "0%",
            ease: "none",
            stagger: 0.5,
            scrollTrigger: { trigger: ".story-fill", start: "top 80%", end: "bottom 45%", scrub: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="story" className="relative z-10 bg-espresso-2 px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] tracking-[0.45em] text-saffron uppercase">Chapter V — {STORY.eyebrow}</p>
        <RevealText as="h2" className="mt-6 max-w-5xl font-serif text-[clamp(2.8rem,7.5vw,7.5rem)] leading-[0.92] text-cream">
          {STORY.title}
        </RevealText>
      </div>

      <div className="story-frame relative mx-auto mt-16 h-[70svh] max-w-[1600px] overflow-hidden rounded-[28px] md:mt-24 md:h-[105svh]">
        {LAYERS.map((l) => (
          <img
            key={l.src}
            src={l.src}
            alt=""
            data-depth={l.depth}
            className="story-layer absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover will-change-transform"
            draggable={false}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-espresso/30" />
        <div className="absolute inset-x-0 top-[12%] overflow-hidden text-center">
          <p className="story-frame-title font-serif text-[18vw] leading-none text-cream/90 italic mix-blend-overlay md:text-[14vw]">
            Safar
          </p>
        </div>
        <div className="absolute right-6 bottom-6 left-6 flex flex-col justify-between gap-3 text-[11px] tracking-[0.35em] text-cream/80 uppercase md:right-10 md:bottom-10 md:left-10 md:flex-row">
          <span>Safar (n.) — the journey</span>
          <span>Peshawar → Lahore · Two winters on the road</span>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl gap-14 md:mt-32 md:grid-cols-[1.3fr_1fr] md:gap-24">
        <div className="space-y-8">
          {STORY.paragraphs.map((p, i) => (
            <RevealText key={i} className="text-lg leading-relaxed text-chai/90 md:text-xl">
              {p}
            </RevealText>
          ))}
        </div>
        <dl className="grid grid-cols-3 gap-6 self-end md:grid-cols-1 md:gap-10">
          {STORY.stats.map((s) => (
            <div key={s.label} className="border-t border-chai/15 pt-5">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="story-stat block font-serif text-4xl text-cream md:text-7xl" data-value={s.value.replace(/,/g, "")}>
                  {s.value}
                </span>
                <span className="mt-2 block text-[11px] leading-snug tracking-[0.25em] text-chai/60 uppercase">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="story-fill mx-auto mt-28 max-w-6xl text-center font-serif text-[clamp(2.2rem,5.5vw,5.5rem)] leading-[1.05] md:mt-44">
        Chai isn&apos;t just a drink. It&apos;s a pause on a long road, shared with whoever sits down beside you.
      </p>
    </section>
  );
}
