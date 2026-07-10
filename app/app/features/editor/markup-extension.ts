// HTML / CSS 構造リントの CodeMirror 6 拡張(ADR #18)。
// 提出時にブロックされる構造エラーを、書いている最中に error 波線で予告する(§5.4 の予防装置)。
import { type Diagnostic, linter } from "@codemirror/lint";
import type { Extension } from "@codemirror/state";
import { markupDiagnostics, markupKindFor } from "./markup-lint";

export function markupLintExtension(fileName: string): Extension {
  const kind = markupKindFor(fileName);
  if (kind === null) return [];
  return linter((view): Diagnostic[] => markupDiagnostics(kind, view.state.doc.toString()), {
    delay: 400,
  });
}
