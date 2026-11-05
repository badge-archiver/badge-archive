/* e2e редактора: грузится, дерево есть, карточка открывается, правка сохраняется на диск */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = "http://localhost:4174";
let failed = 0;
const ok = (name, cond, extra = "") => {
  if (!cond) failed++;
  console.log(`${cond ? "OK  " : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (e) => { failed++; console.log("FAIL js-ошибка:", e.message); });
await page.goto(BASE + "/", { waitUntil: "networkidle" });

/* дерево отрисовано с обеими ветками */
ok("дерево: есть БЕЙДЖИ", (await page.locator(".group-label", { hasText: "БЕЙДЖИ" }).count()) === 1);
ok("дерево: есть АДДОНЫ", (await page.locator(".group-label", { hasText: "АДДОНЫ" }).count()) === 1);
const leafCount = await page.locator(".leaf").count();
ok("дерево: айтемы в списке", leafCount > 100, `${leafCount} листьев`);

/* фильтр дерева */
await page.fill("#tree-filter", "капибара");
const filtered = await page.locator(".leaf").count();
ok("фильтр дерева сужает", filtered >= 1 && filtered < leafCount, `${filtered} по «капибара»`);

/* открыть аддона, отредактировать, сохранить (фильтр активен — ветка раскрыта) */
const before = JSON.parse(readFileSync("addons/oz24-tbank/meta.json", "utf8"));
await page.locator(".leaf", { hasText: "Капибара" }).first().click();
await page.waitForSelector("#f-name");
ok("форма открылась", (await page.locator(".form-head .kind").textContent()) === "АДДОН");
ok("фото-превью есть", (await page.locator(".photos img").count()) >= 1);
ok("селект редкости заполнен", (await page.locator("#f-rarity option").count()) >= 6);
ok("подсказки изготовителя есть", (await page.locator("#mfr-list option").count()) >= 5);
ok("поле «Исходники проекта» есть", (await page.locator("#f-schematic").count()) === 1);

/* панель подсказок формулировок */
await page.click("#f-obtainedFor");
const suggestCount = await page.locator(".suggest-item").count();
ok("панель подсказок ожила при фокусе", suggestCount > 3, `${suggestCount} формулировок`);
await page.locator(".suggest-item").first().dispatchEvent("mousedown");
const inserted = await page.inputValue("#f-obtainedFor");
ok("клик по подсказке вставил фразу", inserted.length > 3, inserted.slice(0, 50));
ok("после вставки — пометка «не сохранено»", (await page.locator(".form-head .dirty").count()) === 1);

/* состояние дерева переживает перерисовки (вход в карточку, фильтр) */
await page.click(".tree summary"); /* свернём одну ветку */
await page.fill("#tree-filter", "капибара");
await page.fill("#tree-filter", ""); /* дважды перерисовали дерево фильтром */
const closedAfter = await page.evaluate(() => document.querySelectorAll(".tree details:not([open])").length);
ok("свёрнутая ветка не раскрылась после фильтров", closedAfter >= 1, `свёрнуто веток: ${closedAfter}`);

await page.fill("#f-obtainedFor", "e2e: продано за 300 оффкоинов");
await page.fill("#f-tags", "капибара, тест");
await page.fill("#f-schematic", "https://example.com/gerber.zip");
const dirtyShown = await page.locator(".form-head .dirty").count();
ok("пометка «не сохранено»", dirtyShown === 1);

await page.locator("#btn-save").click();
await page.waitForTimeout(600); // сохранение + перечитка данных

const after = JSON.parse(readFileSync("addons/oz24-tbank/meta.json", "utf8"));
ok("meta.json на диске обновлён", after.obtainedFor === "e2e: продано за 300 оффкоинов");
ok("tags распарсились в массив", JSON.stringify(after.tags) === JSON.stringify(["капибара", "тест"]));
ok("schematic доехал до диска", after.schematic === "https://example.com/gerber.zip");
ok("saved-пометка вернулась", (await page.locator(".form-head .saved").count()) === 1);

/* вернуть как было */
await page.fill("#f-obtainedFor", before.obtainedFor);
await page.fill("#f-tags", "");
await page.fill("#f-schematic", "");
await page.locator("#btn-save").click();
await page.waitForTimeout(600);
const restored = JSON.parse(readFileSync("addons/oz24-tbank/meta.json", "utf8"));
ok("откат контрольной правки", restored.obtainedFor === before.obtainedFor && !(restored.tags ?? []).length);
ok("schematic удалён при откате", restored.schematic === undefined);

/* бейдж открывается (фильтр сброшен, ветки свёрнуты — раскрываем) */
await page.fill("#tree-filter", "");
await page.locator("summary", { hasText: "OFFZONE" }).click();
await page.locator(".leaf", { hasText: "Бейдж OFFZONE 2018" }).first().click();
await page.waitForSelector("#f-location");
ok("форма бейджа (location есть)", (await page.locator("#f-location").count()) === 1);
ok("у бейджа тоже есть «Исходники проекта»", (await page.locator("#f-schematic").count()) === 1);

/* проверка сборкой из UI */
await page.click("#btn-validate");
await page.waitForSelector("#validate-out.ok", { timeout: 30000 });
ok("кнопка «проверить сборкой» — зелёный результат", true);

await browser.close();
console.log(failed ? `\n${failed} провал(ов)` : "\nредактор: всё зелёное");
process.exit(failed ? 1 : 0);
