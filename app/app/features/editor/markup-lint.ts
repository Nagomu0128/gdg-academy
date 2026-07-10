// HTML / CSS 構造リント(ADR #18)のエディタ用純粋ロジック。
// lesson-kit の行番号診断を CodeMirror のオフセット診断へ変換する。CM6 への接続は markup-extension.ts。
import { lintCss, lintHtml, type MarkupDiag } from "@codesteps/lesson-kit";

export type MarkupLintDiagnostic = {
  from: number;
  to: number;
  severity: "error";
  message: string;
};

export function markupKindFor(fileName: string): "html" | "css" | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".css")) return "css";
  return null;
}

/** 該当行全体に error 波線を引く(提出時は同じ診断がブロックになる — 判定との一貫性) */
export function markupDiagnostics(kind: "html" | "css", source: string): MarkupLintDiagnostic[] {
  const diags: MarkupDiag[] = kind === "html" ? lintHtml(source) : lintCss(source);
  if (diags.length === 0) return [];
  const lines = source.split("\n");
  const starts: number[] = new Array(lines.length);
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    starts[i] = offset;
    offset += (lines[i] as string).length + 1;
  }
  return diags.map((diag) => {
    const idx = Math.min(Math.max(diag.line, 1), lines.length) - 1;
    const from = starts[idx] ?? 0;
    const text = (lines[idx] ?? "").replace(/\r$/, "");
    const to = Math.min(from + Math.max(text.length, 1), source.length);
    return { from, to: Math.max(to, from), severity: "error" as const, message: diag.message };
  });
}
