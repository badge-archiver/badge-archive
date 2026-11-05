/* Прод-условия: GH Pages + троттл 10Mbps/100ms + плавный скролл.
   Метрика боли: СЕКУНДЫ до полной загрузки видимого после остановки скролла. */
import { chromium } from "playwright";

const BASE = "https://badge-archiver.github.io/badge-archive/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const client = await page.context().newCDPSession(page);
await client.send("Network.enable");
await client.send("Network.emulateNetworkConditions", {
  offline: false, latency: 100,
  downloadThroughput: (10 * 1024 * 1024) / 8,
  uploadThroughput: (2 * 1024 * 1024) / 8,
});

const unloadedVis = () => page.evaluate(() => {
  const vpTop = scrollY, vpBot = scrollY + innerHeight;
  let u = 0;
  for (const img of document.querySelectorAll(".card-photo-wrap img")) {
    const r = img.getBoundingClientRect();
    if (r.bottom + scrollY < vpTop || r.top + scrollY > vpBot) continue;
    if (!(img.complete && img.naturalWidth > 0)) u++;
  }
  return u;
});

const loadingCount = () => page.evaluate(() => {
  let loading = 0, high = 0, low = 0;
  for (const img of document.querySelectorAll(".card-photo-wrap img")) {
    if (!img.getAttribute("src")) continue;
    if (img.complete && img.naturalWidth > 0) continue;
    loading++;
    if (img.fetchPriority === "high") high++;
    else low++;
  }
  return { loading, high, low };
});

await page.goto(BASE + "addons/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".card");

/* первый экран: время до полной загрузки */
{
  const t0 = Date.now();
  while (Date.now() - t0 < 30000 && (await unloadedVis()) > 0) await page.waitForTimeout(500);
  console.log(`первый экран: ${((Date.now() - t0) / 1000).toFixed(1)}s до нуля; очередь:`, JSON.stringify(await loadingCount()));
}

/* плавный тачпад-темп: 60 тиков по ~50px каждые 90ms (медленное листание), потом СТОП */
for (const wave of [1, 2, 3]) {
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel(0, 55);
    await page.waitForTimeout(90);
  }
  const t0 = Date.now();
  let secs = 0;
  while (Date.now() - t0 < 30000 && (await unloadedVis()) > 0) {
    await page.waitForTimeout(500);
    secs = (Date.now() - t0) / 1000;
  }
  console.log(`волна ${wave}: остановка на ${Math.round(await page.evaluate(() => scrollY))}px → ${secs.toFixed(1)}s до нуля; очередь:`, JSON.stringify(await loadingCount()));
}

await browser.close();
