import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  sourcemap: true,
  clean: true,
  minify: false,
  shims: false,
  splitting: false,
  outDir: 'dist',
  noExternal: [],
  external: [/.*/],
  bundle: false,
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  },
});
