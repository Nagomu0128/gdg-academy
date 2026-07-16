import { describe, expect, it } from "vitest";
import {
  clampGuideWidth,
  clampPreviewWidth,
  EDITOR_MIN_WIDTH,
  GUIDE_MIN_WIDTH,
  HANDLES_TOTAL_WIDTH,
  PREVIEW_MIN_WIDTH,
} from "./pane-resize";

// 代表的なデスクトップ幅。row 1400px / プレビュー 500px / 手順 320px
const ROW = 1400;

describe("clampGuideWidth", () => {
  it("余裕がある範囲では希望幅をそのまま返す", () => {
    expect(clampGuideWidth(400, ROW, 500)).toBe(400);
  });

  it("最小幅を下回らない", () => {
    expect(clampGuideWidth(50, ROW, 500)).toBe(GUIDE_MIN_WIDTH);
  });

  it("エディタの最低幅を侵さない(上限でクランプ)", () => {
    const max = ROW - 500 - EDITOR_MIN_WIDTH - HANDLES_TOTAL_WIDTH;
    expect(clampGuideWidth(10_000, ROW, 500)).toBe(max);
  });

  it("画面が狭く上限 < 最小幅でも最小幅を返す(ペインを消さない)", () => {
    expect(clampGuideWidth(300, 600, 500)).toBe(GUIDE_MIN_WIDTH);
  });
});

describe("clampPreviewWidth", () => {
  it("余裕がある範囲では希望幅をそのまま返す", () => {
    expect(clampPreviewWidth(600, ROW, 320)).toBe(600);
  });

  it("最小幅を下回らない", () => {
    expect(clampPreviewWidth(0, ROW, 320)).toBe(PREVIEW_MIN_WIDTH);
  });

  it("エディタの最低幅を侵さない(上限でクランプ)", () => {
    const max = ROW - 320 - EDITOR_MIN_WIDTH - HANDLES_TOTAL_WIDTH;
    expect(clampPreviewWidth(10_000, ROW, 320)).toBe(max);
  });

  it("画面が狭く上限 < 最小幅でも最小幅を返す(ペインを消さない)", () => {
    expect(clampPreviewWidth(500, 600, 320)).toBe(PREVIEW_MIN_WIDTH);
  });
});
