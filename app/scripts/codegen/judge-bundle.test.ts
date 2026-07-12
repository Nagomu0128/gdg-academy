import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildJudgeBundle, forbiddenBundleInputs } from "./judge-bundle";

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__");

describe("buildJudgeBundle", () => {
  it("lesson.ts + runtime を IIFE 1 本に束ね、__JUDGE__ を定義するコードを出力する", async () => {
    const lessonTs = path.join(FIXTURES, "valid", "courses", "demo", "lessons", "01-dom", "lesson.ts");
    const { code, bytes } = await buildJudgeBundle(lessonTs);
    expect(code).toContain("__JUDGE__");
    expect(code).toContain("judge:result");
    expect(bytes).toBeGreaterThan(0);
    // §4.2: 1 バンドル数 KB 程度。50KB を大きく超えたら依存の混入を疑う
    expect(bytes).toBeLessThan(50 * 1024);
  });

  it("worker 系レッスンも同様にビルドできる", async () => {
    const lessonTs = path.join(FIXTURES, "valid", "courses", "demo", "lessons", "02-worker", "lesson.ts");
    const { code } = await buildJudgeBundle(lessonTs);
    expect(code).toContain("__JUDGE__");
  });

  it("zod が混入するレッスンはビルドを拒否する(SPEC B §2)", async () => {
    const lessonTs = path.join(FIXTURES, "bundle-zod", "lesson.ts");
    await expect(buildJudgeBundle(lessonTs)).rejects.toThrow(/禁止依存/);
  });

  it("react が混入するレッスンはビルドを拒否する(L-runtime: React は vendor UMD)", async () => {
    const lessonTs = path.join(FIXTURES, "bundle-react", "lesson.ts");
    await expect(buildJudgeBundle(lessonTs)).rejects.toThrow(/禁止依存/);
  });
});

// forbiddenBundleInputs は buildJudgeBundle 本体が使う検出述語。
// git-sim の render.ts は DOM ソースで、これを import する fixture は app の node lib 型検査を
// 壊す(bundler 解決で render.ts が checked source に引き込まれる)ため fixture 化できない。
// 代わりに検出述語を直接ユニットテストし、L-runtime で追加した4パターン
// (sucrase / react / react-dom / git-sim render.ts)を含む全禁止依存の回帰を守る。
describe("forbiddenBundleInputs(禁止依存の検出述語)", () => {
  it("禁止依存の代表パスをすべて検出する(SPEC B §2 + L-runtime §2.3/§5.2)", () => {
    // esbuild の metafile input は cwd 相対(node_modules 前に必ず区切りが入る)
    const forbidden = [
      "../node_modules/zod/lib/index.js",
      "../node_modules/acorn/dist/acorn.js",
      "../node_modules/acorn-walk/dist/walk.js",
      "../node_modules/sucrase/dist/index.js",
      "../node_modules/react/index.js",
      "../node_modules/react-dom/index.js",
      "../packages/lesson-kit/src/schemas.ts",
      "../packages/lesson-kit/src/loop-protect.ts",
      "../packages/lesson-kit/src/git-sim/render.ts",
    ];
    // 各パスが単独で検出されること(1つでも regex が消えれば対応行が落ちる)
    for (const input of forbidden) {
      expect(forbiddenBundleInputs([input]), `${input} は禁止依存として検出されるべき`).toEqual([input]);
    }
    // まとめて渡しても全件返る
    expect(forbiddenBundleInputs(forbidden)).toEqual(forbidden);
  });

  it("Windows 区切りのパスも検出する", () => {
    expect(
      forbiddenBundleInputs([
        "..\\node_modules\\react\\index.js",
        "..\\packages\\lesson-kit\\src\\git-sim\\render.ts",
      ]),
    ).toHaveLength(2);
  });

  it("判定バンドルに入ってよい依存は検出しない(git-sim の判定系・lesson.ts 本体)", () => {
    expect(
      forbiddenBundleInputs([
        "../packages/lesson-kit/src/git-sim/engine.ts",
        "../packages/lesson-kit/src/git-sim/index.ts",
        "../packages/lesson-kit/src/git-sim/repo.ts",
        "../packages/lesson-kit/src/git-sim/hash.ts",
        "../packages/lesson-kit/src/messages.ts",
        "../packages/lesson-kit/src/normalize.ts",
        "content/courses/git/lessons/01-init/lesson.ts",
      ]),
    ).toEqual([]);
  });
});
