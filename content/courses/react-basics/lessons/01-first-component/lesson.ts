import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-01-first-component",
  title: "はじめてのコンポーネント",
  estMinutes: 5,
  runner: "dom",
  files: {
    "index.html": {
      // React 本体は自オリジン配信の vendor スクリプト2本(順序が重要: react → react-dom)
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>React入門</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/vendor/react.production.min.js"></script>
    <script src="/vendor/react-dom.production.min.js"></script>
    <script src="app.jsx"></script>
  </body>
</html>
`,
      editable: false,
    },
    "app.jsx": {
      initial: `// Hello コンポーネントが画面に <h1> を表示するようにしよう
function Hello() {
  // ここの return を <h1>こんにちは、React!</h1> を返すように書き換えよう
  return null;
}

// root に Hello コンポーネントを描画する(そのままでOK)
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Hello />);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "return-jsx",
      file: "app.jsx",
      pattern: "return\\s*\\(?\\s*<h1>",
      message: "Hello の中で return <h1>...</h1> の形で JSX を返しましょう",
    },
    {
      type: "element",
      id: "h1-rendered",
      selector: "#root h1",
      count: 1,
      message: "画面(#root の中)に <h1> が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "h1-text",
      selector: "#root h1",
      equals: "こんにちは、React!",
      message: "<h1> の中身を「こんにちは、React!」にしましょう",
    },
  ],
  hints: [
    "コンポーネントは「画面の部品を返す関数」です。return で JSX(HTML そっくりの書き方)を返します",
    "return null; の null を JSX に置き換えます。JSX はそのまま <h1>...</h1> と書けます",
    "return <h1>こんにちは、React!</h1>; と書き換えれば完成です",
  ],
  solution: {
    "app.jsx": `function Hello() {
  return <h1>こんにちは、React!</h1>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Hello />);
`,
  },
});
