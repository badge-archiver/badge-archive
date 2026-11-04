/*
 * Растеризация favicon.svg → PNG (Chromium через Playwright, без новых зависимостей).
 * Светлая тема — чёрный штрих, тёмная — белый: в SVG это делает media query,
 * в PNG делаем парные файлы, <link media="..."> в html выберет нужную.
 * Запуск: node tools/make-favicon.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const SVG = fileURLToPath(new URL("../src/assets/img/favicon.svg", import.meta.url));
const OUT = fileURLToPath(new URL("../src/assets/img/", import.meta.url));
const svgSource = readFileSync(SVG, "utf8");

const browser = await chromium.launch();

async function render(size, file, { stroke = null, background = "transparent" } = {}) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    colorScheme: stroke === "#fff" ? "dark" : "light",
  });
  let svg = svgSource.replace("<svg ", `<svg width="${size}" height="${size}" `);
  if (stroke) {
    /* жёстко фиксируем цвет штриха поверх media query из svg */
    svg = svg.replace("</svg>", `<style>path{stroke:${stroke}!important}</style></svg>`);
  }
  if (background !== "transparent") {
    /* фон вшиваем прямо в svg: скриншотный фон body — гонка, сюда надёжнее */
    svg = svg.replace(/<style>/, `<rect width="100%" height="100%" fill="${background}"/><style>`);
  }
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.screenshot({
    path: join(OUT, file),
    omitBackground: background === "transparent",
    clip: { x: 0, y: 0, width: size, height: size },
  });
  await page.close();
  console.log(`${file} — ${size}×${size}${stroke ? ` (${stroke})` : ""}`);
}

/* пары для светлой и тёмной темы, прозрачный фон */
await render(16, "favicon-16.png", { stroke: "#000" });
await render(32, "favicon-32.png", { stroke: "#000" });
await render(16, "favicon-dark-16.png", { stroke: "#fff" });
await render(32, "favicon-dark-32.png", { stroke: "#fff" });

/* apple-touch-icon: белый штрих на чёрном (iOS прозрачность не уважает) */
await render(180, "apple-touch-icon.png", { stroke: "#fff", background: "#000000" });

await browser.close();
console.log("готово");
