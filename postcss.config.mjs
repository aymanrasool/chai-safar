// Used by the webpack build (`npm run dev` / `npm run build`).
//
// This machine blocks native Node add-ons, so Tailwind's native class scanner can't load.
// tooling/tailwind-js-postcss.cjs runs Tailwind's own JS compiler with a JS scanner instead.
// On a machine where native binaries work, you can use "@tailwindcss/postcss": {} here.
const config = {
  plugins: {
    "./tooling/tailwind-js-postcss.cjs": {},
  },
};

export default config;
