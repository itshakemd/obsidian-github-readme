import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function copyManifest() {
  return {
    name: "copy-manifest",
    closeBundle() {
      copyFileSync(resolve("manifest.json"), resolve("dist/manifest.json"));
      copyFileSync(resolve("src/assets/logo.png"), resolve("dist/icon.png"));
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
      }
      const stylesPath = resolve("dist/styles.css");
      if (existsSync(stylesPath)) {
        writeFileSync(stylesPath, readFileSync(stylesPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyManifest()],

  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

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
