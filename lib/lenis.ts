"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

/**
 * Creates one Lenis instance and drives it from GSAP's ticker so Lenis and
 * ScrollTrigger always agree on the scroll position (no double rAF loops).
 */
export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return null; // native scrolling for reduced motion

  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.09,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
  });

  lenis.on("scroll", ScrollTrigger.update);
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis; // dev-only debug handle
  }
  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyLenis() {
  if (tick) gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
  tick = null;
}

export function getLenis() {
  return lenis;
}

/** Signed scroll velocity in px/frame, works with or without Lenis. */
let lastY = 0;
let nativeVelocity = 0;
export function getScrollVelocity() {
  if (lenis) return lenis.velocity;
  const y = window.scrollY;
  nativeVelocity = nativeVelocity * 0.8 + (y - lastY) * 0.2;
  lastY = y;
  return nativeVelocity;
}

export function scrollToTarget(target: string | HTMLElement | number) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView();
  }
}
