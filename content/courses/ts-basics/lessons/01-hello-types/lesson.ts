import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-01-hello-types",
  title: "型注釈をつけよう",
  estMinutes: 4,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 変数に「型注釈」を付けてみよう
// 変数名のうしろに : 型名 と書きます(例は「やってみよう」スライドにあります)

// ← この2つの変数に型注釈を付けよう
let libraryName = "TypeScript";
let version = 5;

// 型注釈付きの関数(そのままでOK)
function describe(name: string, ver: number): string {
  return name + " v" + ver;
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(describe(libraryName, version));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "annotate-string",
      file: "script.ts",
      pattern: "libraryName\\s*:\\s*string",
      message: "libraryName に : string の型注釈を付けましょう(let libraryName: string = ... の形)",
    },
    {
      type: "source",
      id: "annotate-number",
      file: "script.ts",
      pattern: "version\\s*:\\s*number",
      message: "version に : number の型注釈を付けましょう(let version: number = ... の形)",
    },
    {
      type: "fn",
      id: "describe-works",
      name: "describe",
      args: ["TypeScript", 5],
      returns: "TypeScript v5",
      message: "describe 関数が変わってしまったようです。describe はそのままにしておきましょう",
    },
    {
      type: "console",
      id: "print-result",
      lines: ["TypeScript v5"],
      message: "コンソールに TypeScript v5 と出力されるようにしましょう(console.log の行はそのままでOK)",
    },
  ],
  hints: [
    "型注釈は「変数名: 型名」の形で、= より前に書きます。文字列は string、数値は number です",
    'let libraryName: string = "TypeScript"; のように、変数名の直後に : string を差し込みます',
    'let libraryName: string = "TypeScript"; と let version: number = 5; の2行に書き換えれば完成です',
  ],
  solution: {
    "script.ts": `let libraryName: string = "TypeScript";
let version: number = 5;

function describe(name: string, ver: number): string {
  return name + " v" + ver;
}

console.log(describe(libraryName, version));
`,
  },
});
