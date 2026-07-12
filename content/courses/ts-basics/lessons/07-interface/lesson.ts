import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-07-interface",
  title: "interface",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// interface は「オブジェクトの形」に名前をつけるしくみです。
// interface User {
//   name: string;
//   age: number;
// }
// のように、どんなプロパティを持つかを並べます。

// 1) interface User を定義しよう(name: string と age: number)
// ここに interface User を書こう

// 2) createUser: name と age を受け取って User を返す関数。
//    引数 name は string、age は number、戻り値は User。
function createUser(name, age) {
  // ここで { name: name, age: age } を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(createUser("みらい", 20));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "define-interface",
      file: "script.ts",
      pattern:
        "interface\\s+User\\s*\\{\\s*name\\s*:\\s*string\\s*[;,]?\\s*age\\s*:\\s*number\\s*[;,]?\\s*\\}",
      message:
        "interface User に name: string と age: number を定義しましょう(interface User { name: string; age: number } の形)",
    },
    {
      type: "source",
      id: "annotate-return",
      file: "script.ts",
      pattern: "function\\s+createUser\\s*\\([^)]*\\)\\s*:\\s*User",
      message: "createUser の戻り値の型を : User にしましょう",
    },
    {
      type: "fn",
      id: "createuser-works",
      name: "createUser",
      args: ["みらい", 20],
      returns: { name: "みらい", age: 20 },
      message: "createUser は { name: 受け取った名前, age: 受け取った年齢 } を返すようにしましょう",
    },
    {
      type: "fn",
      id: "createuser-other",
      name: "createUser",
      args: ["たろう", 30],
      returns: { name: "たろう", age: 30 },
      message: "createUser は値が変わっても動くようにしましょう(引数の name と age をそのまま入れます)",
    },
  ],
  hints: [
    "interface は「オブジェクトの形」に名前をつけます。interface User { name: string; age: number } のように、プロパティ名と型を並べます",
    "createUser の引数に name: string, age: number、戻り値に : User を付けます。中身では { name: name, age: age } を返します",
    "interface User { name: string; age: number } を定義し、createUser は return { name: name, age: age }; で完成です(戻り値の型は : User)",
  ],
  solution: {
    "script.ts": `interface User {
  name: string;
  age: number;
}

function createUser(name: string, age: number): User {
  return { name: name, age: age };
}

console.log(createUser("みらい", 20));
`,
  },
});
