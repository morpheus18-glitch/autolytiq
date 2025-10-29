import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  target: "node20",
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
  splitting: false,
  bundle: true,
});
