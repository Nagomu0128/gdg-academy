// CSS 構造リンター + プロパティ名タイポ提案(DesignDoc §5.4)。
// lintHtml と同じ原則: 偽陽性ゼロ側に倒す。最後の宣言の「;」省略・@media ネスト・url() 内の
// 「:」「;」・文字列内の「{」など、合法な書き方は咎めず、構造が壊れているケース
// (閉じ忘れ・「:」「;」「{」抜け)だけを検出する。
// 判定バンドル(esbuild IIFE)に同梱されるため依存ゼロの純粋 TS(zod / acorn 禁止)。

import {
  collapseForDisplay,
  findZenkakuIn,
  isWs,
  type MarkupDiag,
  makeLineLookup,
  type ZenkakuFinding,
} from "./markup-lint-shared";
import { formatZenkakuDiagnosis } from "./zenkaku";

/**
 * suggestCssProperty が参照する既知プロパティ集合。
 * 教材で使う全 longhand + 頻出プロパティを厳選(shorthand もゲート用途のため「既知」に含める)。
 * 判定バンドルにも入るため軽量に保つ(80〜120 個)。
 */
export const KNOWN_CSS_PROPERTIES: ReadonlySet<string> = new Set([
  "align-content",
  "align-items",
  "align-self",
  "animation",
  "aspect-ratio",
  "background",
  "background-color",
  "background-image",
  "background-position",
  "background-repeat",
  "background-size",
  "border",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-shadow",
  "box-sizing",
  "color",
  "column-gap",
  "content",
  "cursor",
  "display",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "font",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "gap",
  "grid",
  "grid-area",
  "grid-column",
  "grid-row",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "height",
  "justify-content",
  "left",
  "letter-spacing",
  "line-height",
  "list-style",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "object-fit",
  "opacity",
  "outline",
  "outline-color",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "place-items",
  "position",
  "right",
  "row-gap",
  "text-align",
  "text-decoration",
  "text-indent",
  "text-shadow",
  "text-transform",
  "top",
  "transform",
  "transition",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "vertical-align",
  "visibility",
  "white-space",
  "width",
  "word-break",
  "z-index",
]);

/** Damerau-Levenshtein 距離(隣接転置つき・OSA)。プロパティ名程度の短い文字列専用 */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const k = b.length;
  if (m === 0) return k;
  if (k === 0) return m;
  let prev2: number[] = [];
  let prev: number[] = [];
  let current: number[] = [];
  for (let j = 0; j <= k; j++) prev.push(j);
  for (let i = 1; i <= m; i++) {
    current = [i];
    for (let j = 1; j <= k; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(
        (prev[j] as number) + 1, // 削除
        (current[j - 1] as number) + 1, // 挿入
        (prev[j - 1] as number) + cost, // 置換
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, (prev2[j - 2] as number) + 1); // 隣接転置
      }
      current.push(value);
    }
    prev2 = prev;
    prev = current;
  }
  return prev[k] as number;
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i++;
  return i;
}

/**
 * 症状駆動のタイポ提案: 未知の CSS プロパティ名に対し既知プロパティ(距離 <= 2、
 * 長さ 4 未満は距離 1)の最近傍を返す。同距離複数なら先頭一致(共通接頭辞長)優先。
 * 既知そのもの・候補なしは null。
 */
export function suggestCssProperty(prop: string): string | null {
  const p = prop.trim().toLowerCase();
  if (p.length === 0) return null;
  if (KNOWN_CSS_PROPERTIES.has(p)) return null;
  const maxDistance = p.length < 4 ? 1 : 2;
  let best: string | null = null;
  let bestDistance = maxDistance + 1;
  let bestPrefix = -1;
  for (const candidate of KNOWN_CSS_PROPERTIES) {
    if (Math.abs(candidate.length - p.length) > maxDistance) continue;
    const distance = editDistance(p, candidate);
    if (distance > maxDistance) continue;
    const prefix = commonPrefixLength(p, candidate);
    if (distance < bestDistance || (distance === bestDistance && prefix > bestPrefix)) {
      best = candidate;
      bestDistance = distance;
      bestPrefix = prefix;
    }
  }
  return best;
}

/** 中身を「ルールの並び」として再帰処理する at-rule(§: @media 等はネストを再帰 lint) */
const NESTED_RULE_AT_RULES = new Set([
  "media",
  "supports",
  "layer",
  "container",
  "scope",
  "document",
  "keyframes",
  "-webkit-keyframes",
  "-moz-keyframes",
]);

/** 中身を宣言ブロックとして処理する at-rule */
const DECLARATION_AT_RULES = new Set(["font-face", "page", "counter-style", "property"]);

const KNOWN_PROP_AT_LINE_START = /^[ \t]*([a-zA-Z][a-zA-Z0-9-]*)[ \t]*:/;
const LEADING_IDENT = /^-{0,2}[a-zA-Z][a-zA-Z0-9-]*/;
/** ASCII / 全角英数字とハイフンだけで出来た「プロパティ名らしい」トークン */
const IDENT_LIKE = /^[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９－-]+$/;

type PendingDiag = MarkupDiag & { pos: number };

type ScanResult = {
  /** 停止文字("" = EOF)。停止文字は未消費 */
  stop: string;
  /** 走査開始位置 */
  startPos: number;
  /** 最初の内容文字(非空白・非トリビア)の位置。無ければ -1 */
  firstContentPos: number;
  /** 最後の内容文字の位置。無ければ -1 */
  lastContentPos: number;
  /** 文字列・コメント・括弧内を空白化した本文(source と同じ長さ対応で startPos 起点) */
  masked: string;
};

/**
 * CSS の構造エラー(ブロック用)。位置順。空配列 = OK。
 * 検出するのは「壊れている」ケースのみ: `{` `}` の閉じ忘れ / 対応しない `}` /
 * セレクタ直後の `{` 抜け / 宣言の `:` 抜け / 既知プロパティゲート付きの `;` 抜け /
 * 閉じないコメント / 宣言・セレクタ内の全角記号。
 */
export function lintCss(source: string): MarkupDiag[] {
  const diags: PendingDiag[] = [];
  const lineAt = makeLineLookup(source);
  const n = source.length;
  let i = 0;

  const report = (pos: number, message: string): void => {
    diags.push({ pos, line: lineAt(pos), message });
  };
  const reportZenkaku = (pos: number, finding: ZenkakuFinding): void => {
    const line = lineAt(pos);
    diags.push({ pos, line, message: formatZenkakuDiagnosis(line, finding.char, finding.suggestion) });
  };
  const reportUnclosedComment = (pos: number): void => {
    report(pos, `${lineAt(pos)}行目の「/*」が「*/」で閉じられていません`);
  };
  const reportUnclosedBlock = (pos: number, header: string): void => {
    report(pos, `${lineAt(pos)}行目の「${header} {」が「}」で閉じられていません`);
  };

  /** コメントと空白を読み飛ばす。閉じない `/*` はエラー 1 回 + EOF まで消費 */
  const skipTrivia = (): void => {
    for (;;) {
      while (i < n && isWs(source[i] as string)) i++;
      if (source.startsWith("/*", i)) {
        const close = source.indexOf("*/", i + 2);
        if (close === -1) {
          reportUnclosedComment(i);
          i = n;
          return;
        }
        i = close + 2;
        continue;
      }
      return;
    }
  };

  /** 文字列を消費(i は開始クオート)。CSS の bad-string 準拠で改行の手前で打ち切る */
  const skipString = (): void => {
    const quote = source[i] as string;
    i++;
    while (i < n) {
      const ch = source[i] as string;
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === quote) {
        i++;
        return;
      }
      if (ch === "\n" || ch === "\r") return; // bad-string: 偽陽性回避を優先して打ち切り
      i++;
    }
  };

  /**
   * stops のいずれか(括弧の外・文字列/コメントの外)まで走査する。停止文字は未消費。
   * masked は文字列・コメント・括弧内を空白化したコピー(位置解析・全角検出用)。
   */
  const scanUntil = (stops: string): ScanResult => {
    const startPos = i;
    let masked = "";
    let depth = 0;
    let firstContentPos = -1;
    let lastContentPos = -1;
    const note = (pos: number): void => {
      if (firstContentPos === -1) firstContentPos = pos;
      lastContentPos = pos;
    };
    while (i < n) {
      const ch = source[i] as string;
      if (source.startsWith("/*", i)) {
        const close = source.indexOf("*/", i + 2);
        if (close === -1) {
          reportUnclosedComment(i);
          masked += " ".repeat(n - i);
          i = n;
          break;
        }
        masked += " ".repeat(close + 2 - i);
        i = close + 2;
        continue;
      }
      if (ch === '"' || ch === "'") {
        const stringStart = i;
        note(i);
        skipString();
        masked += " ".repeat(i - stringStart);
        continue;
      }
      if (ch === "(") {
        depth++;
        note(i);
        masked += ch;
        i++;
        continue;
      }
      if (ch === ")") {
        depth = Math.max(0, depth - 1);
        note(i);
        masked += ch;
        i++;
        continue;
      }
      if (depth === 0 && stops.includes(ch)) {
        return { stop: ch, startPos, firstContentPos, lastContentPos, masked };
      }
      if (!isWs(ch)) note(i);
      // 括弧内は url(データ URI 等) を含み得るため解析対象から外す(空白化)
      masked += depth > 0 ? " " : ch;
      i++;
    }
    return { stop: "", startPos, firstContentPos, lastContentPos, masked };
  };

  /** `{` から対応する `}` までを lint せずに消費する(未知の at-rule 用)。閉じたかを返す */
  const consumeMatchedBlock = (): boolean => {
    let depth = 0;
    while (i < n) {
      const ch = source[i] as string;
      if (source.startsWith("/*", i)) {
        const close = source.indexOf("*/", i + 2);
        if (close === -1) {
          reportUnclosedComment(i);
          i = n;
          return false;
        }
        i = close + 2;
        continue;
      }
      if (ch === '"' || ch === "'") {
        skipString();
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          i++;
          return true;
        }
      }
      i++;
    }
    return false;
  };

  type ValueResult = {
    /** ";" / "}" / "{" / "missing-semicolon" / ""(EOF)。";" 以外は未消費 */
    stop: string;
    lastContentPos: number;
    masked: string;
    startPos: number;
  };

  /** 宣言の値を走査する。改行 + 「既知プロパティ + :」で ; 抜けヒューリスティックを発火 */
  const scanDeclarationValue = (isCustomProperty: boolean): ValueResult => {
    const startPos = i;
    let masked = "";
    let depth = 0;
    let lastContentPos = -1;
    while (i < n) {
      const ch = source[i] as string;
      if (source.startsWith("/*", i)) {
        const close = source.indexOf("*/", i + 2);
        if (close === -1) {
          reportUnclosedComment(i);
          masked += " ".repeat(n - i);
          i = n;
          break;
        }
        masked += " ".repeat(close + 2 - i);
        i = close + 2;
        continue;
      }
      if (ch === '"' || ch === "'") {
        const stringStart = i;
        lastContentPos = i;
        skipString();
        masked += " ".repeat(i - stringStart);
        continue;
      }
      if (ch === "(") {
        depth++;
        lastContentPos = i;
        masked += ch;
        i++;
        continue;
      }
      if (ch === ")") {
        depth = Math.max(0, depth - 1);
        lastContentPos = i;
        masked += ch;
        i++;
        continue;
      }
      if (depth === 0) {
        if (ch === ";") {
          i++; // ";" は消費して宣言終了
          return { stop: ";", lastContentPos, masked, startPos };
        }
        if (ch === "}") {
          return { stop: "}", lastContentPos, masked, startPos };
        }
        if (ch === "{") {
          if (isCustomProperty) {
            // カスタムプロパティ値の { } は合法(任意トークン列)— 対応の閉じまで消費
            const blockStart = i;
            consumeMatchedBlock();
            masked += " ".repeat(i - blockStart);
            continue;
          }
          return { stop: "{", lastContentPos, masked, startPos };
        }
        if ((ch === "\n" || ch === "\r") && !isCustomProperty && lastContentPos !== -1) {
          // missing-semicolon(既知プロパティゲート付き):
          // 値の途中で改行し、次行が「既知プロパティ名 + :」で始まるなら直前の宣言の ; 抜け
          const nextLineStart = ch === "\r" && source[i + 1] === "\n" ? i + 2 : i + 1;
          let lineEnd = source.indexOf("\n", nextLineStart);
          if (lineEnd === -1) lineEnd = n;
          const m = KNOWN_PROP_AT_LINE_START.exec(source.slice(nextLineStart, lineEnd));
          if (m !== null && KNOWN_CSS_PROPERTIES.has((m[1] as string).toLowerCase())) {
            i = nextLineStart; // 次行頭から新しい宣言として読み直す
            return { stop: "missing-semicolon", lastContentPos, masked, startPos };
          }
        }
      }
      if (!isWs(ch)) lastContentPos = i;
      masked += depth > 0 ? " " : ch;
      i++;
    }
    return { stop: "", lastContentPos, masked, startPos };
  };

  /** 宣言ブロックの中身を処理する(呼び出し時点で `{` は消費済み) */
  const parseDeclarationBlock = (headerPos: number, header: string, synthetic: boolean): void => {
    for (;;) {
      skipTrivia();
      if (i >= n) {
        // synthetic は missing-brace 回復用の仮ブロック — 実在の `{` が無いので閉じ忘れは報告しない
        if (!synthetic) reportUnclosedBlock(headerPos, header);
        return;
      }
      const ch = source[i] as string;
      if (ch === "}") {
        i++;
        return;
      }
      if (ch === ";") {
        i++;
        continue;
      }
      const unit = scanUntil(":;{}");
      const unitStart = unit.firstContentPos === -1 ? unit.startPos : unit.firstContentPos;
      const unitLead = unit.masked.length - unit.masked.trimStart().length;

      if (unit.stop === ":") {
        i++; // ":"
        const prop = unit.masked.trim();
        const isCustomProperty = prop.startsWith("--");
        // プロパティ位置の全角(ｃｏｌｏｒ 等)。カスタムプロパティは日本語名等も合法なので除外
        let propZenkaku: ZenkakuFinding | null = null;
        if (!isCustomProperty && IDENT_LIKE.test(prop)) {
          propZenkaku = findZenkakuIn(prop, true);
        }
        const value = scanDeclarationValue(isCustomProperty);
        if (value.stop === "{") {
          // 宣言ではなくネストしたルール(a:hover { … } 等)だった — 再解釈して再帰
          const bracePos = i;
          i++;
          parseDeclarationBlock(unitStart, collapseForDisplay(source.slice(unitStart, bracePos)), false);
          continue;
        }
        if (propZenkaku !== null) {
          reportZenkaku(unit.startPos + unitLead + propZenkaku.index, propZenkaku);
          continue;
        }
        if (value.stop === "missing-semicolon") {
          // 値の中の全角記号(；等)があればそちらを優先(全角英数字は値として合法なので見ない)
          const zenkaku = findZenkakuIn(value.masked, false);
          if (zenkaku !== null) reportZenkaku(value.startPos + zenkaku.index, zenkaku);
          else {
            report(
              value.lastContentPos,
              `${lineAt(value.lastContentPos)}行目: 宣言の終わりに「;」が必要です`,
            );
          }
        }
        // ";" は消費済み / "}"・EOF はループ先頭で処理
        continue;
      }

      // コロンなしの塊(unit.stop は ";" / "{" / "}" / EOF)
      if (unit.stop === "{") {
        // ネストしたルール(& div { … } 等)
        const bracePos = i;
        i++;
        parseDeclarationBlock(unitStart, collapseForDisplay(source.slice(unitStart, bracePos)), false);
        continue;
      }
      const text = unit.masked.trim();
      if (text.length > 0) {
        // 全角記号(：など)の打ち間違いを優先。全角英数字は値・フォント名として合法なので見ない
        const zenkaku = findZenkakuIn(text, false);
        if (zenkaku !== null) {
          reportZenkaku(unit.startPos + unitLead + zenkaku.index, zenkaku);
        } else {
          const m = LEADING_IDENT.exec(text);
          const propName = m === null ? "" : m[0].toLowerCase();
          if (KNOWN_CSS_PROPERTIES.has(propName)) {
            // missing-colon: 既知プロパティの直後に ":" が無い(color red; / color})
            report(
              unitStart,
              `${lineAt(unitStart)}行目:「${propName}」の後ろに「:」が必要です(例: ${propName}: 値;)`,
            );
          }
          // 未知トークンは咎めない(偽陽性ゼロ側)
        }
      }
      if (unit.stop === ";") i++;
      // "}"・EOF はループ先頭で処理
    }
  };

  /** `;` で終わった(= ブロックの無い)トップレベルの塊を解析する。`;` は消費済み */
  const analyzeBrokenPrelude = (prelude: ScanResult, preludeStart: number): void => {
    const masked = prelude.masked;
    // 全角記号(｛ 等)の打ち間違いを優先
    const zenkaku = findZenkakuIn(masked, false);
    if (zenkaku !== null) {
      reportZenkaku(prelude.startPos + zenkaku.index, zenkaku);
      // ユーザーの意図した「ブロック内」として続きを読む(連鎖エラー防止)
      parseDeclarationBlock(preludeStart, collapseForDisplay(masked), true);
      return;
    }
    // missing-brace: 「セレクタ 既知プロパティ: 値;」の形なら { 抜け
    const re = /(^|[\s>+~,])([a-zA-Z-][a-zA-Z0-9-]*)[ \t]*:/g;
    let m = re.exec(masked);
    while (m !== null) {
      const ident = (m[2] as string).toLowerCase();
      if (KNOWN_CSS_PROPERTIES.has(ident)) {
        const identOffset = m.index + (m[1] as string).length;
        const selector = collapseForDisplay(masked.slice(0, identOffset));
        if (identOffset === 0 || selector === "") return; // セレクタの無い裸の宣言は下流の check に委ねる
        report(preludeStart, `${lineAt(preludeStart)}行目: セレクタ「${selector}」の後ろに「{」が必要です`);
        // 続きを「ブロック内」として読み、閉じ `}` も静かに消費する(連鎖エラー防止)
        parseDeclarationBlock(preludeStart, selector, true);
        return;
      }
      m = re.exec(masked);
    }
    // 既知プロパティが見つからなければ咎めない(偽陽性ゼロ側)
  };

  /** at-rule を処理する(i は "@") */
  const parseAtRule = (): void => {
    const atPos = i;
    i++; // "@"
    while (i < n && /[a-zA-Z0-9-]/.test(source[i] as string)) i++;
    const name = source.slice(atPos + 1, i).toLowerCase();
    const prelude = scanUntil(";{}");
    if (prelude.stop === ";") {
      i++; // 文 at-rule(@import 等)
      return;
    }
    if (prelude.stop === "{") {
      const bracePos = i;
      i++;
      const header = collapseForDisplay(source.slice(atPos, bracePos));
      if (NESTED_RULE_AT_RULES.has(name)) {
        const closed = parseRuleList(false);
        if (!closed) reportUnclosedBlock(atPos, header);
        return;
      }
      if (DECLARATION_AT_RULES.has(name)) {
        parseDeclarationBlock(atPos, header, false);
        return;
      }
      // 未知の at-rule: クラッシュせず対応の閉じまで消費(中身は lint しない — 偽陽性ゼロ側)
      i = bracePos;
      const closed = consumeMatchedBlock();
      if (!closed) reportUnclosedBlock(atPos, header);
      return;
    }
    // "}" は親が処理 / EOF は親ループが処理(書きかけの at-rule は咎めない)
  };

  /** ルールの並びを処理する。閉じ `}` に到達したら true(トップレベルは EOF で true) */
  const parseRuleList = (isTop: boolean): boolean => {
    for (;;) {
      skipTrivia();
      if (i >= n) return isTop;
      const ch = source[i] as string;
      if (ch === "}") {
        if (isTop) {
          // stray-close: 対応する { のない }
          report(i, `${lineAt(i)}行目に対応する「{」のない「}」があります。よぶんな「}」を削除しましょう`);
          i++;
          continue;
        }
        i++;
        return true;
      }
      if (ch === ";") {
        i++; // 迷い込んだ ; は無害(ブラウザも無視)— 咎めない
        continue;
      }
      if (ch === "@") {
        parseAtRule();
        continue;
      }
      // 修飾ルール。セレクタは ":" を含み得る(a:hover)ため ":" では止めない
      const prelude = scanUntil(";{}");
      const preludeStart = prelude.firstContentPos === -1 ? prelude.startPos : prelude.firstContentPos;
      if (prelude.stop === "{") {
        const bracePos = i;
        i++;
        parseDeclarationBlock(preludeStart, collapseForDisplay(source.slice(preludeStart, bracePos)), false);
        continue;
      }
      if (prelude.stop === ";") {
        i++;
        analyzeBrokenPrelude(prelude, preludeStart);
        continue;
      }
      // "}" はループ先頭で処理 / EOF(書きかけのセレクタ)は咎めない
      if (prelude.stop === "") continue;
    }
  };

  parseRuleList(true);
  return diags.sort((a, b) => a.pos - b.pos).map(({ line, message }) => ({ line, message }));
}
