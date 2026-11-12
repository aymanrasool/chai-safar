"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Dot + trailing ring. Grows and blends (difference) over links/buttons; over elements
 * with `data-cursor="Sip"` (or any text) it becomes a saffron disc showing that label.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    // enabling after mount avoids a hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current || !label.current) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current;
    const r = ring.current;
    const l = label.current;

    gsap.set([d, r], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });

    let mode: "none" | "link" | "label" = "none";
    const setMode = (next: typeof mode, text = "") => {
      if (next === mode && (next !== "label" || l.textContent === text)) return;
      mode = next;
      if (next === "label") {
        l.textContent = text;
        gsap.to(r, { width: 92, height: 92, backgroundColor: "#e8a33d", borderColor: "#e8a33d", mixBlendMode: "normal", duration: 0.45, ease: "expo.out" });
        gsap.to(l, { opacity: 1, scale: 1, duration: 0.35, delay: 0.05 });
        gsap.to(d, { scale: 0, duration: 0.25 });
      } else if (next === "link") {
        gsap.to(r, { width: 64, height: 64, backgroundColor: "#f5ede1", borderColor: "#f5ede1", mixBlendMode: "difference", duration: 0.45, ease: "expo.out" });
        gsap.to(l, { opacity: 0, scale: 0.6, duration: 0.2 });
        gsap.to(d, { scale: 0, duration: 0.25 });
      } else {
        gsap.to(r, { width: 36, height: 36, backgroundColor: "rgba(245,237,225,0)", borderColor: "rgba(217,179,140,0.6)", mixBlendMode: "normal", duration: 0.45, ease: "expo.out" });
        gsap.to(l, { opacity: 0, scale: 0.6, duration: 0.2 });
        gsap.to(d, { scale: 1, duration: 0.25 });
      }
    };

    const onMove = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button, input, label");
      if (!el) return setMode("none");
      const text = el.dataset.cursor;
      if (text && text !== "link") setMode("label", text);
      else setMode("link");
    };
    const onDown = () => gsap.to(r, { scale: 0.85, duration: 0.2 });
    const onUp = () => gsap.to(r, { scale: 1, duration: 0.3 });
    const onLeave = () => gsap.to([d, r], { opacity: 0, duration: 0.3 });
    const onEnter = () => gsap.to([d, r], { opacity: 1, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed top-0 left-0 z-[120] flex h-9 w-9 items-center justify-center rounded-full border border-chai/60"
      >
        <span
          ref={label}
          className="scale-50 font-sans text-[11px] font-semibold tracking-[0.2em] text-espresso uppercase opacity-0"
        />
      </div>
      <div ref={dot} className="pointer-events-none fixed top-0 left-0 z-[121] h-1.5 w-1.5 rounded-full bg-saffron" />
    </>
  );
}
