import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// 総合ハンズオン(git-sim)。Issue → ブランチ → コミット → (PR相当) → レビュー → マージ → 片付け を一巡する。
// 雛形は content/courses/git/lessons/01-init/ からコピー。conflict は使わず、健全系(FF マージ)に絞る。
// custom check は複数述語で最終状態(main に戻り・Conventional Commit が取り込まれ・feature 削除済み・clean)を検証する。
export default defineLesson({
  slug: "team-08-team-flow",
  title: "総合: 開発フロー一巡",
  estMinutes: 10,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# 総合練習: Issue → ブランチ → コミット → (PR相当) → レビュー → マージ → 片付け の一巡です。
# これまで学んだことの総まとめ。各手順の下にコマンドを1つずつ書こう(# はコメント)。

# 1. Issue に対応する feature ブランチを作って切り替える


# 2. README を1行書きかえる(echo の >> は追記になる)


# 3. 変更をステージして、Conventional Commits の形でコミットする


# 4. main に戻る(レビューが通った、というつもりで)


# 5. feature を main に取り込む(マージ)


# 6. 使い終わった feature ブランチを片付ける
`,
    },
    "setup.sh": {
      initial: `# ここから始めよう: main に初期コミットが1つある、きれいな状態
git init
echo "# チームアプリ" > README.md
git add README.md
git commit -m "chore: リポジトリ初期化"
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
      id: "create-branch",
      file: "commands.sh",
      pattern: "^\\s*git\\s+(switch\\s+-c|checkout\\s+-b)\\s+\\S+",
      flags: "m",
      message: "git switch -c ブランチ名 で feature ブランチを作って切り替えましょう",
    },
    {
      type: "source",
      id: "conventional-commit",
      file: "commands.sh",
      pattern: 'git\\s+commit\\s+-m\\s+"(feat|fix|docs|refactor|test|chore|style)',
      flags: "m",
      message: 'コミットは Conventional Commits で。git commit -m "feat: ..." のように type を付けましょう',
    },
    {
      type: "source",
      id: "merge",
      file: "commands.sh",
      pattern: "^\\s*git\\s+merge\\s+\\S+",
      flags: "m",
      message: "main に切り替えてから git merge ブランチ名 で feature を取り込みましょう",
    },
    {
      type: "custom",
      id: "flow-complete",
      message:
        "一巡を完成させましょう。最後は main に戻り、Conventional Commits のコミットが main に取り込まれ、feature ブランチは片付けて、きれいな状態にします",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        const conventional = /^(feat|fix|docs|refactor|test|chore|style)(\(.+\))?:\s/;
        return (
          !sim.hasErrors() &&
          sim.currentBranch() === "main" &&
          sim.commitCount("main") >= 2 &&
          sim.log("main").some((m) => conventional.test(m)) &&
          sim.branches().length === 1 &&
          sim.isClean()
        );
      },
    },
  ],
  hints: [
    "これまでの総まとめです。feature ブランチを作る → コミット → main に戻る → マージ → 片付け、の順に進めます",
    'コミットは Conventional Commits(feat: など)で。マージは main に切り替えてから git merge、片付けは git branch -d feature/login です',
    `この順に書けば完成します:
git switch -c feature/login
echo "- ログイン機能" >> README.md
git add README.md
git commit -m "feat: ログイン機能を追加"
git switch main
git merge feature/login
git branch -d feature/login`,
  ],
  solution: {
    "commands.sh": `# 総合練習: Issue → ブランチ → コミット → (PR相当) → レビュー → マージ → 片付け の一巡です。
# これまで学んだことの総まとめ。各手順の下にコマンドを1つずつ書こう(# はコメント)。

# 1. Issue に対応する feature ブランチを作って切り替える
git switch -c feature/login

# 2. README を1行書きかえる(echo の >> は追記になる)
echo "- ログイン機能" >> README.md

# 3. 変更をステージして、Conventional Commits の形でコミットする
git add README.md
git commit -m "feat: ログイン機能を追加"

# 4. main に戻る(レビューが通った、というつもりで)
git switch main

# 5. feature を main に取り込む(マージ)
git merge feature/login

# 6. 使い終わった feature ブランチを片付ける
git branch -d feature/login
`,
  },
});
