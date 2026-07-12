import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-03-arrays-objects",
  title: "配列とオブジェクトの型",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 配列やオブジェクトにも型をつけられます。
// 数値の配列は number[]、オブジェクトは { プロパティ名: 型 } と書きます。

// 1) 数値の配列 scores に型注釈をつけよう(number[])
let scores = [80, 95, 70];

// 2) sum: 数値の配列を受け取って合計を返す関数
//    引数 nums は number[]、戻り値は number
function sum(nums) {
  // ここで nums の合計を計算して返そう(reduce か for でOK)

}

// 3) makeUser: name を受け取って { name: string } の形のオブジェクトを返す関数
//    引数 name は string、戻り値は { name: string }
function makeUser(name) {
  // ここで { name: name } を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(scores);
console.log(sum(scores));
console.log(makeUser("みらい"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "annotate-array",
      file: "script.ts",
      pattern: "scores\\s*:\\s*number\\[\\]",
      message: "scores に : number[] の型注釈を付けましょう(数値の配列は number[])",
    },
    {
      type: "source",
      id: "annotate-param",
      file: "script.ts",
      pattern: "nums\\s*:\\s*number\\[\\]",
      message: "sum の引数 nums に : number[] の型注釈を付けましょう",
    },
    {
      type: "source",
      id: "annotate-object",
      file: "script.ts",
      pattern: "function\\s+makeUser\\s*\\([^)]*\\)\\s*:\\s*\\{\\s*name\\s*:\\s*string\\s*\\}",
      message: "makeUser の戻り値に : { name: string } の型注釈を付けましょう",
    },
    {
      type: "fn",
      id: "sum-basic",
      name: "sum",
      args: [[80, 95, 70]],
      returns: 245,
      message: "sum は配列の合計を返すようにしましょう(80 + 95 + 70 = 245)",
    },
    {
      type: "fn",
      id: "sum-other",
      name: "sum",
      args: [[1, 2, 3]],
      returns: 6,
      message: "sum は中身が変わっても合計を返すようにしましょう(数値を直接書かず nums を足します)",
    },
    {
      type: "fn",
      id: "makeuser-works",
      name: "makeUser",
      args: ["みらい"],
      returns: { name: "みらい" },
      message: "makeUser は { name: 受け取った名前 } のオブジェクトを返すようにしましょう",
    },
  ],
  hints: [
    "配列の型は「要素の型」に [] を足して number[] と書きます。オブジェクトの型は { name: string } のように、プロパティ名: 型 を波かっこで囲みます",
    "sum の引数は nums: number[]、戻り値は : number です。makeUser の戻り値は : { name: string }。合計は reduce か for で計算します",
    "sum は return nums.reduce((total, n) => total + n, 0);、makeUser は return { name: name }; で完成です。scores にも : number[] を付けましょう",
  ],
  solution: {
    "script.ts": `let scores: number[] = [80, 95, 70];

function sum(nums: number[]): number {
  return nums.reduce((total, n) => total + n, 0);
}

function makeUser(name: string): { name: string } {
  return { name: name };
}

console.log(scores);
console.log(sum(scores));
console.log(makeUser("みらい"));
`,
  },
});
