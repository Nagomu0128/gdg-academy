// 演習画面(md+)のペイン幅ドラッグ調整の純ロジック(§2.3 の3ペインレイアウト拡張)。
// ドラッグ中の幅は「手順」「プレビュー」の2値のみを持ち、中央のエディタは flex-1 で残りを吸収する。

/** 手順ペインの初期幅。従来の固定幅 Tailwind w-80(320px)と同値 */
export const GUIDE_DEFAULT_WIDTH = 320;
export const GUIDE_MIN_WIDTH = 200;
export const PREVIEW_MIN_WIDTH = 240;
/** 中央エディタに最低限残す幅。これ以上ドラッグしてもハンドルが止まる */
export const EDITOR_MIN_WIDTH = 280;
/** ドラッグハンドル2本ぶんの幅(w-1.5 = 6px × 2)。エディタ最低幅の計算で差し引く */
export const HANDLES_TOTAL_WIDTH = 12;
/** キーボード(矢印キー)1 押下あたりの移動量 */
export const KEYBOARD_RESIZE_STEP = 16;

function clamp(value: number, min: number, max: number): number {
  // 画面が狭く max < min になるケースでは min を優先する(ペインを消さない)
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** 手順ペインの希望幅を、プレビュー幅とエディタ最低幅を侵さない範囲に丸める */
export function clampGuideWidth(desired: number, rowWidth: number, previewWidth: number): number {
  const max = rowWidth - previewWidth - EDITOR_MIN_WIDTH - HANDLES_TOTAL_WIDTH;
  return clamp(desired, GUIDE_MIN_WIDTH, max);
}

/** プレビューペインの希望幅を、手順幅とエディタ最低幅を侵さない範囲に丸める */
export function clampPreviewWidth(desired: number, rowWidth: number, guideWidth: number): number {
  const max = rowWidth - guideWidth - EDITOR_MIN_WIDTH - HANDLES_TOTAL_WIDTH;
  return clamp(desired, PREVIEW_MIN_WIDTH, max);
}
