"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getScrollVelocity } from "@/lib/lenis";
import { MARQUEE_NAMES } from "@/lib/content";

/**
 * Infinite marquee of chai names. Scrolling speeds it up, scrolling up reverses it,
 * and fast scrolling skews the type, like a ribbon being tugged.
 */
export function Marquee({ reverse = false, className = "" }: { reverse?: boolean; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let x = 0;
      let dir = reverse ? 1 : -1;
      let skew = 0;
      const setX = gsap.quickSetter(el, "x", "px");
      const setSkew = gsap.quickSetter(el, "skewX", "deg");

      const tick = (_t: number, deltaMs: number) => {
        const half = el.scrollWidth / 2;
        if (!half) return;
        const v = getScrollVelocity();
        if (Math.abs(v) > 0.2) dir = (v > 0 ? -1 : 1) * (reverse ? -1 : 1);
        const base = reduced ? 0.25 : 0.9;
        const speed = base + Math.min(Math.abs(v) * 0.6, 22);
        x += dir * speed * (deltaMs / 16.67);
        // wrap seamlessly: the track holds two identical copies
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        setX(x);
        if (!reduced) {
          skew += (gsap.utils.clamp(-12, 12, -v * 0.35) - skew) * 0.12;
          setSkew(skew);
        }
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  const items = [...MARQUEE_NAMES, ...MARQUEE_NAMES];
  return (
    <div
      ref={root}
      className={`relative overflow-hidden border-y border-chai/15 bg-espresso/60 py-6 backdrop-blur-sm md:py-8 ${className}`}
      aria-label="Our chais"
    >
      <div ref={track} className="flex w-max items-center will-change-transform">
        {items.map((name, i) => (
          <span key={i} className="flex items-center" aria-hidden={i >= MARQUEE_NAMES.length}>
            <span
              className={`px-6 font-serif text-5xl whitespace-nowrap md:px-10 md:text-7xl ${
                i % 2 ? "text-outline italic" : "text-cream"
              }`}
            >
              {name}
            </span>
            <svg className="h-6 w-6 shrink-0 text-saffron md:h-8 md:w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
