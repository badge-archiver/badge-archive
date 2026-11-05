/* Мобильный смоук модалки: длинная карточка скроллится вертикально.
   hasTouch, 390x844: открыть #oz26-ssti (длинное описание), проверить:
   1) у диалога есть что скроллить (scrollHeight > clientHeight)
   2) свайп/колесо реально меняет scrollTop
   3) низ контента (последняя строка spec-table) достижим
   4) шапка (крестик) прилипает при скролле */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4173";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();
let failed = 0;
const ok = (name, cond, extra = "") => {
  if (!cond) failed++;
  console.log(`${cond ? "OK  " : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};

await page.goto(`${BASE}/addons/#oz26-ssti`, { waitUntil: "networkidle" });
await page.locator("dialog.item-modal[open]").waitFor({ timeout: 5000 });
await page.waitForTimeout(300);

const m = await page.evaluate(() => {
  const d = document.getElementById("item-modal");
  return { sh: d.scrollHeight, ch: d.clientHeight, bodyMaxH: getComputedStyle(document.querySelector(".modal-body")).maxHeight };
});
ok("у диалога есть контент для скролла", m.sh > m.ch, `scrollHeight ${m.sh} > clientHeight ${m.ch}`);
ok("modal-body без ограничения высоты", m.bodyMaxH === "none", m.bodyMaxH);

/* скролл настоящим тач-жестом (мышиный drag в эмуляции — не тач-скролл) */
await page.evaluate(() => document.getElementById("item-modal").scrollTop = 0);
const before = await page.evaluate(() => document.getElementById("item-modal").scrollTop);
const client = await page.context().newCDPSession(page);
await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 650 }] });
for (let y = 650; y >= 250; y -= 50) {
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y }] });
  await page.waitForTimeout(16);
}
await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await page.waitForTimeout(350);
const after = await page.evaluate(() => document.getElementById("item-modal").scrollTop);
ok("свайп прокрутил модалку", after > before, `scrollTop ${before} → ${after}`);

/* до низа: достижима ли последняя строка таблицы */
const reach = await page.evaluate(() => {
  const d = document.getElementById("item-modal");
  d.scrollTop = d.scrollHeight;
  const rows = d.querySelectorAll(".spec-table tr, .related");
  const last = rows[rows.length - 1];
  if (!last) return null;
  const r = last.getBoundingClientRect();
  return { visible: r.bottom <= innerHeight + 1, bottom: Math.round(r.bottom), ih: innerHeight };
});
ok("низ карточки достижим скроллом", !!reach && reach.visible, reach ? `bottom ${reach.bottom} <= viewport ${reach.ih}` : "нет таблицы");

/* шапка прилипла сверху после скролла */
const head = await page.evaluate(() => {
  const h = document.querySelector(".modal-head");
  const r = h.getBoundingClientRect();
  return { top: Math.round(r.top), visible: r.top >= 0 && r.top < 60, hasClose: !!h.querySelector(".modal-close") };
});
ok("шапка с крестиком прилипает", head.visible && head.hasClose, `top=${head.top}`);

await browser.close();
console.log(failed ? `\n${failed} провал(ов)` : "\nмобильная модалка: всё зелёное");
process.exit(failed ? 1 : 0);
