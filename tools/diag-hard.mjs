/* Жёсткий сценарий: резкий старт + быстрый темп 2500px/s на 10 Mbps.
   Метрики: пустые клетки ВО ВРЕМЯ движения (замер на лету), после конца,
   после возврата. Сравнение локал (новый) vs прод (старый). */
import { chromium } from "playwright";

const mbps = Number(process.argv[2] ?? 10);
const THROTTLE = { offline: false, latency: 120, downloadThroughput: (mbps * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };

async function run(base, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1314, height: 983 } });
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", THROTTLE);

  const emptyVisible = () => page.evaluate(() => {
    const vpT = scrollY, vpB = scrollY + innerHeight;
    let t = 0, u = 0;
    for (const img of document.querySelectorAll(".card-photo-wrap img")) {
      const r = img.getBoundingClientRect();
      if (r.bottom + scrollY < vpT || r.top + scrollY > vpB) continue;
      t++; if (!(img.complete && img.naturalWidth > 0)) u++;
    }
    return `${u}/${t}`;
  });

  await page.goto(base + "/addons/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".card");
  await page.waitForTimeout(1000); /* чуть-чуть на первый экран и ПОЛНЫЙ ход */

  /* резкий темп: 500px каждые 200ms = 2500px/s, замер пустых НА ЛЕТУ каждые 5 шагов */
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let worst = "";
  for (let y = 0, i = 0; y < H; y += 500, i++) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(200);
    if (i % 5 === 4) { const e = await emptyVisible(); if (e.split("/")[0] !== "0" && !worst) worst = `y=${y}: ${e}`; }
  }
  const end = await emptyVisible();
  await page.waitForTimeout(2500);
  const endWait = await emptyVisible();

  /* возврат так же быстро */
  for (let y = H; y > 0; y -= 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(200);
  }
  const back = await emptyVisible();
  await page.waitForTimeout(3000);
  const backWait = await emptyVisible();

  console.log(`[${label}] полёт: первая пустая на лету ${worst ?? "нет"} | конец: ${end} → +2.5s ${endWait} | возврат: ${back} → +3s ${backWait}`);
  await browser.close();
}

await run("http://localhost:4173", "ЛОКАЛ (новый)");
await run("https://badge-archiver.github.io/badge-archive", "ПРОД (старый)");
