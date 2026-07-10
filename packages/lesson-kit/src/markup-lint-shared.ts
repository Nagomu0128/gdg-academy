// 構造リンター共有ユーティリティ(markup-lint / markup-lint-css 用)。
// 意図的に index.ts からは公開しない(公開 API は lintHtml / lintCss / suggestCssProperty / KNOWN_CSS_PROPERTIES)。
// 判定バンドル(esbuild IIFE)に同梱されるため依存ゼロの純粋 TS。

import { ZENKAKU_MAP } from "./zenkaku";

export type MarkupDiag = { line: number; message: string };

const WS_CHARS = new Set([" ", "\t", "\n", "\r", "\f"]);

export function isWs(ch: string | undefined): boolean {
  return ch !== undefined && WS_CHARS.has(ch);
}

/** 行頭 index の一覧(\n / \r\n / 単独 \r 対応)から index → 行番号(1 始まり)の対応を作る */
export function makeLineLookup(source: string): (index: number) => number {
  const starts: number[] = [0];
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "\n") {
      starts.push(i + 1);
    } else if (ch === "\r") {
      if (source[i + 1] === "\n") i++;
      starts.push(i + 1);
    }
  }
  return (index: number): number => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if ((starts[mid] as number) <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/** 全角英数字(ａ-ｚＡ-Ｚ０-９)なら対応する半角を返す(zenkaku.ts と同じ写像) */
export function fullwidthAlnumSuggestion(char: string): string | null {
  const code = char.codePointAt(0) ?? 0;
  if (
    (code >= 0xff10 && code <= 0xff19) || // ０-９
    (code >= 0xff21 && code <= 0xff3a) || // Ａ-Ｚ
    (code >= 0xff41 && code <= 0xff5a) // ａ-ｚ
  ) {
    return String.fromCharCode(code - 0xfee0);
  }
  return null;
}

/** 全角記号(＜＞＝＂等)・任意で全角英数字の半角対応を返す。対象外は null */
export function zenkakuSuggestionFor(char: string, includeAlnum: boolean): string | null {
  const mapped = ZENKAKU_MAP.get(char);
  if (mapped !== undefined) return mapped;
  return includeAlnum ? fullwidthAlnumSuggestion(char) : null;
}

export type ZenkakuFinding = { index: number; char: string; suggestion: string };

/**
 * テキスト中の最初の全角記号(includeAlnum なら全角英数字も)を探す。
 * 構文を構成すべき領域(タグ名・属性名・CSS 宣言など)に限って呼ぶこと —
 * 本文テキストや文字列リテラルに使うと偽陽性になる(§5.4)。
 */
export function findZenkakuIn(text: string, includeAlnum: boolean): ZenkakuFinding | null {
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] as string;
    const suggestion = zenkakuSuggestionFor(ch, includeAlnum);
    if (suggestion !== null) return { index: i, char: ch, suggestion };
  }
  return null;
}

/** 空白列を 1 個の半角スペースへ畳み、表示用に切り詰める(診断メッセージのヘッダ用) */
export function collapseForDisplay(text: string, maxLength = 40): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;
  return `${collapsed.slice(0, maxLength - 1)}…`;
}
