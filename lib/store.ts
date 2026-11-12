"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny UI store (React-facing). Anything that changes every frame lives in
 * `sceneState` instead, so React never re-renders on scroll or mouse move.
 */
export type AppState = {
  /** The 3D scene has mounted and rendered its first frame */
  sceneReady: boolean;
  /** Preloader finished and curtain revealed the hero */
  introDone: boolean;
  /** Whether the WebGL canvas is visible (paused behind opaque sections) */
  canvasActive: boolean;
};

const initial: AppState = { sceneReady: false, introDone: false, canvasActive: true };
let state: AppState = initial;
const listeners = new Set<() => void>();

export const appStore = {
  get: () => state,
  set(partial: Partial<AppState>) {
    const next = { ...state, ...partial };
    const changed = (Object.keys(partial) as (keyof AppState)[]).some((k) => next[k] !== state[k]);
    if (!changed) return;
    state = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useAppStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    appStore.subscribe,
    () => selector(state),
    () => selector(initial),
  );
}
