import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形(docs/specs/content-common-2.md):
// - commands.sh(editable): 学習者が書くコマンド
// - setup.sh(hidden): 初期状態のシード(リモートやコミット済み履歴が必要なレッスンで使う)
// - index.html / preview.js(hidden): vendor の GitSim でターミナル再生を表示
// - 判定: custom check が ctx.files から commands.sh を GitSim に通して状態を検証する
export default defineLesson({
  slug: "git-01-init",
  published: false,
  title: "リポジトリをつくろう",
  estMinutes: 6,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# ターミナルに打つコマンドを上から順に書こう(1行1コマンド)

# 1. git init でリポジトリをつくる

# 2. echo "# メモ帳アプリ" > README.md でファイルをつくる

# 3. git add README.md で記録の候補に載せる(ステージ)

# 4. git commit -m "最初のコミット" で記録する
`,
    },
    "setup.sh": {
      initial: `# このレッスンは何もない状態から始める(setup なし)
`,
      editable: false,
      hidden: true,
    },
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ターミナル</title>
    <style>
      html, body { height: 100%; margin: 0; }
      #terminal { height: 100%; }
    </style>
  </head>
  <body>
    <div id="terminal"></div>
    <script src="/vendor/git-sim.js"></script>
    <script src="preview.js"></script>
  </body>
</html>
`,
      editable: false,
      hidden: true,
    },
    "preview.js": {
      initial: `// commands.sh をターミナル風に再生する(vendor の GitSim)。
// __FILES__ はプレビュー合成時に注入される(判定時は無くてもよい)
var files = window.__FILES__ || {};
GitSim.renderPlayback(
  document.getElementById("terminal"),
  files["setup.sh"] || "",
  files["commands.sh"] || ""
);
`,
      editable: false,
      hidden: true,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-init",
      file: "commands.sh",
      pattern: "^\\s*git\\s+init\\s*$",
      flags: "m",
      message: "最初に git init と書いて、リポジトリをつくりましょう",
    },
    {
      type: "source",
      id: "use-add",
      file: "commands.sh",
      pattern: "^\\s*git\\s+add\\s+",
      flags: "m",
      message: "git add README.md で、つくったファイルをステージに載せましょう",
    },
    {
      type: "source",
      id: "use-commit",
      file: "commands.sh",
      pattern: "git\\s+commit\\s+-m",
      message: 'git commit -m "最初のコミット" で記録しましょう(メッセージは "" で囲みます)',
    },
    {
      type: "custom",
      id: "commit-created",
      message:
        "コマンドを上から実行すると「コミット1つ + README.md 記録済み」になるようにしましょう(プレビューのエラー表示も確認)",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return (
          !sim.hasErrors() &&
          sim.commitCount("HEAD") === 1 &&
          sim.fileContent("README.md") !== null &&
          sim.isClean()
        );
      },
    },
  ],
  hints: [
    "コメント(# の行)はそのままでOK。各コメントの下の行にコマンドを1つずつ書きます。プレビューに実行結果が流れます",
    '順番は git init → echo "# メモ帳アプリ" > README.md → git add README.md → git commit -m "最初のコミット" です',
    '4行をこの通りに書けば完成です:\ngit init\necho "# メモ帳アプリ" > README.md\ngit add README.md\ngit commit -m "最初のコミット"',
  ],
  solution: {
    "commands.sh": `# ターミナルに打つコマンドを上から順に書こう(1行1コマンド)

# 1. git init でリポジトリをつくる
git init

# 2. echo "# メモ帳アプリ" > README.md でファイルをつくる
echo "# メモ帳アプリ" > README.md

# 3. git add README.md で記録の候補に載せる(ステージ)
git add README.md

# 4. git commit -m "最初のコミット" で記録する
git commit -m "最初のコミット"
`,
  },
});
