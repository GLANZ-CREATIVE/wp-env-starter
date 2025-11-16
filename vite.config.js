import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { defineConfig } from "vite";
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
        style: resolve(__dirname, "theme/src/assets/scss/style.scss"),
      },
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler",
      },
      scss: {
        api: "modern-compiler",
      },
    },
  },
  plugins: [
    tailwindcss(),
    ViteImageOptimizer({
      // ビルド時のみ最適化を実行（開発環境では高速化のためスキップ）
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
