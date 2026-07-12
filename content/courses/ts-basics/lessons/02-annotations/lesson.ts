import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-02-annotations",
  title: "型注釈をつける",
  estMinutes: 5,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 型注釈は「この変数・引数には何が入るか」をコードに書き添えるメモです。
// 名前のうしろに : 型名 と書きます(string / number / boolean)。

// 1) 3つの変数に型注釈をつけよう
let productName = "型づけノート";
let price = 500;
let inStock = true;

// 2) 関数 summary に型注釈をつけて、中身を1行書こう
//    name は string、yen は number、戻り値は string
function summary(name, yen) {
  // ここで name + " は " + yen + " 円です" を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(productName, price, inStock);
console.log(summary("ノート", 500));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "annotate-name",
      file: "script.ts",
      pattern: "productName\\s*:\\s*string",
      message: "productName に : string の型注釈を付けましょう(let productName: string = ... の形)",
    },
    {
      type: "source",
      id: "annotate-price",
      file: "script.ts",
      pattern: "price\\s*:\\s*number",
      message: "price に : number の型注釈を付けましょう",
    },
    {
      type: "source",
      id: "annotate-stock",
      file: "script.ts",
      pattern: "inStock\\s*:\\s*boolean",
      message: "inStock に : boolean の型注釈を付けましょう(真偽値は boolean です)",
    },
    {
      type: "source",
      id: "annotate-summary",
      file: "script.ts",
      pattern:
        "function\\s+summary\\s*\\(\\s*name\\s*:\\s*string\\s*,\\s*yen\\s*:\\s*number\\s*\\)\\s*:\\s*string",
      message:
        "summary の引数と戻り値に型注釈を付けましょう(function summary(name: string, yen: number): string の形)",
    },
    {
      type: "fn",
      id: "summary-works",
      name: "summary",
      args: ["ノート", 500],
      returns: "ノート は 500 円です",
      message: "summary は「ノート は 500 円です」のような文字列を返すようにしましょう(return を書きます)",
    },
  ],
  hints: [
    "型注釈は「名前: 型名」の形です。文字列は string、数値は number、真偽値(true / false)は boolean を使います",
    "変数は let price: number = 500; のように = の前に、関数は function summary(name: string, yen: number): string のように引数と ) のうしろに書きます",
    'summary の中身は return name + " は " + yen + " 円です"; の1行です。3つの変数にも : string / : number / : boolean を付ければ完成です',
  ],
  solution: {
    "script.ts": `let productName: string = "型づけノート";
let price: number = 500;
let inStock: boolean = true;

function summary(name: string, yen: number): string {
  return name + " は " + yen + " 円です";
}

console.log(productName, price, inStock);
console.log(summary("ノート", 500));
`,
  },
});
