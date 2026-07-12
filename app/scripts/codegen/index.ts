// 教材 codegen エントリ(CONTRACTS §8)。tsx で実行。`--validate-only` で検証のみ。
import { buildVendor } from "../build-vendor";
import { generateLessons } from "./lessons";
import { generateSlides } from "./slides";
import { runValidation } from "./validate";

const validateOnly = process.argv.includes("--validate-only");

async function main(): Promise<void> {
  if (validateOnly) {
    // 検証ステージ1(zod parse + slug 重複 + course.lessons と実ディレクトリの 1:1 + スライド 1 枚以上)
    await runValidation();
    return;
  }
  // vendor スクリプトは gitignore のため、dev / typecheck / CI / build いずれの経路でも
  // codegen と同時に再生成して常に存在させる(L-runtime)
  await buildVendor();
  await generateLessons();
  await generateSlides();
  console.log("[codegen] 完了");
}

main().catch((err) => {
  console.error("[codegen] 失敗:", err instanceof Error ? err.message : err);
  process.exit(1);
});
