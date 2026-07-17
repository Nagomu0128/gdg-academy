import { describe, expect, it } from "vitest";
import { SITE_NAME, SITE_ORIGIN, SITE_TAGLINE } from "./site";

describe("site 定数", () => {
  it("SITE_NAME / SITE_TAGLINE が定義されている", () => {
    expect(SITE_NAME).toBe("GDG dev Academy");
    expect(SITE_TAGLINE.length).toBeGreaterThan(0);
  });

  it("SITE_ORIGIN は https で始まり末尾スラッシュを持たない(og:image 等の URL 結合前提)", () => {
    expect(SITE_ORIGIN).toMatch(/^https:\/\//);
    expect(SITE_ORIGIN.endsWith("/")).toBe(false);
  });
});
