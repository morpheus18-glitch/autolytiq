import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "schema/index": "src/schema/index.ts",
    "settings-schema/index": "src/settings-schema/index.ts",
  },
  format: ["esm"],
  target: "node20",
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  bundle: true,
  treeshake: false,
});
