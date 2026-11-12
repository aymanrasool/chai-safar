"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

let registered = false;

export function registerGSAP() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

registerGSAP();

/** Media query shared by every section: big screens with motion allowed get the full show. */
export const MQ = {
  full: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  stacked: "(max-width: 767px), (prefers-reduced-motion: reduce)",
  reduced: "(prefers-reduced-motion: reduce)",
};

export { gsap, ScrollTrigger, SplitText, useGSAP };
