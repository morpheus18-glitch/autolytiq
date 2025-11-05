import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2020',
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  external: ['react', 'react-dom', '@repo/tokens', 'lucide-react', 'class-variance-authority'],
  banner: {
    js: '"use client";',
  },
  onSuccess: 'echo "✅ UI package built successfully"',
});
