"use client";

import { ScrollTrigger } from "./gsap";
import { sceneState, type SegmentName } from "./sceneState";

/**
 * A ScrollTrigger whose progress (0..1) is mirrored into sceneState.segments[name],
 * which the WebGL director reads every frame.
 */
export function segmentTrigger(name: SegmentName, vars: ScrollTrigger.StaticVars) {
  const write = (self: ScrollTrigger) => {
    sceneState.segments[name] = self.progress;
  };
  const userUpdate = vars.onUpdate;
  const userRefresh = vars.onRefresh;
  return ScrollTrigger.create({
    ...vars,
    onUpdate: (self) => {
      write(self);
      userUpdate?.(self);
    },
    onRefresh: (self) => {
      write(self);
      userRefresh?.(self);
    },
  });
}

export function resetSegment(name: SegmentName) {
  sceneState.segments[name] = 0;
}
