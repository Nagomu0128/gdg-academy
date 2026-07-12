import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-01-script-tag",
  title: "scriptタグでライブラリを使う",
  estMinutes: 5,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ライブラリ入門</title>
  </head>
  <body>
    <h1>記念日</h1>
    <p id="date"></p>
    <!-- ここに dayjs を読み込む script タグを書こう(src は /vendor/dayjs.min.js) -->

    <script src="main.js"></script>
  </body>
</html>
`,
    },
    "main.js": {
      initial: `// dayjs で日付を整形する(判定を安定させるため固定の日付を使う)
const day = dayjs("2026-01-01");

// ここで day.format("YYYY年MM月DD日") の結果を text に入れよう
const text = "";

document.getElementById("date").textContent = text;
console.log(text);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "load-dayjs",
      file: "index.html",
      pattern: "<script[^>]*src=[\"']?/vendor/dayjs\\.min\\.js",
      message: "dayjs を読み込む script タグを書きましょう(src は /vendor/dayjs.min.js)",
    },
    {
      type: "source",
      id: "use-format",
      file: "main.js",
      pattern: "day\\.format\\(",
      message: "day.format(...) を使って日付を整形しましょう",
    },
    {
      type: "text",
      id: "show-date",
      selector: "#date",
      equals: "2026年01月01日",
      message: "画面に 2026年01月01日 と表示されるようにしましょう(script タグの位置と format の書式を確認)",
    },
    {
      type: "console",
      id: "log-date",
      lines: ["2026年01月01日"],
      message: "コンソールに 2026年01月01日 と出力されるようにしましょう",
    },
  ],
  hints: [
    'ライブラリも自分のコードと同じで、<script src="..."></script> で読み込みます。main.js より前に読み込むのがポイントです',
    'コメントの位置に <script src="/vendor/dayjs.min.js"></script> を書きます',
    'main.js は const text = day.format("YYYY年MM月DD日"); に書き換えれば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ライブラリ入門</title>
  </head>
  <body>
    <h1>記念日</h1>
    <p id="date"></p>
    <script src="/vendor/dayjs.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
    "main.js": `const day = dayjs("2026-01-01");

const text = day.format("YYYY年MM月DD日");

document.getElementById("date").textContent = text;
console.log(text);
`,
  },
});
