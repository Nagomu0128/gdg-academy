import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-05-union-narrowing",
  title: "ユニオン型と絞り込み",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// ユニオン型は「A か B のどちらか」を表す型です。string | number のように | でつなぎます。
// 使うときは typeof で「今どちらか」を絞り込んでから処理します。

// label: string か number を受け取り、
//   文字列なら "文字列: " + value を、
//   数値なら "数値: " + value を返す関数。
//   引数 value は string | number、戻り値は string。
function label(value) {
  // ここで typeof value を使って分岐し、上のルールで文字列を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(label("こんにちは"));
console.log(label(42));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "annotate-union",
      file: "script.ts",
      pattern: "value\\s*:\\s*string\\s*\\|\\s*number",
      message: "value に : string | number のユニオン型を付けましょう(| で 2 つの型をつなぎます)",
    },
    {
      type: "source",
      id: "annotate-return",
      file: "script.ts",
      pattern: "function\\s+label\\s*\\([^)]*\\)\\s*:\\s*string",
      message: "label の戻り値に : string を付けましょう",
    },
    {
      type: "source",
      id: "use-typeof",
      file: "script.ts",
      pattern: "typeof\\s+value",
      message: "typeof value を使って、文字列のときと数値のときを分けましょう",
    },
    {
      type: "fn",
      id: "label-string",
      name: "label",
      args: ["こんにちは"],
      returns: "文字列: こんにちは",
      message: 'label に文字列を渡したら "文字列: " を付けて返すようにしましょう',
    },
    {
      type: "fn",
      id: "label-number",
      name: "label",
      args: [42],
      returns: "数値: 42",
      message: 'label に数値を渡したら "数値: " を付けて返すようにしましょう(else 側の分岐)',
    },
  ],
  hints: [
    "ユニオン型は string | number のように | で複数の型をつなぎます。使う前に typeof でどちらか調べて分岐します",
    'value に : string | number、戻り値に : string を付けます。中身は if (typeof value === "string") { ... } で 2 つの場合に分けます',
    'if (typeof value === "string") { return "文字列: " + value; } と書き、そのあとに return "数値: " + value; を置けば完成です',
  ],
  solution: {
    "script.ts": `function label(value: string | number): string {
  if (typeof value === "string") {
    return "文字列: " + value;
  }
  return "数値: " + value;
}

console.log(label("こんにちは"));
console.log(label(42));
`,
  },
});
