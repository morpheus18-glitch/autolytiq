import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  target: "node20",
  sourcemap: true,
  clean: true,
  minify: false,
  shims: false,
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: false,
  treeshake: false,
  external: [
    "@prisma/client",
    ".prisma/client",
    "better-sqlite3",
    "lightningcss",
    "postcss",
    "autoprefixer",
    "vite",
    /@babel\//,
    /@tailwindcss\//,
  ],
  esbuildOptions(options) {
    options.resolveExtensions = [".ts", ".js", ".mjs", ".cjs"];
  },
  env: {
    NODE_ENV: process.env.NODE_ENV ?? "development",
  },
});
