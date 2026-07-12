import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-05-utility-types",
  title: "ユーティリティ型",
  estMinutes: 8,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// ユーティリティ型は、既存の型から新しい型を作る「型の道具」です。
//   ・すべてのプロパティを省略可能にする道具
//   ・指定したキーだけを残す道具
//   ・指定したキーを除く道具
// 使い方はスライドを参照。ここでは User をもとに3つの関数の型を仕上げます。

interface User {
  id: number;
  name: string;
  age: number;
}

// 1) updateUser: user を patch の内容で上書きした新しい User を返す。
//    patch は「User の一部だけ渡せる型」にしよう(すべて省略可能にする道具)。
function updateUser(user, patch) {
  // { ...user, ...patch } を返そう

}

// 2) pickName: user から name だけの形を返す。
//    戻り値は「User の name だけを残した型」にしよう。
function pickName(user) {
  // { name: user.name } を返そう

}

// 3) withoutId: user から id を除いた形を返す。
//    戻り値は「User から id を除いた型」にしよう。
function withoutId(user) {
  // { name: user.name, age: user.age } を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(updateUser({ id: 1, name: "タロウ", age: 20 }, { age: 21 }));
console.log(pickName({ id: 1, name: "タロウ", age: 20 }));
console.log(withoutId({ id: 1, name: "タロウ", age: 20 }));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-partial",
      file: "script.ts",
      pattern: "patch\\s*:\\s*Partial\\s*<\\s*User\\s*>",
      message: "patch の型を Partial<User> にしましょう(すべてのプロパティを省略可能にします)",
    },
    {
      type: "source",
      id: "use-pick",
      file: "script.ts",
      pattern: ":\\s*Pick\\s*<\\s*User\\s*,\\s*[\"']name[\"']\\s*>",
      message: 'pickName の戻り値を Pick<User, "name"> にしましょう(name だけを残します)',
    },
    {
      type: "source",
      id: "use-omit",
      file: "script.ts",
      pattern: ":\\s*Omit\\s*<\\s*User\\s*,\\s*[\"']id[\"']\\s*>",
      message: 'withoutId の戻り値を Omit<User, "id"> にしましょう(id を除きます)',
    },
    {
      type: "fn",
      id: "update-user",
      name: "updateUser",
      args: [{ id: 1, name: "タロウ", age: 20 }, { age: 21 }],
      returns: { id: 1, name: "タロウ", age: 21 },
      message: "updateUser は { ...user, ...patch } で、渡された分だけ上書きした User を返しましょう",
    },
    {
      type: "fn",
      id: "pick-name",
      name: "pickName",
      args: [{ id: 1, name: "タロウ", age: 20 }],
      returns: { name: "タロウ" },
      message: "pickName は { name: user.name } を返すようにしましょう",
    },
    {
      type: "fn",
      id: "without-id",
      name: "withoutId",
      args: [{ id: 1, name: "タロウ", age: 20 }],
      returns: { name: "タロウ", age: 20 },
      message: "withoutId は id を除いた { name, age } を返すようにしましょう",
    },
  ],
  hints: [
    "Partial<T> は T の全プロパティを省略可能に、Pick<T, キー> は指定したキーだけを残し、Omit<T, キー> は指定したキーを除いた型を作ります",
    'patch: Partial<User>、pickName の戻り値 Pick<User, "name">、withoutId の戻り値 Omit<User, "id"> を付けます。中身はそれぞれオブジェクトを組み立てて返します',
    "updateUser は return { ...user, ...patch };、pickName は return { name: user.name };、withoutId は return { name: user.name, age: user.age }; で完成です",
  ],
  solution: {
    "script.ts": `interface User {
  id: number;
  name: string;
  age: number;
}

function updateUser(user: User, patch: Partial<User>): User {
  return { ...user, ...patch };
}

function pickName(user: User): Pick<User, "name"> {
  return { name: user.name };
}

function withoutId(user: User): Omit<User, "id"> {
  return { name: user.name, age: user.age };
}

console.log(updateUser({ id: 1, name: "タロウ", age: 20 }, { age: 21 }));
console.log(pickName({ id: 1, name: "タロウ", age: 20 }));
console.log(withoutId({ id: 1, name: "タロウ", age: 20 }));
`,
  },
});
