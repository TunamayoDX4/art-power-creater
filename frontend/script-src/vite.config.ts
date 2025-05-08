import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  root: "./src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    minify: mode === "production", // 本番だけ圧縮
    sourcemap: mode !== "production", // デバッグ時はソースマップ出す
    esbuild: {
      legalComments: mode === "production" ? "none" : "inline", // 本番だけコメントを消す
    },
    tersetOptions: {
      format: {
        "comments": mode === "production" ? false : true, // 本番だけコメントを消す
        "sourcemap": mode !== "production" ? true : false, // デバッグ時はソースマップ出す
      }
    }, 
    rollupOptions: {
      input: { main: "./src/index.ts" },
      output: { entryFileNames: "script.js" }
    }
  }
}));