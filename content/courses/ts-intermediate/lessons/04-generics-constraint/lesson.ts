import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-04-generics-constraint",
  title: "ジェネリクスの制約",
  estMinutes: 7,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// ジェネリクスに「制約」を付けると、「ある性質を持つ型だけ」を受け取れるように限定できます。
// 型変数のうしろに extends を書いて、満たすべき形を指定します。

// pickId: id を持つオブジェクトから、その id(数値)を取り出す関数。
//   型変数 T に「数値の id を持っている」という制約を付けよう(書き方はスライド参照)。
//   引数 item の型は T、戻り値は number。
function pickId(item) {
  // item.id を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(pickId({ id: 5, name: "ペン" }));
console.log(pickId({ id: 99 }));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "generic-constraint",
      file: "script.ts",
      pattern: "function\\s+pickId\\s*<\\s*T\\s+extends\\s*\\{\\s*id\\s*:\\s*number\\s*\\}\\s*>",
      message:
        "pickId に型の制約を付けましょう(function pickId<T extends { id: number }>(...) の形。extends のうしろに満たすべき形を書きます)",
    },
    {
      type: "source",
      id: "annotate-param",
      file: "script.ts",
      pattern: "\\(\\s*item\\s*:\\s*T\\s*\\)\\s*:\\s*number\\b",
      message: "引数 item を型変数 T にし、戻り値を number にしましょう((item: T): number の形)",
    },
    {
      type: "fn",
      id: "pick-with-name",
      name: "pickId",
      args: [{ id: 5, name: "ペン" }],
      returns: 5,
      message: "pickId は item.id を返すようにしましょう(id が 5 なら 5)",
    },
    {
      type: "fn",
      id: "pick-id-only",
      name: "pickId",
      args: [{ id: 99 }],
      returns: 99,
      message: "他のプロパティが無くても id を返せるようにしましょう(id が 99 なら 99)",
    },
  ],
  hints: [
    "型変数のうしろに extends を書くと、その型が満たすべき形を指定できます。<T extends { id: number }> なら「id: number を持つ型」だけを受け取れます",
    "function pickId<T extends { id: number }>(item: T): number と書くと、id を持つオブジェクトなら何でも渡せて、その id を安全に取り出せます。中身は item.id を返すだけです",
    "function pickId<T extends { id: number }>(item: T): number { return item.id; } で完成です",
  ],
  solution: {
    "script.ts": `function pickId<T extends { id: number }>(item: T): number {
  return item.id;
}

console.log(pickId({ id: 5, name: "ペン" }));
console.log(pickId({ id: 99 }));
`,
  },
});
