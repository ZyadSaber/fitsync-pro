import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

export default defineConfig({
  root: here,
  // Dashboard SPA is mounted under /application on the shared production origin,
  // so all built asset URLs (and the dev server) are prefixed with /application/.
  base: "/application",
  plugins: [react(), tailwindcss()],
  resolve: {
    // Order matters: more specific Next.js subpaths before bare specifiers.
    alias: [
      { find: "next/navigation", replacement: path.join(here, "src/compat/next-navigation.ts") },
      { find: "next/link", replacement: path.join(here, "src/compat/next-link.tsx") },
      { find: "next/cache", replacement: path.join(here, "src/compat/noop.ts") },
      { find: "next/headers", replacement: path.join(here, "src/compat/noop.ts") },
      { find: "@", replacement: repoRoot },
    ],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(repoRoot, "dist/dashboard"),
    emptyOutDir: true,
  },
});
