"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { BRAND } from "@/lib/config";
import { scrollToTarget } from "@/lib/lenis";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Marquee } from "@/components/ui/Marquee";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "TikTok", href: "https://www.tiktok.com/" },
  { label: "YouTube", href: "https://www.youtube.com/" },
  { label: "Pinterest", href: "https://www.pinterest.com/" },
];

/** Chapter VI: the brand name is drawn in outline, then fills with saffron as you arrive. */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(".brand-fill", { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }
      gsap.fromTo(
        ".brand-fill",
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: ".brand-wrap", start: "top 95%", end: "bottom bottom", scrub: true },
        },
      );
      gsap.from(".foot-rise", {
        y: 50,
        opacity: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
    },
    { scope: root },
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Front-end only: wire this up to your mailing-list provider's API.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("done");
    setEmail("");
  };

  return (
    <footer ref={root} id="visit" className="relative z-10 overflow-hidden bg-espresso">
      <Marquee reverse className="bg-espresso" />

      <div className="mx-auto grid max-w-7xl gap-16 px-5 pt-24 md:grid-cols-[1.4fr_1fr_1fr] md:px-10 md:pt-32">
        <div className="foot-rise">
          <p className="text-[11px] tracking-[0.45em] text-saffron uppercase">The Chai Letter</p>
          <h3 className="mt-5 max-w-md font-serif text-4xl leading-tight text-cream md:text-5xl">
            Recipes, road stories and first sips of new blends.
          </h3>
          <form onSubmit={submit} className="mt-8 flex max-w-md flex-col gap-4 sm:flex-row sm:items-center" noValidate>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="you@example.com"
              className="w-full flex-1 rounded-full border border-chai/25 bg-transparent px-6 py-3.5 text-sm text-cream placeholder:text-chai/40 focus:border-saffron focus:outline-none"
              aria-invalid={status === "error"}
              aria-describedby="email-status"
            />
            <MagneticButton type="submit" className="bg-saffron text-espresso">
              Subscribe
            </MagneticButton>
          </form>
          <p id="email-status" className="mt-3 h-5 text-sm text-chai/80" role="status">
            {status === "done" && "You're on the list. The first letter goes out with the next full moon."}
            {status === "error" && "That email doesn't look quite right."}
          </p>
        </div>

        <div className="foot-rise space-y-8 text-sm text-chai/80">
          <div>
            <p className="mb-3 text-[11px] tracking-[0.4em] text-saffron uppercase">Visit</p>
            <p>Anarkali Bazaar, Lahore</p>
            <p>Burns Road, Karachi</p>
            <p>Brick Lane, London</p>
          </div>
          <div>
            <p className="mb-3 text-[11px] tracking-[0.4em] text-saffron uppercase">Hours</p>
            <p>Every day · 7am until the last cup</p>
          </div>
        </div>

        <div className="foot-rise text-sm">
          <p className="mb-3 text-[11px] tracking-[0.4em] text-saffron uppercase">Follow the road</p>
          <ul className="space-y-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 font-serif text-2xl text-cream transition-colors duration-300 hover:text-saffron"
                >
                  {s.label}
                  <span className="inline-block transition-transform duration-500 ease-silk group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            className="mt-10 text-[11px] tracking-[0.4em] text-chai/60 uppercase transition-colors hover:text-saffron"
          >
            Back to the first sip ↑
          </button>
        </div>
      </div>

      <div className="brand-wrap relative mt-24 px-3 pb-6 select-none md:mt-32" aria-hidden>
        <p className="text-outline text-center font-serif text-[15.5vw] leading-[0.8] font-bold tracking-tight whitespace-nowrap">
          {BRAND.name}
        </p>
        <p
          className="brand-fill absolute inset-x-3 top-0 bg-gradient-to-b from-saffron via-[#d98a2b] to-[#7a3f1d] bg-clip-text text-center font-serif text-[15.5vw] leading-[0.8] font-bold tracking-tight whitespace-nowrap text-transparent"
          style={{ clipPath: "inset(0% 100% 0% 0%)" }}
        >
          {BRAND.name}
        </p>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-chai/10 px-5 py-6 text-[11px] tracking-[0.3em] text-chai/50 uppercase md:flex-row md:px-10">
        <span>
          © {BRAND.short} · {BRAND.city}
        </span>
        <span>Brewed slowly · Poured from height</span>
      </div>
    </footer>
  );
}
