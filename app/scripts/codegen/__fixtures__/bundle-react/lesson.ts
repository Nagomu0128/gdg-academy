import { createElement } from "react";

// 判定バンドルに react が混入する NG パターン(judge-bundle.test.ts が拒否を検証する)。
// React は vendor UMD グローバル前提で、判定バンドルには入れない(L-runtime §2.3)。
export default {
  slug: "bundle-react",
  title: "react を巻き込む教材",
  // createElement を参照して tree-shake で消えないようにする(= react が output に寄与する)
  files: { "script.js": { initial: "" } },
  checks: [
    {
      type: "custom",
      id: "uses-react",
      message: "react を使わないでください",
      run: () => typeof createElement === "function",
    },
  ],
  hints: ["ヒント"],
  solution: { "script.js": 'console.log("hello");\n' },
};
