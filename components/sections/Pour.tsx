"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { resetSegment, segmentTrigger } from "@/lib/scroll";
import { smoothstep } from "@/lib/sceneState";
import { RevealText } from "@/components/ui/RevealText";

/** Chapter I: the cup glides aside and a ribbon of chai fills it in step with the scroll. */
export function Pour() {
  const root = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const setFill = (p: number) => {
        const pct = Math.round(42 + (90 - 42) * smoothstep(0.1, 0.86, p));
        if (fillRef.current) fillRef.current.textContent = `${pct}%`;
        if (barRef.current) barRef.current.style.transform = `scaleY(${pct / 100})`;
      };

      segmentTrigger("pourEnter", { trigger: el, start: "top bottom", end: "top top" });

      const mm = gsap.matchMedia();
      mm.add(MQ.full, () => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        tl.to(".pour-hint", { opacity: 0, duration: 0.1 }, 0.1)
          .from(".pour-quote", { opacity: 0, y: 40, duration: 0.25 }, 0.4)
          .to({}, { duration: 0.35 });
        segmentTrigger("pour", {
          trigger: el,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: true,
          animation: tl,
          anticipatePin: 1,
          onUpdate: (self) => setFill(self.progress),
        });
      });
      mm.add(MQ.stacked, () => {
        // no pinning: the pour plays across the section's own height
        segmentTrigger("pour", {
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onUpdate: (self) => setFill(self.progress),
        });
      });

      return () => {
        mm.revert();
        resetSegment("pour");
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="pour"
      className="relative flex min-h-svh items-start px-5 pt-4 pb-16 md:items-center md:px-10 md:pt-24 md:pb-8 motion-reduce:min-h-[160svh] max-md:min-h-[170svh]"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-espresso/90 via-espresso/50 to-transparent max-md:hidden" />

      <div className="relative max-w-xl max-md:sticky max-md:top-0 max-md:-mx-5 max-md:bg-gradient-to-b max-md:from-espresso max-md:from-60% max-md:to-transparent max-md:px-5 max-md:pt-24 max-md:pb-16">
        <p className="mb-6 text-[11px] tracking-[0.45em] text-saffron uppercase">Chapter I — The Pour</p>
        <RevealText as="h2" className="font-serif text-[clamp(2.4rem,4.6vw,4.6rem)] leading-[0.98] text-cream">
          Poured from height, the way it has always been done.
        </RevealText>
        <RevealText className="mt-8 max-w-md text-base leading-relaxed text-chai/85" delay={0.15}>
          On the GT Road, a chaiwala lifts the pot above his shoulder and pours a long, unbroken ribbon into the glass.
          The fall cools the tea, pulls air into the milk and leaves a soft crown of froth. Every cup we serve is
          finished the same way.
        </RevealText>

        <div className="mt-10 flex items-end gap-5">
          <span className="relative block h-24 w-2 overflow-hidden rounded-full bg-chai/15">
            <span ref={barRef} className="absolute inset-0 origin-bottom scale-y-[0.42] rounded-full bg-gradient-to-t from-[#6e3a1a] to-saffron" />
          </span>
          <div>
            <span ref={fillRef} className="block font-serif text-6xl leading-none text-cream tabular-nums">42%</span>
            <span className="mt-2 block text-[11px] tracking-[0.35em] text-chai/70 uppercase">Glass filled</span>
          </div>
        </div>

        <p className="pour-hint mt-10 hidden text-xs tracking-[0.3em] text-chai/50 uppercase md:block">Keep scrolling to pour ↓</p>
        <blockquote className="pour-quote mt-10 hidden max-w-sm border-l border-saffron/50 pl-5 font-serif text-xl italic text-chai md:block">
          “If you don&apos;t hear it, you didn&apos;t pour it high enough.”
          <span className="mt-2 block font-sans text-xs not-italic tracking-[0.3em] text-chai/60 uppercase">— Old saying, Gujranwala</span>
        </blockquote>
      </div>
    </section>
  );
}
