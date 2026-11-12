"use client";

import { useRef, type ElementType } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  /** lines slide up from a mask; words/chars also unblur */
  by?: "lines" | "words" | "chars";
  delay?: number;
  stagger?: number;
  /** viewport position that starts the reveal */
  start?: string;
};

/**
 * Text that reveals through masks as it scrolls into view, using GSAP SplitText.
 * autoSplit re-splits on font load / resize so line breaks always stay correct.
 */
export function RevealText({
  children,
  as: Tag = "p",
  className = "",
  by = "lines",
  delay = 0,
  stagger,
  start = "top 85%",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.from(el, { opacity: 0, duration: 1, scrollTrigger: { trigger: el, start } });
        return;
      }
      const split = SplitText.create(el, {
        type: by === "lines" ? "lines" : by === "words" ? "words,lines" : "chars,words,lines",
        mask: "lines",
        linesClass: "split-mask-line",
        autoSplit: true,
        onSplit(self) {
          const targets = by === "lines" ? self.lines : by === "words" ? self.words : self.chars;
          return gsap.from(targets, {
            yPercent: 110,
            opacity: by === "lines" ? 1 : 0,
            filter: by === "lines" ? "none" : "blur(8px)",
            duration: by === "chars" ? 1 : 1.2,
            ease: "expo.out",
            delay,
            stagger: stagger ?? (by === "lines" ? 0.1 : by === "words" ? 0.04 : 0.018),
            scrollTrigger: { trigger: el, start, once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [children] },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
