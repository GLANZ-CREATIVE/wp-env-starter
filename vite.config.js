import { globSync } from "node:fs";
import { basename, resolve } from "node:path";

import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";
import FullReload from "vite-plugin-full-reload";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

import { convertToWebp } from "./vite/plugins/convert-to-webp.js";

const lightningcssTargets = browserslistToTargets(browserslist());

// pages/*.css を自動でエントリ化する（CSS を追加するだけでビルド対象になる）
const pageStyleEntries = Object.fromEntries(
  globSync("theme/src/assets/css/pages/*.css").map((file) => [
    basename(file, ".css"),
    resolve(__dirname, file),
  ]),
);

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
      protocol: "ws",
      clientPort: 3000,
    },
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      targets: lightningcssTargets,
      drafts: {
        customMedia: true,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, "theme/dist"),
    emptyOutDir: true,
    manifest: true,
    cssMinify: "lightningcss",
    // SVGファイルを個別ファイルとして出力するため、インライン化の閾値を0に設定
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "theme/src/assets/js/main.js"),
        style: resolve(__dirname, "theme/src/assets/css/index.css"),
        ...pageStyleEntries,
      },
    },
  },
  plugins: [
    FullReload(["theme/**/*.php"], { root: __dirname }),
    convertToWebp({ quality: 80 }),
    ViteImageOptimizer({
      test: /\.(gif|webp|svg|avif)$/i,
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
      webp: {
        quality: 80,
        lossless: false,
      },
    }),
  ],
});
