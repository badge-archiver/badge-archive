/* Тач-тест: тап по карточке → модалка → закрыть → рамка не залипает.
   Эмулируем телефон: hasTouch, мобильный вьюпорт, тапаем touchscreen, не мышью. */
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },   /* iPhone-размер */
  hasTouch: true,
  isMobile: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
let failed = 0;
const ok = (name, cond, extra = "") => {
  if (!cond) failed++;
  console.log(`${cond ? "OK  " : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};

await page.goto("http://localhost:4173/addons/", { waitUntil: "networkidle" });
await page.waitForSelector(".card");

/* тап по первой карточке — открывается модалка */
const card = page.locator(".card").first();
await card.tap();
await page.locator("dialog.item-modal[open]").waitFor({ timeout: 5000 });
ok("тап открыл модалку", true);

/* рамка на карточке под модалкой допустима (hover-залипание как раз ловим после закрытия) */
await page.locator(".modal-close").first().tap();
await page.waitForTimeout(400);

const state = await page.evaluate(() => {
  const card = document.querySelector(".card");
  const cs = getComputedStyle(card);
  return {
    borderColor: cs.borderColor,
    boxShadow: cs.boxShadow,
    isFocusVisible: card.matches(":focus-visible"),
    isFocused: document.activeElement === card,
    hash: location.hash,
  };
});
ok("хеш очищен", state.hash === "", `hash="${state.hash}"`);
ok("фокус снят с карточки", !state.isFocused);
ok("focus-visible не висит", !state.isFocusVisible);
ok("box-shadow нет (рамка не залипла)", state.boxShadow === "none", state.boxShadow);

/* повторный цикл: открыть/закрыть тапом по подложке */
await page.locator(".card").nth(2).tap();
await page.locator("dialog.item-modal[open]").waitFor({ timeout: 5000 });
await page.evaluate(() => document.getElementById("item-modal").close());
await page.waitForTimeout(400);
const state2 = await page.evaluate(() => {
  const cards = [...document.querySelectorAll(".card")];
  const lit = cards.filter((c) => getComputedStyle(c).boxShadow !== "none").length;
  const focusedCard = cards.some((c) => c === document.activeElement);
  return { lit, focusedCard };
});
ok("после второго закрытия ни одна карточка не подсвечена", state2.lit === 0, `подсвечено: ${state2.lit}`);
ok("фокус не на карточке", !state2.focusedCard);

await browser.close();
console.log(failed ? `\n${failed} провал(ов)` : "\nтач: всё зелёное");
process.exit(failed ? 1 : 0);
