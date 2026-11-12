"use client";

import { useRef } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { resetSegment, segmentTrigger } from "@/lib/scroll";
import { sceneState } from "@/lib/sceneState";
import { INGREDIENTS } from "@/lib/content";

const PANELS = INGREDIENTS.length + 1; // intro panel + one per spice

/**
 * Chapter II. Desktop: a pinned horizontal track, and each 3D spice rides beside its
 * own card. Mobile / reduced motion: cards stack vertically and the spice for the card
 * in view floats above it.
 */
export function Ingredients() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const tr = track.current!;
      segmentTrigger("ingredientsEnter", {
        trigger: el,
        start: "top bottom",
        end: "top top",
        onLeaveBack: () => {
          sceneState.featured = 0;
        },
      });

      const mm = gsap.matchMedia();

      mm.add(MQ.full, () => {
        sceneState.stacked = false;
        sceneState.featured = 0;
        const distance = () => tr.scrollWidth - window.innerWidth;
        const tween = gsap.to(tr, { x: () => -distance(), ease: "none" });
        segmentTrigger("ingredients", {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true, // 1:1 so the 3D spices stay locked to their cards
          animation: tween,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            sceneState.featured = self.progress * (PANELS - 1);
          },
          onRefresh: (self) => {
            sceneState.featured = self.progress * (PANELS - 1);
          },
        });

        // card contents slide in as their panel arrives
        gsap.utils.toArray<HTMLElement>(".ing-card").forEach((card) => {
          gsap.from(card.querySelectorAll(".ing-rise"), {
            yPercent: 60,
            opacity: 0,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 85%",
              end: "left 45%",
              scrub: true,
            },
          });
        });
        gsap.utils.toArray<HTMLElement>(".ing-ghost").forEach((ghost) => {
          gsap.fromTo(
            ghost,
            { xPercent: 25 },
            {
              xPercent: -25,
              ease: "none",
              scrollTrigger: {
                trigger: ghost.parentElement!,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
      });

      mm.add(MQ.stacked, () => {
        sceneState.stacked = true;
        sceneState.featured = -1;
        const cards = gsap.utils.toArray<HTMLElement>(".ing-panel[data-index]");
        cards.forEach((panel) => {
          const i = Number(panel.dataset.index);
          ScrollTrigger.create({
            trigger: panel,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (self.isActive) sceneState.featured = i;
              else if (sceneState.featured === i) sceneState.featured = -1;
            },
          });
          gsap.from(panel.querySelectorAll(".ing-rise"), {
            y: 40,
            opacity: 0,
            stagger: 0.07,
            duration: 1,
            scrollTrigger: { trigger: panel, start: "top 70%", once: true },
          });
        });
      });

      return () => {
        mm.revert();
        resetSegment("ingredients");
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="ingredients" className="relative overflow-hidden">
      <div
        ref={track}
        className="flex flex-col md:h-svh md:w-max md:flex-row md:motion-reduce:h-auto md:motion-reduce:w-full md:motion-reduce:flex-col"
      >
        {/* Intro panel */}
        <div className="ing-panel relative flex min-h-svh w-full shrink-0 flex-col justify-center px-5 py-24 md:w-screen md:px-16">
          <p className="mb-6 text-[11px] tracking-[0.45em] text-saffron uppercase">Chapter II — The Spice Route</p>
          <h2 className="max-w-4xl font-serif text-[clamp(2.8rem,7vw,7rem)] leading-[0.92] text-cream">
            Five spices, <em className="text-chai">two thousand years</em> of trade.
          </h2>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-chai/85">
            Long before chai had a name, these spices crossed deserts on camel back and oceans in the holds of dhows.
            Each one still carries its place of origin. Scroll sideways to meet them.
          </p>
          <div className="mt-12 hidden items-center gap-4 text-[11px] tracking-[0.4em] text-chai/60 uppercase md:flex md:motion-reduce:hidden">
            <span className="h-px w-16 bg-saffron/60" /> Drag your scroll wheel
          </div>
        </div>

        {INGREDIENTS.map((ing, i) => (
          <div
            key={ing.key}
            data-index={i}
            className="ing-panel relative flex min-h-svh w-full shrink-0 items-end overflow-hidden px-5 pt-[52svh] pb-16 md:w-screen md:items-center md:justify-end md:px-16 md:py-0"
          >
            <span
              className="ing-ghost text-outline pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 font-serif text-[30vw] leading-none whitespace-nowrap italic opacity-40 select-none md:text-[22vw]"
              aria-hidden
            >
              {ing.native}
            </span>

            <article className="ing-card relative w-full max-w-md rounded-3xl border border-chai/15 bg-espresso/85 p-7 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] md:mr-[4vw] md:p-10">
              <div className="ing-rise flex items-center justify-between text-[11px] tracking-[0.4em] text-saffron uppercase">
                <span>
                  {String(i + 1).padStart(2, "0")} / {String(INGREDIENTS.length).padStart(2, "0")}
                </span>
                <span className="text-chai/60">{ing.native}</span>
              </div>
              <h3 className="ing-rise mt-6 font-serif text-4xl leading-tight text-cream md:text-5xl">{ing.name}</h3>
              <p className="ing-rise mt-3 flex items-center gap-2 text-sm text-chai">
                <svg className="h-4 w-4 text-cardamom" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
                {ing.origin}
              </p>
              <p className="ing-rise mt-6 border-y border-chai/10 py-4 font-serif text-lg italic text-saffron">{ing.flavor}</p>
              <p className="ing-rise mt-6 text-[15px] leading-relaxed text-chai/85">{ing.body}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
