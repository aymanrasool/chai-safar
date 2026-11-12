"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import { useAppStore } from "@/lib/store";
import { BRAND } from "@/lib/config";
import { MagneticButton } from "./MagneticButton";

const LINKS = [
  { href: "#pour", label: "The Pour" },
  { href: "#ingredients", label: "Spices" },
  { href: "#ritual", label: "Ritual" },
  { href: "#menu", label: "Menu" },
  { href: "#story", label: "Story" },
];

export function Nav() {
  const ref = useRef<HTMLElement>(null);
  const introDone = useAppStore((s) => s.introDone);

  useEffect(() => {
    if (!introDone || !ref.current) return;
    gsap.fromTo(ref.current, { yPercent: -120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, delay: 0.9, ease: "expo.out" });
  }, [introDone]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToTarget(href);
  };

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 opacity-0 md:px-10 md:py-6"
    >
      {/* soft backing so content scrolling underneath never collides with the links */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150%] bg-gradient-to-b from-espresso via-espresso/70 to-transparent" />
      <a href="#top" onClick={(e) => go(e, "#top")} className="group flex items-center gap-3" aria-label={`${BRAND.name} home`}>
        <svg className="h-8 w-8 text-saffron transition-transform duration-700 ease-silk group-hover:rotate-180" viewBox="0 0 32 32" fill="none" aria-hidden>
          <circle cx="16" cy="16" r="15" stroke="currentColor" strokeOpacity="0.6" />
          <path d="M10 12h12l-1.6 11.5a2 2 0 0 1-2 1.5h-4.8a2 2 0 0 1-2-1.5L10 12Z" fill="currentColor" />
          <path d="M14 9c-1-1.2.8-2-.2-3.4M18 9c-1-1.2.8-2-.2-3.4" stroke="currentColor" strokeLinecap="round" />
        </svg>
        <span className="font-serif text-lg tracking-[0.2em] text-cream">{BRAND.name}</span>
      </a>

      <nav className="hidden items-center gap-8 lg:flex" aria-label="Sections">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={(e) => go(e, l.href)}
            className="group relative text-[13px] tracking-[0.18em] text-chai uppercase"
          >
            <span className="relative block overflow-hidden">
              <span className="block transition-transform duration-500 ease-silk group-hover:-translate-y-full">{l.label}</span>
              <span className="absolute inset-0 block translate-y-full text-saffron transition-transform duration-500 ease-silk group-hover:translate-y-0">
                {l.label}
              </span>
            </span>
          </a>
        ))}
      </nav>

      <MagneticButton
        href="#menu"
        onClick={() => scrollToTarget("#menu")}
        className="border border-saffron/60 bg-saffron/10 text-saffron"
      >
        Order a Cup
      </MagneticButton>
    </header>
  );
}
