/**
 * Tailwind CSS v4 for machines where native Node add-ons are blocked
 * (for example by Windows Application Control / Smart App Control).
 *
 * The official @tailwindcss/postcss plugin uses a native Rust "oxide" scanner to find
 * class names. This plugin keeps Tailwind's own JS compiler (@tailwindcss/node) and swaps
 * only the scanner for a simple JavaScript tokenizer. Tailwind discards tokens that aren't
 * valid utilities, so over-collecting is harmless.
 *
 * If native binaries work on your machine you can switch postcss.config.mjs back to
 * "@tailwindcss/postcss" and use `npm run dev:turbo`.
 */
const fs = require("node:fs");
const path = require("node:path");
const { compile, optimize } = require("@tailwindcss/node");

const SCAN_DIRS = ["app", "components", "lib"];
const SCAN_EXT = /\.(tsx?|jsx?|mdx?|html)$/;
const SPLIT = /[\s"'`{}<>;]+/;

function collectFiles(root) {
  const files = [];
  for (const dir of SCAN_DIRS) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const rel of fs.readdirSync(abs, { recursive: true })) {
      if (SCAN_EXT.test(rel)) files.push(path.join(abs, rel));
    }
  }
  return files;
}

function collectCandidates(files) {
  const out = new Set();
  for (const file of files) {
    for (const token of fs.readFileSync(file, "utf8").split(SPLIT)) {
      if (token && token.length < 200) out.add(token);
    }
  }
  return [...out];
}

/** @type {import('postcss').PluginCreator<{ base?: string }>} */
module.exports = (opts = {}) => ({
  postcssPlugin: "tailwindcss-js-scanner",
  async Once(root, { result, postcss }) {
    const css = root.toString();
    if (!/@import\s+["']tailwindcss|@theme|@tailwind/.test(css)) return;

    const base = opts.base || process.cwd();
    const from = result.opts.from;
    const dependencies = new Set();

    const compiler = await compile(css, {
      base: from ? path.dirname(from) : base,
      from,
      onDependency: (p) => dependencies.add(p),
    });

    const files = collectFiles(base);
    let output = compiler.build(collectCandidates(files));
    if (process.env.NODE_ENV === "production") output = optimize(output, { minify: true }).code;

    root.removeAll();
    root.append(postcss.parse(output, result.opts));

    // let webpack rebuild the CSS when any source file (or a new one) changes
    for (const file of [...files, ...dependencies]) {
      result.messages.push({ type: "dependency", plugin: "tailwindcss-js-scanner", file, parent: from });
    }
    for (const dir of SCAN_DIRS) {
      result.messages.push({
        type: "dir-dependency",
        plugin: "tailwindcss-js-scanner",
        dir: path.join(base, dir),
        glob: "**/*",
        parent: from,
      });
    }
  },
});
module.exports.postcss = true;
