import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-09-generics",
  title: "ジェネリクス入門",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// ジェネリクスは「型を後から決められる」しくみです。
// <T> という型変数を使うと、どんな型の配列にも使える関数が書けます。

// first: 配列の最初の要素を返す関数。
//   型変数 <T> を使って、「T の配列を受け取って T を1つ返す」形にしよう(書き方はスライドを参考に)。
//   数値配列を渡せば数値が、文字列配列を渡せば文字列が返るようにします。
function first(items) {
  // ここで配列の最初の要素 items[0] を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(first([10, 20, 30]));
console.log(first(["a", "b", "c"]));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "generic-signature",
      file: "script.ts",
      pattern: "function\\s+first\\s*<\\s*T\\s*>\\s*\\(\\s*items\\s*:\\s*T\\[\\]\\s*\\)\\s*:\\s*T\\b",
      message:
        "first をジェネリック関数にしましょう(function first<T>(items: T[]): T の形。<T> と T[] と : T を書きます)",
    },
    {
      type: "fn",
      id: "first-numbers",
      name: "first",
      args: [[10, 20, 30]],
      returns: 10,
      message: "first は配列の最初の要素を返すようにしましょう(return items[0];)",
    },
    {
      type: "fn",
      id: "first-strings",
      name: "first",
      args: [["a", "b", "c"]],
      returns: "a",
      message: "first は文字列の配列でも、最初の要素を返すようにしましょう(同じ関数で両方に対応します)",
    },
  ],
  hints: [
    "ジェネリクスは <T> という「型の変数」を使うしくみです。関数名のうしろに <T> を書くと、その T を引数や戻り値の型に使えます",
    "function first<T>(items: T[]): T と書くと、「T の配列を受け取って T を1つ返す」関数になります。中身は最初の要素 items[0] を返すだけです",
    "function first<T>(items: T[]): T { return items[0]; } で完成です。数値配列でも文字列配列でも、同じ関数が使えます",
  ],
  solution: {
    "script.ts": `function first<T>(items: T[]): T {
  return items[0];
}

console.log(first([10, 20, 30]));
console.log(first(["a", "b", "c"]));
`,
  },
});
