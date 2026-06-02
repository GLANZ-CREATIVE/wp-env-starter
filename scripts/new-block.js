#!/usr/bin/env node
/**
 * Usage: pnpm blocks:new <block-name>
 * e.g.   pnpm blocks:new my-hero
 *
 * Creates theme/blocks/<block-name>/ with the minimum files needed
 * to register a custom block via @wordpress/scripts.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const name = process.argv[2];

if (!name || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
  console.error("Usage: pnpm blocks:new <block-name>  (lowercase, hyphens only)");
  process.exit(1);
}

const blockDir = path.join(root, "theme", "blocks", name);

if (fs.existsSync(blockDir)) {
  console.error(`Block "${name}" already exists at ${blockDir}`);
  process.exit(1);
}

// ---- ファイルテンプレート ------------------------------------------------

const namespace = "theme";
const title = name
  .split("-")
  .map((w) => w[0].toUpperCase() + w.slice(1))
  .join(" ");

const blockJson = JSON.stringify(
  {
    $schema: "https://schemas.wp.org/trunk/block.json",
    apiVersion: 3,
    name: `${namespace}/${name}`,
    version: "0.1.0",
    title,
    category: "theme",
    icon: "star-filled",
    description: "",
    supports: { html: false },
    textdomain: namespace,
    editorScript: "file:./index.js",
    style: "file:./style-index.css",
  },
  null,
  2,
);

const packageJson = JSON.stringify(
  {
    name: `@${namespace}/${name}`,
    version: "0.1.0",
    private: true,
    scripts: {
      build: "wp-scripts build",
      start: "wp-scripts start",
    },
    devDependencies: {
      "@wordpress/scripts": "*",
    },
  },
  null,
  2,
);

const editJs = `import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  return <div {...useBlockProps()}>${title}</div>;
}
`;

const saveJs = `import { useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  return <div {...useBlockProps.save()}>${title}</div>;
}
`;

const indexJs = `import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata.name, { edit: Edit, save: Save });
`;

// ---- ディレクトリ＆ファイル生成 -----------------------------------------

const srcDir = path.join(blockDir, "src");
fs.mkdirSync(srcDir, { recursive: true });

const files = {
  "block.json": blockJson,
  "package.json": packageJson,
  "src/index.js": indexJs,
  "src/edit.js": editJs,
  "src/save.js": saveJs,
};

for (const [rel, content] of Object.entries(files)) {
  const dest = path.join(blockDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content + "\n");
}

console.log(`Created block "${namespace}/${name}" at theme/blocks/${name}/`);
console.log("Next: pnpm install && pnpm build:blocks");
