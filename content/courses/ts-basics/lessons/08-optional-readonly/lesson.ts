import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-08-optional-readonly",
  title: "オプショナルと readonly",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// interface のプロパティには、追加のルールをつけられます。
//   readonly ... → あとから書き換えられない
//   ...?         → あってもなくてもよい(オプショナル)

// 1) interface Book を定義しよう。
//    ・id は number。「あとから変更できない」readonly を先頭に付ける
//    ・title は string
//    ・note は string。「あってもなくてもよい」オプショナルにする
// ここに interface Book を書こう

// 2) describeBook: Book を受け取って、
//    note があれば "タイトル / メモ: メモ内容"、
//    なければ "タイトル" を返す関数。
//    引数 book は Book、戻り値は string。
function describeBook(book) {
  // ここで book.note があるかどうかで分岐して返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(describeBook({ id: 1, title: "型の本", note: "名著" }));
console.log(describeBook({ id: 2, title: "森の本" }));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "define-interface",
      file: "script.ts",
      pattern: "interface\\s+Book\\s*\\{",
      message: "interface Book { ... } を定義しましょう",
    },
    {
      type: "source",
      id: "readonly-id",
      file: "script.ts",
      pattern: "readonly\\s+id\\s*:\\s*number\\b",
      message: "id は readonly id: number にしましょう(readonly はプロパティの前に付けます)",
    },
    {
      type: "source",
      id: "optional-note",
      file: "script.ts",
      pattern: "note\\s*\\?\\s*:\\s*string\\b",
      message: "note は note?: string にしましょう(? はプロパティ名のうしろに付けます)",
    },
    {
      type: "source",
      id: "annotate-param",
      file: "script.ts",
      pattern: "book\\s*:\\s*Book\\b",
      message: "describeBook の引数 book に : Book の型を付けましょう",
    },
    {
      type: "fn",
      id: "with-note",
      name: "describeBook",
      args: [{ id: 1, title: "型の本", note: "名著" }],
      returns: "型の本 / メモ: 名著",
      message: 'note があるときは "タイトル / メモ: メモ内容" を返すようにしましょう',
    },
    {
      type: "fn",
      id: "without-note",
      name: "describeBook",
      args: [{ id: 2, title: "森の本" }],
      returns: "森の本",
      message: "note がないときはタイトルだけを返すようにしましょう(if (book.note) で分けます)",
    },
  ],
  hints: [
    "readonly をプロパティの前に付けると「あとから変更できない」、プロパティ名のうしろに ? を付けると「あってもなくてもよい(オプショナル)」になります",
    "interface Book に readonly id: number、title: string、note?: string を並べます。describeBook の引数は book: Book、戻り値は : string です",
    'note の有無は if (book.note) で調べます。return book.title + " / メモ: " + book.note; と return book.title; の 2 つに分ければ完成です',
  ],
  solution: {
    "script.ts": `interface Book {
  readonly id: number;
  title: string;
  note?: string;
}

function describeBook(book: Book): string {
  if (book.note) {
    return book.title + " / メモ: " + book.note;
  }
  return book.title;
}

console.log(describeBook({ id: 1, title: "型の本", note: "名著" }));
console.log(describeBook({ id: 2, title: "森の本" }));
`,
  },
});
