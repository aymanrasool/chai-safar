"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { resetSegment, segmentTrigger } from "@/lib/scroll";
import { RITUAL_STEPS } from "@/lib/content";

/** Chapter III: the camera circles the glass once while the five steps of the brew play out. */
export function Ritual() {
  const root = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      segmentTrigger("ritualEnter", { trigger: el, start: "top bottom", end: "top top" });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".ritual-step");
        const dots = gsap.utils.toArray<HTMLElement>(".ritual-dot");
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        // opacity + transform only: both stay on the compositor, so scrubbing is free
        gsap.set(steps, { autoAlpha: 0, y: 60 });

        steps.forEach((step, i) => {
          const at = i * 1;
          tl.to(step, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, at + 0.1)
            .to(dots[i], { backgroundColor: "#e8a33d", scale: 1.6, duration: 0.2 }, at + 0.1);
          if (i < steps.length - 1) {
            tl.to(step, { autoAlpha: 0, y: -60, duration: 0.3, ease: "power2.in" }, at + 0.8).to(
              dots[i],
              { backgroundColor: "rgba(217,179,140,0.3)", scale: 1, duration: 0.2 },
              at + 0.85,
            );
          }
        });
        tl.to({}, { duration: 0.2 });

        segmentTrigger("ritual", {
          trigger: el,
          start: "top top",
          end: "+=420%",
          pin: true,
          scrub: true,
          animation: tl,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
          },
        });
      });

      // reduced motion: steps are simply listed, no orbit
      mm.add(MQ.reduced, () => {
        gsap.from(".ritual-step", { opacity: 0, stagger: 0.15, scrollTrigger: { trigger: el, start: "top 70%" } });
      });

      return () => {
        mm.revert();
        resetSegment("ritual");
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="ritual" className="relative h-svh overflow-hidden motion-reduce:h-auto motion-reduce:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(26,15,10,0.85)_100%)]" />

      <div className="relative flex h-full flex-col justify-between px-5 pt-24 pb-10 md:px-10 md:pt-28 motion-reduce:h-auto">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.45em] text-saffron uppercase">Chapter III — The Ritual</p>
            <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight text-cream md:text-6xl">
              Five steps. <em className="text-chai">No shortcuts.</em>
            </h2>
          </div>
          <div className="hidden flex-col items-end gap-3 md:flex motion-reduce:hidden" aria-hidden>
            {RITUAL_STEPS.map((s) => (
              <div key={s.n} className="flex items-center gap-3 text-[11px] tracking-[0.3em] text-chai/60 uppercase">
                {s.title}
                <span className="ritual-dot block h-1.5 w-1.5 rounded-full bg-chai/30" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[14rem] md:min-h-[20rem] motion-reduce:min-h-0">
          <ol className="motion-reduce:space-y-12">
            {RITUAL_STEPS.map((s) => (
              <li
                key={s.n}
                className="ritual-step absolute bottom-0 left-0 max-w-md rounded-3xl bg-espresso/75 p-5 md:max-w-lg md:bg-transparent md:p-0 motion-reduce:relative motion-reduce:opacity-100"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-5xl leading-none text-saffron md:text-8xl">{s.n}</span>
                  <span className="font-serif text-xl italic text-chai/70">{s.native}</span>
                </div>
                <h3 className="mt-2 font-serif text-3xl text-cream md:mt-3 md:text-6xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-chai/85 md:mt-4 md:text-base">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex items-center gap-4 motion-reduce:hidden">
          <span className="text-[10px] tracking-[0.4em] text-chai/60 uppercase">Brewing</span>
          <span className="relative block h-px flex-1 bg-chai/20">
            <span ref={progressRef} className="absolute inset-0 origin-left scale-x-0 bg-saffron" />
          </span>
          <span className="text-[10px] tracking-[0.4em] text-chai/60 uppercase">Served</span>
        </div>
      </div>
    </section>
  );
}
