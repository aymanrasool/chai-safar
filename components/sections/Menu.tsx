"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { segmentTrigger } from "@/lib/scroll";
import { DEFAULT_LIQUID, sceneState } from "@/lib/sceneState";
import { MENU, type Chai } from "@/lib/content";
import { RevealText } from "@/components/ui/RevealText";

function ChaiCard({ chai, index }: { chai: Chai; index: number }) {
  const card = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = card.current!;
      const canTilt =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const rx = gsap.quickTo(el, "rotateX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(el, "rotateY", { duration: 0.6, ease: "power3" });

      const enter = () => {
        sceneState.liquidColor = chai.color;
        if (canTilt) gsap.to(el, { z: 40, duration: 0.6, ease: "power3.out" });
        gsap.to(glare.current, { opacity: 1, duration: 0.4 });
      };
      const move = (e: PointerEvent) => {
        if (!canTilt) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 22);
        rx(-(py - 0.5) * 22);
        if (glare.current) {
          glare.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,236,205,0.22), transparent 55%)`;
        }
      };
      const leave = () => {
        gsap.to(el, { rotateX: 0, rotateY: 0, z: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
        gsap.to(glare.current, { opacity: 0, duration: 0.5 });
      };

      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("focus", enter);
      return () => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("focus", enter);
      };
    },
    { scope: card },
  );

  return (
    <div className="menu-card [perspective:900px]">
      <div
        ref={card}
        tabIndex={0}
        data-cursor="Sip"
        className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-chai/15 bg-espresso-2/80 p-6 outline-none [transform-style:preserve-3d] backdrop-blur-md focus-visible:ring-2 focus-visible:ring-saffron"
      >
        <div ref={glare} className="pointer-events-none absolute inset-0 opacity-0" />
        <div className="flex items-start justify-between [transform:translateZ(30px)]">
          <span className="text-[11px] tracking-[0.35em] text-chai/60">{String(index + 1).padStart(2, "0")}</span>
          <span
            className="block h-12 w-12 rounded-full shadow-[inset_-6px_-8px_14px_rgba(0,0,0,0.35),0_10px_30px_-6px_var(--glow)]"
            style={{
              background: `radial-gradient(circle at 35% 30%, #f5ede1 0%, ${chai.color} 45%, #1a0f0a 120%)`,
              ["--glow" as string]: chai.color,
            }}
            aria-hidden
          />
        </div>
        <div className="mt-10 [transform:translateZ(50px)]">
          <p className="font-serif text-lg text-chai/70" lang="ur" dir="rtl">
            {chai.native}
          </p>
          <h3 className="mt-1 font-serif text-3xl leading-tight text-cream">{chai.name}</h3>
          <p className="mt-2 text-[11px] tracking-[0.25em] text-saffron uppercase">{chai.note}</p>
        </div>
        <p className="mt-5 flex-1 text-sm leading-relaxed text-chai/80 [transform:translateZ(20px)]">{chai.body}</p>
        <div className="mt-6 flex items-center justify-between border-t border-chai/10 pt-4 [transform:translateZ(30px)]">
          <span className="font-serif text-2xl text-cream">{chai.price}</span>
          <span className="text-[11px] tracking-[0.3em] text-chai/60 uppercase">Glass · Kulhad</span>
        </div>
      </div>
    </div>
  );
}

/** Chapter IV: hover a cup on the menu and the chai in the glass changes to match. */
export function Menu() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      segmentTrigger("menuEnter", {
        trigger: el,
        start: "top bottom",
        end: "top top",
        onLeaveBack: () => {
          sceneState.liquidColor = DEFAULT_LIQUID;
        },
      });
      gsap.from(".menu-card", {
        y: 80,
        opacity: 0,
        rotateX: -12,
        stagger: 0.08,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: ".menu-grid", start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="menu"
      className="relative min-h-svh px-5 pt-[46svh] pb-24 md:px-10 md:pt-32"
      onPointerLeave={() => {
        sceneState.liquidColor = DEFAULT_LIQUID;
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-espresso via-espresso/70 to-transparent max-md:bg-gradient-to-t" />
      <div className="relative md:w-[62%]">
        <p className="text-[11px] tracking-[0.45em] text-saffron uppercase">Chapter IV — The Menu</p>
        <RevealText as="h2" className="mt-4 font-serif text-[clamp(2.6rem,5.5vw,5.2rem)] leading-[0.95] text-cream">
          Five cups, five journeys. Hover to pour.
        </RevealText>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-chai/85">
          Each recipe comes from a different stretch of the road. Move over a card and watch the glass change: pink for
          the valleys of Kashmir, gold for saffron, deep mahogany for a karak that lasts the whole night.
        </p>

        <div className="menu-grid mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {MENU.map((c, i) => (
            <ChaiCard key={c.name} chai={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
