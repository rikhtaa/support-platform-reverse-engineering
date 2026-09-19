import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "embed.ts",
      name: "EchoWidget",
      formats: ["iife"],
      fileName: () => "widget-life.js",
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});