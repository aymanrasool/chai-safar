"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  strength?: number;
  cursor?: string;
  ariaLabel?: string;
};

/** A button that leans toward the pointer and springs back when it leaves. */
export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  className = "",
  strength = 0.4,
  cursor = "link",
  ariaLabel,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = wrap.current;
      const txt = inner.current;
      if (!el || !txt) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      const txTo = gsap.quickTo(txt, "x", { duration: 0.6, ease: "power3" });
      const tyTo = gsap.quickTo(txt, "y", { duration: 0.6, ease: "power3" });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        xTo(x * strength);
        yTo(y * strength);
        txTo(x * strength * 0.45);
        tyTo(y * strength * 0.45);
      };
      const leave = () => {
        gsap.to([el, txt], { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" });
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: wrap },
  );

  const base =
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-500";
  const content = (
    <>
      <span className="absolute inset-0 translate-y-full rounded-full bg-cream transition-transform duration-500 ease-silk group-hover:translate-y-0" />
      <span ref={inner} className="relative z-10 inline-flex items-center gap-2 group-hover:text-espresso">
        {children}
      </span>
    </>
  );

  return (
    <div ref={wrap} className="inline-block will-change-transform">
      {href ? (
        <a href={href} onClick={onClick} className={`${base} ${className}`} data-cursor={cursor} aria-label={ariaLabel}>
          {content}
        </a>
      ) : (
        <button type={type} onClick={onClick} className={`${base} ${className}`} data-cursor={cursor} aria-label={ariaLabel}>
          {content}
        </button>
      )}
    </div>
  );
}
