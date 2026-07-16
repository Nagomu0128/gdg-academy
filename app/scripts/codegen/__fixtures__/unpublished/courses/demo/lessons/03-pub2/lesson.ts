export default {
  slug: "demo-03-pub2",
  title: "非公開の次の公開レッスン",
  files: {
    "script.js": { initial: "// ok2 と出力しよう\n" },
  },
  checks: [{ type: "console", id: "ok2-output", lines: ["ok2"] }],
  hints: ["console.log を使いましょう"],
  solution: {
    "script.js": 'console.log("ok2");\n',
  },
};
