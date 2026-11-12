"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { appStore } from "@/lib/store";
import { BRAND } from "@/lib/config";

/**
 * Counter 0 → 100 while a glass fills with chai. It holds at 90 until the 3D scene has
 * actually rendered (or a safety timeout passes), then the curtain wipes up into the hero.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<SVGRectElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const counter = { v: 0 };
      const FILL_TOP = 26;
      const FILL_BOTTOM = 150;

      const render = () => {
        const v = Math.round(counter.v);
        if (countRef.current) countRef.current.textContent = String(v).padStart(3, "0");
        if (fillRef.current) {
          const y = FILL_BOTTOM - (FILL_BOTTOM - FILL_TOP) * (counter.v / 100);
          fillRef.current.setAttribute("y", String(y));
        }
      };

      gsap.from(".pl-in", { opacity: 0, y: 24, duration: 0.9, stagger: 0.08, ease: "power3.out" });

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        const tl = gsap.timeline({
          onComplete: () => {
            if (root.current) root.current.style.display = "none";
          },
        });
        tl.to(counter, { v: 100, duration: reduced ? 0.3 : 0.7, ease: "power2.out", onUpdate: render })
          .to(".pl-in", { opacity: 0, y: -30, duration: 0.6, stagger: 0.04, ease: "power3.in" }, "+=0.15")
          .add(() => {
            // the page underneath is live from the moment the curtain starts to lift
            if (root.current) root.current.style.pointerEvents = "none";
            appStore.set({ introDone: true });
          }, reduced ? "-=0.2" : "+=0.05")
          .to(
            curtainRef.current,
            { clipPath: "inset(0% 0% 100% 0%)", duration: reduced ? 0.5 : 1.3, ease: "expo.inOut" },
            "<",
          )
          .to(".pl-band", { scaleY: 0, duration: 1.1, ease: "expo.inOut", stagger: 0.06, transformOrigin: "top" }, "<0.1");
      };

      const tryFinish = () => {
        if (appStore.get().sceneReady && counter.v >= 89) finish();
      };

      gsap.to(counter, {
        v: 90,
        duration: reduced ? 0.8 : 2.4,
        ease: "power2.inOut",
        onUpdate: render,
        onComplete: tryFinish,
      });
      const unsub = appStore.subscribe(tryFinish);
      // never trap visitors behind the loader if WebGL is slow or unavailable
      const safety = window.setTimeout(finish, 9000);

      return () => {
        unsub();
        window.clearTimeout(safety);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="fixed inset-0 z-[100]" aria-live="polite" aria-label="Loading">
      {/* trailing bands follow the curtain for a layered wipe */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="pl-band h-full flex-1 bg-saffron/90" style={{ opacity: 0.16 + i * 0.06 }} />
        ))}
      </div>
      <div
        ref={curtainRef}
        className="absolute inset-0 flex flex-col items-center justify-center bg-espresso"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <p className="pl-in absolute top-8 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.5em] text-chai/70 uppercase">
          {BRAND.name}
        </p>

        <svg className="pl-in h-40 w-32 md:h-48 md:w-40" viewBox="0 0 120 160" fill="none" aria-hidden>
          <defs>
            <clipPath id="pl-cup">
              <path d="M18 22 L102 22 L92 150 Q60 156 28 150 Z" />
            </clipPath>
            <linearGradient id="pl-chai" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e3b98d" />
              <stop offset="0.25" stopColor="#b9773f" />
              <stop offset="1" stopColor="#6e3a1a" />
            </linearGradient>
          </defs>
          <g clipPath="url(#pl-cup)">
            <rect ref={fillRef} x="0" y="150" width="120" height="160" fill="url(#pl-chai)" />
          </g>
          <path d="M18 22 L102 22 L92 150 Q60 156 28 150 Z" stroke="#d9b38c" strokeOpacity="0.8" strokeWidth="1.5" />
          {[32, 46, 60, 74, 88].map((x) => (
            <line key={x} x1={x} y1="26" x2={x + (60 - x) * 0.12} y2="148" stroke="#d9b38c" strokeOpacity="0.18" />
          ))}
          <path className="animate-pulse" d="M52 14 C46 6 58 2 52 -6 M66 14 C60 6 72 2 66 -6" stroke="#f5ede1" strokeOpacity="0.45" strokeLinecap="round" />
        </svg>

        <p className="pl-in mt-8 font-serif text-lg italic text-chai/80">Brewing your cup…</p>

        <div className="pl-in absolute right-6 bottom-6 md:right-12 md:bottom-10">
          <span ref={countRef} className="font-serif text-7xl leading-none text-cream tabular-nums md:text-[9rem]">
            000
          </span>
        </div>
        <p className="pl-in absolute bottom-8 left-6 max-w-[16rem] text-xs leading-relaxed text-chai/60 md:left-12">
          Simmering ginger, cracking cardamom, warming the milk.
        </p>
      </div>
    </div>
  );
}
