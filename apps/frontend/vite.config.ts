import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "../../docs/resources/assets"),
      "@shared/schema": path.resolve(import.meta.dirname, "../../packages/shared/dist/schema"),
      "@shared/settings-schema": path.resolve(import.meta.dirname, "../../packages/shared/dist/settings-schema"),
      "@repo/tokens": path.resolve(import.meta.dirname, "../../packages/tokens/dist"),
      "@repo/ui": path.resolve(import.meta.dirname, "../../packages/ui/dist"),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Disable gzip size reporting to save memory
    minify: 'esbuild', // Use esbuild (faster, less memory) instead of terser
    sourcemap: false, // Disable sourcemaps to save memory
    rollupOptions: {
      maxParallelFileOps: 2, // Limit parallel operations to reduce memory usage
      output: {
        manualChunks: (id) => {
          // Simplified chunking strategy to reduce memory
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('lucide-react') || id.includes('recharts')) {
              return 'viz-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
