import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
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
  },
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Disable gzip size reporting to save memory
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],

          // Routing and state management
          'router-vendor': ['wouter', '@tanstack/react-query'],

          // UI component libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-label',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
          ],

          // Charts and visualization
          'chart-vendor': ['recharts', 'date-fns'],

          // Form libraries
          'form-vendor': ['react-hook-form', 'zod'],

          // Icons
          'icon-vendor': ['lucide-react'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
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
