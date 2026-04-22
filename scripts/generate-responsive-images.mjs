#!/usr/bin/env node
/**
 * レスポンシブ画像バリアント生成スクリプト
 *
 * theme/src/assets/images/ 配下の写真系画像から、
 * 指定サイズの縮小版と WebP 版を同じディレクトリに生成する。
 *
 * 生成ファイル命名: `{元ファイル名}-w{幅}.{拡張子}` および `.webp`
 *   例: img-hero-01.jpg → img-hero-01-w480.jpg, img-hero-01-w480.webp
 *
 * 除外:
 *   - logo/ icons/ ディレクトリ
 *   - SVG（sharp では意味のある縮小ができないため）
 *   - すでに生成済みのバリアント（-w\d+ サフィックス）
 *
 * 元画像より大きいサイズはスキップする（withoutEnlargement 相当）。
 * 元画像の更新日時が生成物より古い場合はスキップ（キャッシュ的挙動）。
 */

import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import sharp from "sharp";

const SRC_DIR = "theme/src/assets/images";
const SIZES = [480, 768, 1200, 1920];
const EXCLUDE_DIRS = new Set(["logo", "icons"]);
const TARGET_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const VARIANT_RE = /-w\d+\.(jpg|jpeg|png|webp)$/i;
const WEBP_QUALITY = 80;

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function isUpToDate(srcPath, outPath) {
  if (!existsSync(outPath)) return false;
  const [srcStat, outStat] = await Promise.all([stat(srcPath), stat(outPath)]);
  return outStat.mtimeMs >= srcStat.mtimeMs;
}

async function generateVariants(srcPath) {
  const ext = extname(srcPath).toLowerCase();
  if (!TARGET_EXTS.has(ext)) return { skipped: true };
  if (VARIANT_RE.test(srcPath)) return { skipped: true };

  const base = srcPath.slice(0, -ext.length);
  const meta = await sharp(srcPath).metadata();
  const srcWidth = meta.width ?? Infinity;

  const jobs = [];
  let generated = 0;
  let cached = 0;

  for (const size of SIZES) {
    if (size >= srcWidth) continue;

    const outOriginal = `${base}-w${size}${ext}`;
    const outWebp = `${base}-w${size}.webp`;

    if (await isUpToDate(srcPath, outOriginal)) {
      cached++;
    } else {
      jobs.push(
        sharp(srcPath)
          .resize({ width: size, withoutEnlargement: true })
          .toFile(outOriginal),
      );
      generated++;
    }

    if (await isUpToDate(srcPath, outWebp)) {
      cached++;
    } else {
      jobs.push(
        sharp(srcPath)
          .resize({ width: size, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(outWebp),
      );
      generated++;
    }
  }

  await Promise.all(jobs);
  return { skipped: false, generated, cached };
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.log(`[responsive-images] ソースディレクトリが見つかりません: ${SRC_DIR} — スキップ`);
    return;
  }

  const start = Date.now();
  let totalGenerated = 0;
  let totalCached = 0;
  let processed = 0;

  for await (const file of walk(SRC_DIR)) {
    const result = await generateVariants(file);
    if (result.skipped) continue;
    processed++;
    totalGenerated += result.generated;
    totalCached += result.cached;
  }

  const ms = Date.now() - start;
  console.log(
    `[responsive-images] 元画像 ${processed} 枚 / 新規 ${totalGenerated} / キャッシュ ${totalCached} (${ms}ms)`,
  );
}

main().catch((err) => {
  console.error("[responsive-images] 失敗:", err);
  process.exit(1);
});
