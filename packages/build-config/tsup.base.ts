import { defineConfig } from 'tsup';

export default defineConfig((opts) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  treeshake: true,
  skipNodeModulesBundle: true,
  minify: false,
  splitting: true
}));
