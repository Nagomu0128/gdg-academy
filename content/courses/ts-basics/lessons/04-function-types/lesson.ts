import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-04-function-types",
  title: "関数の型",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 関数の「型」は、引数の型と戻り値の型で決まります。
// 引数は 1 つずつ、戻り値は ) のうしろに書きます。

// 1) add: 2つの数を受け取って合計を返す関数
//    引数 a, b は number、戻り値は number
function add(a, b) {
  // ここで a + b を返そう

}

// 2) repeat: 文字列を回数ぶんくり返してつなげた文字列を返す関数
//    引数 text は string、times は number、戻り値は string
function repeat(text, times) {
  // ここで text を times 回くり返した文字列を返そう(例: repeat("ab", 3) は "ababab")

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(add(3, 4));
console.log(repeat("ab", 3));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "annotate-add",
      file: "script.ts",
      pattern: "function\\s+add\\s*\\(\\s*a\\s*:\\s*number\\s*,\\s*b\\s*:\\s*number\\s*\\)\\s*:\\s*number",
      message: "add の引数と戻り値に型を付けましょう(function add(a: number, b: number): number の形)",
    },
    {
      type: "source",
      id: "annotate-repeat",
      file: "script.ts",
      pattern:
        "function\\s+repeat\\s*\\(\\s*text\\s*:\\s*string\\s*,\\s*times\\s*:\\s*number\\s*\\)\\s*:\\s*string",
      message:
        "repeat の引数と戻り値に型を付けましょう(function repeat(text: string, times: number): string の形)",
    },
    {
      type: "fn",
      id: "add-basic",
      name: "add",
      args: [3, 4],
      returns: 7,
      message: "add は 2 つの数の合計を返すようにしましょう(3 + 4 = 7)",
    },
    {
      type: "fn",
      id: "add-negative",
      name: "add",
      args: [10, -5],
      returns: 5,
      message: "add は値が変わっても合計を返すようにしましょう(return a + b;)",
    },
    {
      type: "fn",
      id: "repeat-basic",
      name: "repeat",
      args: ["ab", 3],
      returns: "ababab",
      message: 'repeat は文字列を回数ぶんつなげて返すようにしましょう(repeat("ab", 3) は "ababab")',
    },
  ],
  hints: [
    "関数の型は「引数ごとの型」と「戻り値の型」で決まります。引数は a: number のように、戻り値は ) のうしろに : number と書きます",
    "add の中身は return a + b;。repeat は文字列の repeat メソッドが使えます(text.repeat(times) は text を times 回くり返します)",
    "add(a: number, b: number): number と repeat(text: string, times: number): string の形に型をつけ、中身は return a + b; と return text.repeat(times); です",
  ],
  solution: {
    "script.ts": `function add(a: number, b: number): number {
  return a + b;
}

function repeat(text: string, times: number): string {
  return text.repeat(times);
}

console.log(add(3, 4));
console.log(repeat("ab", 3));
`,
  },
});
