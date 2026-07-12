// 一時プローブ(コミットしない): /dev/validate を開いて失敗一覧を取得する
import { chromium } from "@playwright/test";

const base = process.env.PROBE_BASE ?? "http://localhost:5273";
const variant = process.env.PROBE_VARIANT ?? "";
const url = `${base}/dev/validate${variant ? `?variant=${variant}` : ""}`;

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(660_000);
console.log(`[probe] open ${url}`);
const started = Date.now();
await page.goto(url, { waitUntil: "domcontentloaded" });

const summary = page.getByTestId("validate-summary");
// 進捗を 20 秒おきに出力しながら summary を待つ
const progressTimer = setInterval(async () => {
  try {
    const text = await page.locator("main > div").first().textContent({ timeout: 2000 });
    console.log(`[probe] ${((Date.now() - started) / 1000).toFixed(0)}s: ${text?.trim()}`);
  } catch {
    /* ignore */
  }
}, 20_000);

try {
  await summary.waitFor({ state: "visible", timeout: 660_000 });
} finally {
  clearInterval(progressTimer);
}
const text = await summary.textContent();
console.log(`[probe] summary: ${text} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
const failures = page.getByTestId("validate-failures");
if (await failures.count()) {
  const items = await failures.locator("li").allTextContents();
  for (const item of items) console.log(`[probe] FAIL: ${item}`);
}
await browser.close();
