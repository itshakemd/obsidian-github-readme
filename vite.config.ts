import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, readdirSync, renameSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

function copyManifest() {
  return {
    name: "copy-manifest",
    closeBundle() {
      copyFileSync(resolve("manifest.json"), resolve("dist/manifest.json"));
      copyFileSync(resolve("src/assets/logo.png"), resolve("dist/icon.png"));
      // Obsidian loads styles.css if present — rename vite's css output
      try {
        const dist = resolve("dist");
        for (const f of readdirSync(dist)) {
          if (f.endsWith(".css") && f !== "styles.css") {
            const src = resolve(dist, f);
            const dst = resolve(dist, "styles.css");
            if (existsSync(dst)) unlinkSync(dst);
            renameSync(src, dst);
            break;
          }
        }
      } catch {
        // ignore
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyManifest()],

  build: {
    lib: {
      entry: "main.tsx",
      formats: ["cjs"],
      fileName: () => "main.js",
    },

    rollupOptions: {
      external: [
        "obsidian",
        "electron",
        // Only these two are guaranteed to be available at runtime in Obsidian's require() shim.
        // All other @codemirror/* packages must be bundled.
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
      ],
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? "";
          if (name.endsWith(".css")) return "styles.css";
          return name || "asset-[hash][extname]";
        },
      },
    },

    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
});