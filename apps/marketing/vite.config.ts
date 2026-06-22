import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

export default defineConfig({
  root: here,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": repoRoot,
    },
  },
  build: {
    // outDir is provided per-target by the build:marketing script
    // (dist/client for the browser bundle, dist/server for the SSR bundle).
    emptyOutDir: true,
  },
});
