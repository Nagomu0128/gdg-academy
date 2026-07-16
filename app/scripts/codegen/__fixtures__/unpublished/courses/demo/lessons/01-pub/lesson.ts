export default {
  slug: "demo-01-pub",
  title: "公開レッスン",
  files: {
    "script.js": { initial: "// ok と出力しよう\n" },
  },
  checks: [{ type: "console", id: "ok-output", lines: ["ok"] }],
  hints: ["console.log を使いましょう"],
  solution: {
    "script.js": 'console.log("ok");\n',
  },
};
