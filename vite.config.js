import { resolve } from "path";
import { defineConfig } from "vite";
import FullReload from "vite-plugin-full-reload";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  root: "theme/src",
  base: process.env.NODE_ENV === "production" ? "./" : "/",
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    cors: true,
    hmr: {
      host: "localhost",
    },
    watch: {
      usePolling: false,
      interval: 1000,
    },
  },
  build: {
    outDir: resolve(__dirname, "theme/dist"),
    emptyOutDir: true,
    manifest: true,
    // SVGファイルを個別ファイルとして出力するため、インライン化の閾値を0に設定
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "theme/src/assets/js/main.js"),
        style: resolve(__dirname, "theme/src/assets/css/index.css"),
      },
    },
  },
  plugins: [
    FullReload(["theme/**/*.php"], { root: __dirname }),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false,
              },
            },
          },
          "sortAttrs",
          {
            name: "addAttributesToSVGElement",
            params: {
              attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
            },
          },
        ],
      },
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
  ],
});
