// vendor スクリプトのビルド(docs/specs/L-runtime.md)。
// 教材のサンドボックスが `<script src="/vendor/…">` で読む自オリジン配信ライブラリを
// `app/public/vendor/` に生成する(gitignore 対象。codegen 実行時に毎回再生成)。
// - React / ReactDOM: 18 系 UMD をコピー(React 19 は UMD 配布がないため 18 系 —
//   package.json では react-umd / react-dom-umd のエイリアスで固定)
// - dayjs / lodash: 配布物の min をコピー
// - zod: esbuild で IIFE 化(グローバル `z`)
// - git-sim: lesson-kit の git-sim + プレビュー用レンダラを IIFE 化(グローバル `GitSim`)
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(APP_DIR, "..");
const VENDOR_DIR = path.join(APP_DIR, "public", "vendor");

const require_ = createRequire(path.join(APP_DIR, "package.json"));

/** exports フィールドの制限を避け、package.json の位置からパッケージ内ファイルを解決する */
function packageFile(pkg: string, relative: string): string {
  const pkgJson = require_.resolve(`${pkg}/package.json`);
  return path.join(path.dirname(pkgJson), relative);
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

async function bundleIife(opts: {
  entryContents: string;
  resolveDir: string;
  globalName: string;
  outFile: string;
  banner: string;
}): Promise<number> {
  const result = await build({
    stdin: {
      contents: opts.entryContents,
      resolveDir: opts.resolveDir,
      sourcefile: `${opts.globalName}-vendor-entry.ts`,
      loader: "ts",
    },
    bundle: true,
    format: "iife",
    globalName: opts.globalName,
    minify: true,
    target: "es2020",
    platform: "browser",
    write: false,
    logLevel: "silent",
  });
  const output = result.outputFiles[0];
  if (output === undefined) throw new Error(`vendor ビルドの出力が空です: ${opts.outFile}`);
  const code = `/* ${opts.banner} */\n${output.text}`;
  await writeFile(opts.outFile, code, "utf8");
  return Buffer.byteLength(code, "utf8");
}

export async function buildVendor(): Promise<void> {
  await mkdir(VENDOR_DIR, { recursive: true });
  const sizes: string[] = [];

  // 1. コピー系(UMD / min 配布物)
  const copies: [string, string, string][] = [
    ["react-umd", "umd/react.production.min.js", "react.production.min.js"],
    ["react-dom-umd", "umd/react-dom.production.min.js", "react-dom.production.min.js"],
    ["dayjs", "dayjs.min.js", "dayjs.min.js"],
    ["lodash", "lodash.min.js", "lodash.min.js"],
  ];
  for (const [pkg, src, dest] of copies) {
    const from = packageFile(pkg, src);
    const to = path.join(VENDOR_DIR, dest);
    await copyFile(from, to);
    const { size } = await import("node:fs/promises").then((fs) => fs.stat(to));
    sizes.push(`${dest} ${(size / 1024).toFixed(1)}KB`);
  }

  // 2. zod IIFE(グローバル z。z.string() / z.object() が直接使える)
  const zodBytes = await bundleIife({
    entryContents: 'export * from "zod";',
    resolveDir: APP_DIR,
    globalName: "z",
    outFile: path.join(VENDOR_DIR, "zod.js"),
    banner: "zod (IIFE, global z) — build-vendor.ts が生成",
  });
  sizes.push(`zod.js ${(zodBytes / 1024).toFixed(1)}KB`);

  // 3. git-sim IIFE(グローバル GitSim = { fromScripts, renderPlayback })。
  //    レンダラは vendor バンドルにのみ含める(判定バンドルには入れない — judge-bundle.ts が検証)
  const gitSimDir = path.join(REPO_ROOT, "packages", "lesson-kit", "src", "git-sim");
  const gitSimBytes = await bundleIife({
    entryContents: [
      `import { GitSim } from "./${toPosix(path.relative(APP_DIR, path.join(gitSimDir, "index.ts")))}";`,
      `import { renderPlayback } from "./${toPosix(path.relative(APP_DIR, path.join(gitSimDir, "render.ts")))}";`,
      "export const fromScripts = GitSim.fromScripts.bind(GitSim);",
      "export { renderPlayback };",
    ].join("\n"),
    resolveDir: APP_DIR,
    globalName: "GitSim",
    outFile: path.join(VENDOR_DIR, "git-sim.js"),
    banner: "git-sim (IIFE, global GitSim) — build-vendor.ts が生成",
  });
  sizes.push(`git-sim.js ${(gitSimBytes / 1024).toFixed(1)}KB`);

  console.log(`[codegen] vendor: ${sizes.join(" / ")} → app/public/vendor/`);
}
