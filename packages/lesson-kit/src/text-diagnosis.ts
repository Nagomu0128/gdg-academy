// text check の全角診断(J-judge-hardening)。§5.4 と同じ症状駆動の原則。
// zenkaku.ts から分離している理由: zenkaku.ts は markup-lint 経由で tsconfig.node の
// スクリプトからも型検査されるため、DOM 型に触れる types.ts を import できない。
// 本モジュールは判定ランタイム / エディタ(ブラウザ側)専用。

import { textMatches } from "./normalize";
import type { TextCheck } from "./types";
import { ZENKAKU_MAP } from "./zenkaku";

const ZENKAKU_SPACE = "　";

/** ZENKAKU_MAP + 全角英数字ブロック(FF01-FF5E)を半角に写す。対象外の文字は null */
function halfWidthCharFor(ch: string): string | null {
  const mapped = ZENKAKU_MAP.get(ch);
  if (mapped !== undefined) return mapped;
  const code = ch.codePointAt(0) ?? 0;
  if (code >= 0xff01 && code <= 0xff5e) return String.fromCharCode(code - 0xfee0);
  return null;
}

/** 全角英数字・記号・全角スペースを半角へ変換する(それ以外の文字は保持) */
export function toHalfWidth(s: string): string {
  let out = "";
  for (const ch of s) {
    out += halfWidthCharFor(ch) ?? ch;
  }
  return out;
}

/**
 * text check 失敗時の全角診断(症状駆動 — §5.4 と同じ原則)。
 * 「actual を半角化すると check が合格する」ときだけ発火するため偽陽性がない
 * (期待値側が全角を要求するケースでは半角化が合格を生まないので発火しない)。
 * 例: 期待「3個です」に対し「３個です」→「「３」が全角で入力されています。…」
 */
export function diagnoseTextZenkaku(actual: string, check: TextCheck): string | null {
  const converted = toHalfWidth(actual);
  if (converted === actual) return null;
  if (!textMatches(converted, check)) return null;
  for (const ch of actual) {
    const half = halfWidthCharFor(ch);
    if (half !== null) {
      if (ch === ZENKAKU_SPACE) {
        return "全角スペースが入っています。半角スペースに直しましょう";
      }
      return `「${ch}」が全角で入力されています。半角の「${half}」に直しましょう`;
    }
  }
  return null;
}
