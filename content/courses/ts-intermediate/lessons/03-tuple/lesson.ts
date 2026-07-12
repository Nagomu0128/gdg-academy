import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-03-tuple",
  title: "タプル型",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// タプル型は「決まった数・決まった順・それぞれの型」で値を並べる配列の型です。
// 角かっこの中に型をカンマで並べます。
// 例: 1つ目が文字列、2つ目が数値の2要素の並びは、そういう形のタプルになります。

// 1) makePair: name と age を受け取り、[name, age] という2要素の並びを返す。
//    戻り値の型を「文字列と数値のタプル」にしよう(書き方はスライド参照)。
function makePair(name, age) {
  // [name, age] を返そう

}

// 2) firstOfPair: 2要素の並びを受け取り、1つ目(文字列)を返す。
//    引数 pair の型を「文字列と数値のタプル」にしよう。
function firstOfPair(pair) {
  // pair[0] を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(makePair("タロウ", 20));
console.log(firstOfPair(["タロウ", 20]));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "tuple-return",
      file: "script.ts",
      pattern: "function\\s+makePair\\s*\\([^)]*\\)\\s*:\\s*\\[\\s*string\\s*,\\s*number\\s*\\]",
      message:
        "makePair の戻り値をタプル型にしましょう(function makePair(name: string, age: number): [string, number] の形)",
    },
    {
      type: "source",
      id: "tuple-param",
      file: "script.ts",
      pattern: "pair\\s*:\\s*\\[\\s*string\\s*,\\s*number\\s*\\]",
      message: "firstOfPair の引数 pair をタプル型にしましょう(pair: [string, number] の形)",
    },
    {
      type: "fn",
      id: "makepair-taro",
      name: "makePair",
      args: ["タロウ", 20],
      returns: ["タロウ", 20],
      message: "makePair は [name, age] の2要素の配列を返すようにしましょう",
    },
    {
      type: "fn",
      id: "makepair-hanako",
      name: "makePair",
      args: ["ハナコ", 30],
      returns: ["ハナコ", 30],
      message: "値が変わっても [name, age] を返せるようにしましょう",
    },
    {
      type: "fn",
      id: "first-of-pair",
      name: "firstOfPair",
      args: [["タロウ", 20]],
      returns: "タロウ",
      message: "firstOfPair は1つ目の要素 pair[0] を返すようにしましょう",
    },
  ],
  hints: [
    "タプル型は [型, 型] の形で、要素の数・順番・型を固定します。[string, number] なら「1つ目が文字列、2つ目が数値」の2要素です",
    "makePair の戻り値を : [string, number]、firstOfPair の引数を pair: [string, number] にします。中身はそれぞれ [name, age] と pair[0] を返すだけです",
    "function makePair(name: string, age: number): [string, number] { return [name, age]; } と function firstOfPair(pair: [string, number]): string { return pair[0]; } で完成です",
  ],
  solution: {
    "script.ts": `function makePair(name: string, age: number): [string, number] {
  return [name, age];
}

function firstOfPair(pair: [string, number]): string {
  return pair[0];
}

console.log(makePair("タロウ", 20));
console.log(firstOfPair(["タロウ", 20]));
`,
  },
});
