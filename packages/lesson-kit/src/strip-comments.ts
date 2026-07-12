// コメント除去(docs/specs/J-judge-hardening.md)。
// source check の `ignoreComments: true` が使う純粋ユーティリティ。
// 判定バンドルに入るため acorn は使わない(軽量ステートマシン)。
//
// 置換規則: コメントは「1 個の空白」に置き換える(パーサにとってコメント=空白であることに合わせ、
// 除去によって前後のトークンが結合して偽マッチが生まれるのを防ぐ)。コメント内の改行は保持し、
// 行番号ベースの診断が除去後もずれないようにする。
//
// 安全側の原則: 判定に迷う `/` は「コメントとして削らない」側に倒す。誤ってコードを消すより、
// コメントを消し残す方が偽陽性が起きにくい(ignoreComments はコメント誤マッチ対策が目的で、
// コメントが少々残ってもパターン一致には通常無害)。
//
// 既知の制限(意図的なトレードオフ):
// - JS の正規表現リテラルは簡易ヒューリスティックで追跡する(直前の「意味のあるトークン」が
//   値 = 識別子/数値/文字列/正規表現/) ] } なら `/` は除算、さもなくば正規表現の開始)。これにより
//   `str.split(/\//)` や `/^\/api\//` のような `\/` 直後に `/` が続く形をコメント開始と誤認しない。
//   曖昧な `}`(ブロック終端か式終端か不定)は除算側に倒すため、ブロック直後の正規表現
//   (`if(x){} /re/.test(s)`)は認識されない — が、これは「コメントを消し残す」安全側の失敗であり
//   コードを誤って削らない。
// - HTML の属性値内 `<!--`(例: content="Use <!-- ...")や raw-text 要素(<script>/<style>)内の
//   `<!--` はコメント開始と誤認しない(引用符・タグ境界・raw-text 境界を認識)。
// - HTML 内のインライン <script> / <style> の JS / CSS コメントは除去対象外(raw-text として逐語保持。
//   HTML コメントのみ除去)。

export type CommentLang = "js" | "css" | "html";

/** ファイル名の拡張子からコメント言語を推定する。不明な拡張子は null */
export function commentLangForFile(fileName: string): CommentLang | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "js";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  return null;
}

/** コメント本文を「改行は保持 + それ以外は 1 空白」の置換文字列にする */
function commentReplacement(comment: string): string {
  const newlines = comment.match(/\n/g);
  return newlines === null ? " " : newlines.join("");
}

/** `<` の直後がタグ(開始/終了/宣言)の始まりを示す文字かどうか。素の `<`(テキスト)と区別する */
function isHtmlTagStart(next: string | undefined): boolean {
  if (next === undefined) return false;
  return (
    (next >= "a" && next <= "z") ||
    (next >= "A" && next <= "Z") ||
    next === "/" ||
    next === "!" ||
    next === "?"
  );
}

/** `<` から始まるタグを `>` まで走査(属性値の引用符を尊重)。終端の次位置・小文字タグ名・終了タグかを返す */
function scanHtmlTag(source: string, start: number): { end: number; name: string; isEnd: boolean } {
  const n = source.length;
  let i = start + 1;
  const isEnd = source[i] === "/";
  if (isEnd) i += 1;
  let name = "";
  while (i < n) {
    const ch = source[i] as string;
    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || (ch >= "0" && ch <= "9")) {
      name += ch;
      i += 1;
      continue;
    }
    break;
  }
  let quote: '"' | "'" | null = null;
  while (i < n) {
    const ch = source[i] as string;
    if (quote !== null) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      i += 1;
      break;
    }
    i += 1;
  }
  return { end: i, name: name.toLowerCase(), isEnd };
}

/** raw-text 要素の終了タグ `</name` の開始位置を返す(なければ末尾) */
function findRawTextClose(source: string, from: number, name: string): number {
  const idx = source.toLowerCase().indexOf(`</${name}`, from);
  return idx === -1 ? source.length : idx;
}

function stripHtmlComments(source: string): string {
  const n = source.length;
  let out = "";
  let i = 0;
  while (i < n) {
    const ch = source[i] as string;
    // <!-- --> はデータ状態(タグ外)でのみコメント。属性値内・raw-text 内の <!-- はここへ来ない
    if (ch === "<" && source.startsWith("<!--", i)) {
      const end = source.indexOf("-->", i + 4);
      // 未終端コメントは末尾まで(ブラウザの寛容パースと同じ扱い)
      const commentEnd = end === -1 ? n : end + 3;
      out += commentReplacement(source.slice(i, commentEnd));
      i = commentEnd;
      continue;
    }
    // 開始/終了タグ・宣言(<!doctype> 等)は `>` まで逐語コピー(引用符を尊重)し、内部の <!-- を無視する
    if (ch === "<" && isHtmlTagStart(source[i + 1])) {
      const tag = scanHtmlTag(source, i);
      out += source.slice(i, tag.end);
      i = tag.end;
      // raw-text 要素(<script>/<style>)の開始タグは終了タグまで逐語保持(内部を CSS/JS として扱わない)
      if (!tag.isEnd && (tag.name === "script" || tag.name === "style")) {
        const close = findRawTextClose(source, i, tag.name);
        out += source.slice(i, close);
        i = close;
      }
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

function stripCssComments(source: string): string {
  let out = "";
  let i = 0;
  let inString: '"' | "'" | null = null;
  while (i < source.length) {
    const ch = source[i] as string;
    if (inString !== null) {
      out += ch;
      if (ch === "\\" && i + 1 < source.length) {
        out += source[i + 1];
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      out += ch;
      i += 1;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? source.length : end + 2;
      out += commentReplacement(source.slice(i, commentEnd));
      i = commentEnd;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

// これらのキーワードの直後の `/` は除算ではなく正規表現リテラルの開始とみなす(式が続く位置)。
const JS_REGEX_PRECEDING_KEYWORDS = new Set([
  "return",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "do",
  "else",
  "yield",
  "await",
  "case",
  "throw",
]);

/** JS の識別子・数値を構成しうる文字(非 ASCII も語の一部とみなし、走査を壊さない) */
function isJsWordChar(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "_" ||
    ch === "$" ||
    ch.charCodeAt(0) > 0x7f
  );
}

/** source[start] を quote 始まりの文字列とみなし終端の次位置を返す。素の改行 / 末尾で止める(安全側) */
function scanJsString(source: string, start: number, quote: string): number {
  const n = source.length;
  let i = start + 1;
  while (i < n) {
    const ch = source[i] as string;
    if (ch === "\\") {
      i += 2; // エスケープ(行継続 \<改行> 含む)は次の 1 文字を飛ばす
      continue;
    }
    if (ch === quote) return i + 1;
    if (ch === "\n" || ch === "\r") return i; // 素の改行で終端(未終端文字列 — 行を跨がない)
    i += 1;
  }
  return n;
}

/**
 * source[start] === "/" を正規表現リテラルとみなし終端の次位置を返す。
 * 文字クラス `[...]` 内の `/` は非デリミタとして扱い、`\` エスケープ(\/ や \[)を尊重する。
 * 改行混入・未終端など正規表現として成立しない場合は null(呼び出し側は除算として扱う = 安全側)。
 */
function scanJsRegex(source: string, start: number): number | null {
  const n = source.length;
  let i = start + 1;
  let inClass = false;
  while (i < n) {
    const ch = source[i] as string;
    if (ch === "\n" || ch === "\r") return null; // 正規表現リテラルは改行を含まない
    if (ch === "\\") {
      i += 2; // エスケープは次の 1 文字を飛ばす
      continue;
    }
    if (ch === "[") {
      inClass = true;
    } else if (ch === "]") {
      inClass = false;
    } else if (ch === "/" && !inClass) {
      i += 1;
      while (i < n && /[a-z]/i.test(source[i] as string)) i += 1; // フラグ
      return i;
    }
    i += 1;
  }
  return null; // 未終端
}

function stripJsComments(source: string): string {
  const n = source.length;
  let out = "";
  let i = 0;
  let inTemplate = false; // テンプレートリテラル `...` の生テキスト内か
  const templateStack: number[] = []; // 各 ${ 補間の外側のブレース深度
  let braceDepth = 0;
  // 直前の「意味のあるトークン」が値(識別子/数値/文字列/正規表現/) ] })なら true。
  // このとき `/` は除算、さもなくば正規表現リテラルの開始とみなす(標準的なヒューリスティック)。
  let prevWasValue = false;

  while (i < n) {
    const ch = source[i] as string;

    if (inTemplate) {
      out += ch;
      if (ch === "\\" && i + 1 < n) {
        out += source[i + 1] as string;
        i += 2;
        continue;
      }
      if (ch === "$" && source[i + 1] === "{") {
        out += "{";
        templateStack.push(braceDepth);
        braceDepth = 0;
        inTemplate = false;
        prevWasValue = false; // 補間の先頭は式の位置
        i += 2;
        continue;
      }
      if (ch === "`") {
        inTemplate = false;
        prevWasValue = true; // テンプレートリテラルは値
      }
      i += 1;
      continue;
    }

    // 空白(コメントと同じく prevWasValue は据え置き)
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f" || ch === "\v") {
      out += ch;
      i += 1;
      continue;
    }

    // 文字列
    if (ch === '"' || ch === "'") {
      const end = scanJsString(source, i, ch);
      out += source.slice(i, end);
      i = end;
      prevWasValue = true;
      continue;
    }

    // テンプレートリテラル開始
    if (ch === "`") {
      out += ch;
      inTemplate = true;
      i += 1;
      continue;
    }

    // 行コメント(`//` は式位置でも常にコメント — 空の正規表現 // は JS に存在しない)
    if (ch === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i + 2);
      i = end === -1 ? n : end; // 改行の手前まで(改行自体は残す)
      out += " ";
      continue;
    }
    // ブロックコメント
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? n : end + 2;
      out += commentReplacement(source.slice(i, commentEnd));
      i = commentEnd;
      continue;
    }
    // 正規表現リテラル or 除算
    if (ch === "/") {
      if (!prevWasValue) {
        const end = scanJsRegex(source, i);
        if (end !== null) {
          out += source.slice(i, end); // 正規表現は逐語コピー(内部の // /* を削らない)
          i = end;
          prevWasValue = true;
          continue;
        }
      }
      out += ch; // 除算(または正規表現と判定できなかった `/` — 安全側)
      i += 1;
      prevWasValue = false;
      continue;
    }

    // 識別子・キーワード・数値(1 トークンとしてまとめて消費し、キーワード判定を可能にする)
    if (isJsWordChar(ch)) {
      let j = i + 1;
      while (j < n && isJsWordChar(source[j] as string)) j += 1;
      const word = source.slice(i, j);
      out += word;
      i = j;
      prevWasValue = !JS_REGEX_PRECEDING_KEYWORDS.has(word);
      continue;
    }

    // ブレース(テンプレート補間の対応を追跡)
    if (ch === "{") {
      braceDepth += 1;
      out += ch;
      i += 1;
      prevWasValue = false;
      continue;
    }
    if (ch === "}") {
      if (braceDepth === 0 && templateStack.length > 0) {
        // 補間の終わり: テンプレートリテラル本文へ戻る
        braceDepth = templateStack.pop() as number;
        out += ch;
        i += 1;
        inTemplate = true;
        continue;
      }
      braceDepth = Math.max(0, braceDepth - 1);
      out += ch;
      i += 1;
      prevWasValue = true; // } は値終端とみなす(続く / は除算)
      continue;
    }

    // その他の区切り文字
    out += ch;
    i += 1;
    prevWasValue = ch === ")" || ch === "]";
  }
  return out;
}

/** 言語別にコメントを除去する。throw しない(未終端等は寛容に処理) */
export function stripComments(source: string, lang: CommentLang): string {
  switch (lang) {
    case "html":
      return stripHtmlComments(source);
    case "css":
      return stripCssComments(source);
    case "js":
      return stripJsComments(source);
  }
}

/** ファイル名から言語を推定して除去する。不明な拡張子は原文のまま返す */
export function stripCommentsForFile(fileName: string, source: string): string {
  const lang = commentLangForFile(fileName);
  return lang === null ? source : stripComments(source, lang);
}
