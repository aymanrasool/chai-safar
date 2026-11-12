/**
 * Site-wide configuration. Change the brand name here and it updates everywhere.
 */
export const BRAND = {
  name: "CHAI SAFAR",
  short: "Chai Safar",
  tagline: "Every Sip Tells a Story",
  city: "Lahore · Karachi · London",
};

/**
 * 3D cup model.
 * - `url: null`  → the procedural fluted "cutting chai" glass is used.
 * - `url: "/models/cup.glb"` → your own model is loaded with useGLTF.
 *
 * The chai liquid, steam and pour stream are always procedural and are sized from
 * `inner` (the inside of the cup, in model units after `scale`). Tweak these so the
 * liquid fits snugly inside your model.
 */
export const CUP_MODEL = {
  url: null as string | null,
  scale: 1,
  /** y offset applied to the GLB so its base sits at y = 0 */
  offsetY: 0,
  inner: {
    bottomY: 0.16,
    topY: 1.46,
    bottomRadius: 0.5,
    topRadius: 0.685,
  },
};

export const COLORS = {
  espresso: "#1a0f0a",
  chai: "#d9b38c",
  saffron: "#e8a33d",
  cardamom: "#7a8b5a",
  cream: "#f5ede1",
};
