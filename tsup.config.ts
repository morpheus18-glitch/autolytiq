import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server/index.ts'],
  format: ['esm'],
  target: 'node20',
  sourcemap: true,
  clean: true,
  minify: false,
  shims: false,
  splitting: false,
  

  bundle: true,
  skipNodeModulesBundle: true,
  treeshake: false,

  external: [
    /^(?!@shared)[^.\/]/,
  ],
  noExternal: ['@shared'],
  tsconfig: 'tsconfig.api.json',
  esbuildOptions(options) {
    options.resolveExtensions = ['.ts', '.js'];
    options.alias = {
      '@shared': './shared',
    };
    options.external = ['lightningcss', '@babel/*', '@tailwindcss/*', 'vite', 'postcss', 'autoprefixer'];
  },
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  },
});
