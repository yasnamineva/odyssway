import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome" });
for (const [name, path, w] of [["home-mobile", "/", 390], ["home-desktop", "/", 900], ["rule", "/rules/90-180-rule", 390], ["etias-us", "/etias/us", 390]]) {
  const page = await browser.newPage({ viewport: { width: w, height: 1100 } });
  await page.goto(`http://localhost:4321${path}`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/private/tmp/claude-501/-Users-mineva-Documents-side-travellercalc/b22314a5-f1dc-4673-bbf1-47ac1235d626/scratchpad/${name}.png`, fullPage: false });
  await page.close();
}
await browser.close();
console.log("done");
