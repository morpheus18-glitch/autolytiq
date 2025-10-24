import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  entry: {
    index: "src/server.ts",
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
    ".prisma/client/index.js",
    "better-sqlite3",
    "lightningcss",
    "postcss",
    "autoprefixer",
    "vite",
    /@babel\//,
    /@tailwindcss\//,
  ],
  tsconfig: "tsconfig.api.json",
  esbuildOptions(options) {
    options.resolveExtensions = [".ts", ".js", ".mjs", ".cjs"];
  },
  env: {
    NODE_ENV: process.env.NODE_ENV ?? "development",
  },
});
