export default {
  slug: "demo-02-unpub",
  title: "非公開レッスン",
  published: false,
  files: {
    "script.js": { initial: "// ng と出力しよう\n" },
  },
  checks: [{ type: "console", id: "ng-output", lines: ["ng"] }],
  hints: ["console.log を使いましょう"],
  solution: {
    "script.js": 'console.log("ng");\n',
  },
};
