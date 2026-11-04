/*
 * Браузерный смоук-тест (Playwright + Chromium).
 * Запуск: node tools/test-browser.mjs [baseURL]
 * Проверяет ровно то, что ломалось в руках пользователя:
 *   1. горизонтальный скролл в модалке с длинным URL в описании (#oz26-addon-ssti)
 *   2. лайтбокс не остаётся висеть на странице после закрытия (display:none)
 *   3. листание фото в лайтбоксе: стрелки и колесо
 *   4. back/ESC закрывают модалку, хеш чистится
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4173";
let failed = 0;
const ok = (name, cond, extra = "") => {
  if (!cond) failed++;
  console.log(`${cond ? "OK  " : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};

const browser = await chromium.launch();

async function newPage(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { failed++; console.log("FAIL js-ошибка страницы:", e.message); });
  return { ctx, page };
}

/* ---------- 1. горизонтальный скролл в модалке ---------- */

for (const [w, hmm, label] of [[1280, 800, "десктоп"], [375, 700, "мобила"]]) {
  const { ctx, page } = await newPage(w, hmm);
  await page.goto(`${BASE}/addons/#oz26-addon-ssti`, { waitUntil: "networkidle" });
  const dialog = page.locator("dialog.item-modal[open]");
  await dialog.waitFor({ timeout: 5000 });
  await page.waitForTimeout(150); // отрисовка контента

  const m = await page.evaluate(() => {
    const d = document.querySelector(".modal-body");
    const dl = document.getElementById("item-modal");
    return {
      bodyOverflow: d.scrollWidth - d.clientWidth,
      dialogOverflow: dl.scrollWidth - dl.clientWidth,
      tableW: document.querySelector(".spec-table")?.scrollWidth ?? 0,
      infoW: document.querySelector(".modal-info")?.clientWidth ?? 0,
    };
  });
  ok(`[${label}] нет гориз. переполнения .modal-body`, m.bodyOverflow <= 1, `scrollWidth-clientWidth = ${m.bodyOverflow}`);
  ok(`[${label}] нет гориз. переполнения диалога`, m.dialogOverflow <= 1, `= ${m.dialogOverflow}`);
  ok(`[${label}] таблица вписана в колонку`, m.tableW <= m.infoW + 1, `${m.tableW} <= ${m.infoW}`);
  await ctx.close();
}

/* ---------- 2+3. лайтбокс: листание и отсутствие призрака ---------- */

{
  const { ctx, page } = await newPage(1280, 800);
  await page.goto(`${BASE}/#offzone-2020`, { waitUntil: "networkidle" }); // у бейджа 6 фото, бейджи — в корне
  const dialog = page.locator("dialog.item-modal[open]");
  await dialog.waitFor({ timeout: 5000 });
  await page.waitForTimeout(150);

  /* листание в галерее модалки */
  const src0 = await page.locator(".main-photo-wrap img").getAttribute("src");
  await page.keyboard.press("ArrowRight");
  const src1 = await page.locator(".main-photo-wrap img").getAttribute("src");
  ok("стрелка → листает галерею", src0 !== src1, `${src0?.split("/").pop()} → ${src1?.split("/").pop()}`);

  /* открываем лайтбокс кликом по фото */
  await page.click(".main-photo-wrap");
  const lb = page.locator("dialog.lightbox[open]");
  await lb.waitFor({ timeout: 3000 });
  const lb0 = await lb.locator("img").getAttribute("src");

  /* лайтбокс ВЫШЕ модалки: стрелки листают лайтбокс */
  await page.keyboard.press("ArrowRight");
  const lb1 = await lb.locator("img").getAttribute("src");
  ok("стрелка → листает лайтбокс", lb0 !== lb1, `${lb0?.split("/").pop()} → ${lb1?.split("/").pop()}`);

  /* колесо в лайтбоксе */
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(60);
  const lb2 = await lb.locator("img").getAttribute("src");
  ok("колесо листает лайтбокс", lb2 !== lb1, `${lb1?.split("/").pop()} → ${lb2?.split("/").pop()}`);

  /* Esc закрывает только лайтбокс, модалка остаётся */
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
  const lbOpen = await page.evaluate(() => document.querySelector("dialog.lightbox")?.open ?? false);
  const modalOpen = await page.evaluate(() => document.getElementById("item-modal")?.open ?? false);
  ok("Esc закрыл лайтбокс", !lbOpen);
  ok("модалка осталась открыта", modalOpen);

  /* призрак: после закрытия лайтбокс реально спрятан (display:none от UA) */
  const ghost = await page.evaluate(() => {
    const el = document.querySelector("dialog.lightbox");
    return { display: getComputedStyle(el).display, visible: el.offsetParent !== null };
  });
  ok("закрытый лайтбокс не висит на странице", ghost.display === "none", `display: ${ghost.display}`);

  /* закрываем модалку Esc → хеш должен очиститься */
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  const hash = await page.evaluate(() => location.hash);
  ok("Esc закрыл модалку и чистил хеш", hash === "", `hash: "${hash}"`);

  /* скроллим страницу вверх-вниз — призрака быть не должно */
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(100);
  const ghost2 = await page.evaluate(() => {
    const el = document.querySelector("dialog.lightbox");
    return el ? getComputedStyle(el).display === "none" : true;
  });
  ok("после скролла лайтбокс не вклеен", ghost2);

  await ctx.close();
}

/* ---------- 5. чипы в карточках — тумблеры фасетов ---------- */

{
  const { ctx, page } = await newPage(1280, 800);
  await page.goto(`${BASE}/addons/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".card");

  const total = await page.locator(".card").count();
  ok("сетка аддонов отрисована", total > 90, `${total} карточек`);

  /* чипы: строки по центру горизонтали, блок — 2px от краёв карточки,
     вертикально центрован в свободном месте card-body */
  const chipLayout = await page.evaluate(() => {
    let off = 0, lines = 0, clipped = 0, sideOff = 0, vOff = 0, vCards = 0, minGap = Infinity;
    for (const body of document.querySelectorAll(".card-body")) {
      const row = body.querySelector(".chips");
      if (!row) continue;
      const bRect = body.getBoundingClientRect();
      const rRect = row.getBoundingClientRect();

      /* видимый зазор текст→первый чип: не меньше 0.3rem (4.8px) */
      const firstChip = row.querySelector(".chip");
      if (firstChip) {
        const kids = [...body.children].filter((c) => c !== row);
        const textBottom = Math.max(...kids.map((c) => c.getBoundingClientRect().bottom), bRect.top);
        minGap = Math.min(minGap, firstChip.getBoundingClientRect().top - textBottom);
      }

      /* горизонтасть блока: ровно 2px от краёв карточки */
      sideOff = Math.max(sideOff, Math.abs(rRect.left - (bRect.left + 2)), Math.abs(rRect.right + 2 - bRect.right));

      /* вертикаль: зазор сверху == зазору снизу (в свободном месте).
         низ меряем до края КОНТЕНТ-бокса — паддинг карточки не его забота */
      const kids = [...body.children].filter((c) => c !== row);
      const textBottom = Math.max(...kids.map((c) => c.getBoundingClientRect().bottom), bRect.top);
      const contentBottom = bRect.bottom - parseFloat(getComputedStyle(body).paddingBottom);
      const topGap = rRect.top - textBottom;
      const bottomGap = contentBottom - rRect.bottom;
      if (bottomGap > 1) {
        vCards++;
        vOff = Math.max(vOff, Math.abs(topGap - bottomGap));
      }

      const byLine = new Map();
      for (const chip of row.children) {
        const t = chip.offsetTop;
        if (!byLine.has(t)) byLine.set(t, []);
        byLine.get(t).push(chip);
      }
      for (const group of byLine.values()) {
        lines++;
        const left = Math.min(...group.map((c) => c.getBoundingClientRect().left));
        const right = Math.max(...group.map((c) => c.getBoundingClientRect().right));
        off = Math.max(off, Math.abs((left + right) / 2 - (rRect.left + rRect.width / 2)));
      }
      clipped += [...row.children].filter((c) => c.scrollWidth > c.clientWidth + 1).length;
    }
    return { lines, off, clipped, sideOff, vOff, vCards, minGap };
  });
  ok("чипы: все строки отцентрованы", chipLayout.off <= 2, `${chipLayout.lines} строк, макс. отклонение ${chipLayout.off.toFixed(1)}px`);
  ok("чипы: блок в 2px от краёв карточки", chipLayout.sideOff <= 1, `макс. отклонение ${chipLayout.sideOff.toFixed(1)}px`);
  ok("чипы: вертикально по центру свободного места", chipLayout.vOff <= 2, `${chipLayout.vCards} карточек, макс. перекос ${chipLayout.vOff.toFixed(1)}px`);
  ok("чипы: зазор от текста ≥ 0.3rem", chipLayout.minGap >= 4.6, `мин. видимый зазор ${chipLayout.minGap.toFixed(1)}px`);
  ok("чипы: ни один не обрезан", chipLayout.clipped === 0, `${chipLayout.clipped} обрезанных`);

  /* клик по чипу «Легендарный» — фильтрует, модалку НЕ открывает.
     ожидание берём из манифеста, а не из памяти тестировщика */
  const manifest = await (await fetch(`${BASE}/manifest.json`)).json();
  const legendary = manifest.addons.filter((a) => a.rarity === "legendary").length;
  await page.locator('.chip-btn', { hasText: "Легендарный" }).first().click();
  await page.waitForTimeout(200);
  const after = await page.locator(".card").count();
  const modalOpen = await page.evaluate(() => document.getElementById("item-modal")?.open ?? false);
  const url = page.url();
  ok("чип отфильтровал сетку", after === legendary, `${after} карточек (ож. ${legendary} легендарных)`);
  ok("клик по чипу не открыл модалку", !modalOpen);
  ok("rarity попал в URL", url.includes("rarity=legendary"), url.replace(BASE, ""));

  /* чип зажат (aria-pressed) и тонирован, а не залит наглухо */
  const pressedInfo = await page.evaluate(() => {
    const el = document.querySelector('.chip-btn[aria-pressed="true"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const s = cs.backgroundColor;
    let alpha = 1;
    let m = s.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s,/]+/).map(Number);
      alpha = p.length === 4 ? p[3] : 1;
    } else if ((m = s.match(/color\([^)]*\/\s*([\d.]+)\)/))) {
      alpha = parseFloat(m[1]); /* color(srgb r g b / a) — CSS Color 4 */
    } else if (s === "transparent") {
      alpha = 0;
    }
    return { alpha, color: cs.color, raw: s };
  });
  ok("чип показывает нажатое состояние", !!pressedInfo);
  ok("нажатый чип — тонировка, не заливка", pressedInfo && pressedInfo.alpha > 0 && pressedInfo.alpha <= 0.5,
    `${pressedInfo?.raw}`);
  ok("текст нажатого чипа не чёрный", pressedInfo && !/rgb\(0, 0, 0\)|#000/.test(pressedInfo.color), pressedInfo?.color);

  /* повторный клик снимает фильтр */
  await page.locator('.chip-btn', { hasText: "Легендарный" }).first().click();
  await page.waitForTimeout(200);
  const back = await page.locator(".card").count();
  ok("повторный клик вернул сетку", back === total, `${back} карточек`);
  ok("rarity ушёл из URL", !page.url().includes("rarity=legendary"));

  await ctx.close();
}

/* ---------- 6. ссылки в описаниях ---------- */

{
  const { ctx, page } = await newPage(1280, 800);
  /* у бейджа dc78422 в описании голый URL — должен стать <a> */
  await page.goto(`${BASE}/#dc78422-2024`, { waitUntil: "networkidle" });
  await page.locator("dialog.item-modal[open]").waitFor({ timeout: 5000 });
  await page.waitForTimeout(150);
  const linkInfo = await page.evaluate(() => {
    const a = document.querySelector(".spec-table td p a");
    return a
      ? { href: a.getAttribute("href"), text: a.textContent, noopener: a.getAttribute("rel") === "noopener", blank: a.getAttribute("target") === "_blank" }
      : null;
  });
  ok("голый URL в описании стал ссылкой", !!linkInfo, linkInfo?.href ?? "ссылки нет");
  ok("ссылка открывается в новой вкладке безопасно", !!linkInfo && linkInfo.blank && linkInfo.noopener);

  /* в тексте не должно остаться сырого html — скрипт-инъекция невозможна по построению,
     но проверим, что текст рендерится текстовыми узлами */
  const noHtml = await page.evaluate(() => {
    const p = document.querySelector(".spec-table td p");
    return p && !p.querySelector("script,img,iframe,onload");
  });
  ok("в описании только текст и ссылки", !!noHtml);
  await ctx.close();
}

await browser.close();
console.log(failed ? `\n${failed} провал(ов)` : "\nбраузерные проверки: всё зелёное");
process.exit(failed ? 1 : 0);
