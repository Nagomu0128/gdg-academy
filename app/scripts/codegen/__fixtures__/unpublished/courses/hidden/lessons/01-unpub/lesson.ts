export default {
  slug: "hidden-01-unpub",
  title: "非公開レッスン(コースごと)",
  published: false,
  files: {
    "script.js": { initial: "// hidden と出力しよう\n" },
  },
  checks: [{ type: "console", id: "hidden-output", lines: ["hidden"] }],
  hints: ["console.log を使いましょう"],
  solution: {
    "script.js": 'console.log("hidden");\n',
  },
};
