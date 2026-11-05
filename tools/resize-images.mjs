#!/usr/bin/env node
/*
 * Даунскейл картинок для веба, in-place
 * ------------------------------------------------
 * 1. Рекурсивно бежим по каталогам (node_modules/.git/dist — мимо, там мусор)
 * 2. Ширина > max-width (по умолчанию 2000)? → ресайз с сохранением пропорций (Lanczos3)
 *    + --keep-size: БЕЗ ресайза — просто дожимаем всё что найдём (JPEG q90, PNG lossless)
 * 3. Пережимаем оптимально для веба: mozjpeg / PNG-smart / webp
 * 4. Страховки: EXIF-поворот печём в пиксели, анимацию не трогаем,
 *    файл НЕ перезаписывается, если новый вариант тяжелее старого.
 *
 * Запуск:  node tools/resize-images.mjs [каталог] [--max-width=2000] [--jpeg-quality=82|90] [--keep-size] [--dry-run] [--skip=a,b]
 * Пример:  npm run resize-images -- --dry-run
 *          npm run resize-images -- --keep-size --dry-run
 *
 * ВАЖНО: перезапись in-place. Сначала закоммитьте изменения, гит — единственный откат.
 * ВАЖНО: JPEG→JPEG без ресайза = поколение потерь. Поэтому в --keep-size дефолт q90, а не q82.
 */
import { readdirSync, statSync, existsSync, writeFileSync, renameSync, unlinkSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/* ---------------- параметры ---------------- */

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : dflt;
};
const DRY_RUN = args.includes("--dry-run");
const KEEP_SIZE = args.includes("--keep-size"); // не трогаем разрешение, только пережимаем

const targetDir = args.find((a) => !a.startsWith("--")) || ROOT;
const MAX_WIDTH = Number(flag("max-width", 2000)) | 0;
/* В ресайз-режиме q82: даунскейл замыливает артефакты старого сжатия, можно смелее.
   В keep-size режиме пиксели те же — поколение потерь JPEG→JPEG никто не отменял,
   поэтому дефолт выше: q90 (глаз не отличает, −36..77% по замерам). */
const JPEG_QUALITY = Math.min(100, Math.max(50, Number(flag("jpeg-quality", KEEP_SIZE ? 90 : 82)) | 0));
const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", // стандратный мусор
  ...flag("skip", "").split(",").map((s) => s.trim()).filter(Boolean),
]);

/* jpg/jpeg/png/webp/avif/gif — всё, что умеет пережимать sharp.
   Если формат не в списке (svg, ico, tiff) — не трогаем, это чужая территория. */
const EXT_FORMAT = {
  ".jpg": "jpeg", ".jpeg": "jpeg",
  ".png": "png",
  ".webp": "webp",
  ".avif": "avif",
  ".gif": "gif",
};

if (!existsSync(targetDir) || !statSync(targetDir).isDirectory()) {
  console.error(`Каталог не найден или это не каталог: ${targetDir}`);
  process.exit(1);
}

/* ---------------- сбор файлов ---------------- */

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    console.warn(`  ! нет доступа к ${dir}: ${e.message}`);
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(p, out);
    } else if (e.isFile() && EXT_FORMAT[extname(e.name).toLowerCase()]) {
      out.push(p);
    }
  }
}

/* ---------------- кодирование: главный мозг утилиты ---------------- */

/*
 * JPEG: mozjpeg (trellis + progressive) — лучшее сжатие без видимых артефактов.
 * Ресайз-режим → 4:4:4: на свежепрожатом Lanczos мелкий текст бейджей с дефолтным 4:2:0
 * получает цветные каёмки — вот это реально "картинка пострадала".
 * keep-size режим → 4:2:0: исходники камерные, хрома УЖЕ субдискретизирована,
 * апсемплить её в 4:4:4 = +вес без единого бита новой информации. Наёбывать весы не будем.
 * EXIF печётся в пиксели при декоде, метаданные выкидываем — вебу они нахуй не нужны,
 * а весят порой десятки килобайт.
 */
function encodeJpeg(img) {
  return img.jpeg({
    quality: JPEG_QUALITY,
    mozjpeg: true,          // медленнее libjpeg, зато -20..30% веса при том же качестве
    progressive: true,      // грузится «постепенно», UX лучше на медленном интернете
    chromaSubsampling: KEEP_SIZE ? "4:2:0" : "4:4:4",
  }).toBuffer({ resolveWithObject: true });
}

/*
 * PNG — формат без потерь, просто "пережать" его нельзя.
 * Хитрый план: кодируем ДВАЖДЫ — честный lossless и палитрованный (pngquant внутри sharp).
 * Берём меньший буфер. Итог: НИКОГДА не хуже lossless, а фото-подобные PNG худеют на 60-80%.
 * Палитрованный вариант с quality [80,95] почти неотличим глазом — это не агрессивный квантайз.
 */
async function encodePng(img) {
  const [lossless, palette] = await Promise.all([
    img.png({ compressionLevel: 9, effort: 7 }).toBuffer({ resolveWithObject: true }),
    img.png({ palette: true, quality: 80, effort: 7 }).toBuffer({ resolveWithObject: true }),
  ]);
  return palette.data.length < lossless.data.length
    ? { data: palette.data, info: palette.info }
    : { data: lossless.data, info: lossless.info };
}

/*
 * WebP: q85 — сладкая точка «глаз не отличает / вес радует».
 * effort 5: разумный баланс, выше — кодер думает минуты ради пары процентов.
 */
function encodeWebp(img) {
  return img.webp({ quality: 85, effort: 5 }).toBuffer({ resolveWithObject: true });
}

/* AVIF — кодируется охуенно долго. Качество 60 у AVIF ~= 85 у JPEG, это другой кодек. */
function encodeAvif(img) {
  return img.avif({ quality: 60, effort: 4 }).toBuffer({ resolveWithObject: true });
}

const ENCODERS = { jpeg: encodeJpeg, png: encodePng, webp: encodeWebp, avif: encodeAvif };

/* ---------------- обработка одного файла ---------------- */

const human = (n) => (n >= 1048576 ? (n / 1048576).toFixed(2) + " MB" : (n / 1024).toFixed(1) + " KB");

async function processFile(file, stats) {
  const rel = relative(ROOT, file) || file;
  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch (e) {
    stats.errors.push(`${rel}: не читается (${e.message})`);
    return;
  }

  // Анимация (gif, webp-стикеры): pages > 1. Ресайз анимации — отдельная история с бубном,
  // молча угробить её — преступление. Пропускаем с явным предупреждением.
  if ((meta.pages ?? 1) > 1) {
    stats.animated++;
    return;
  }

  const fmt = meta.format;
  if (!fmt || !ENCODERS[fmt]) {
    stats.errors.push(`${rel}: неизвестный формат "${fmt}", пропуск`);
    return;
  }

  // Узкие картинки не трогаем ВООБЩЕ — ни байта не переписываем.
  // Каждый лишний re-encode — поколение потерь, JPEG пережимать "просто так" нельзя.
  // Исключение — keep-size: там пережатие и есть цель, ширину не проверяем.
  if (!KEEP_SIZE && (!meta.width || meta.width <= MAX_WIDTH)) {
    stats.skipped++;
    return;
  }

  const oldSize = statSync(file).size;

  let result;
  try {
    // ВАЖНО: .rotate() НЕ вызываем! Современный sharp сам применяет EXIF-поворот
    // при декодировании (метаданные это подтверждают — width/height уже с учётом ориентации).
    // .rotate() без аргументов довернёт ВТОРОЙ раз — и портретные фотки лягут боком.
    // Проверено на PXL-фото с orientation:8 — без rotate() получается 2000x2656, с ним 2000x1506.
    let img = sharp(file, { failOn: "none" }); // кривые EXIF/маркеры не должны ронять батч
    if (!KEEP_SIZE) {
      img = img.resize({ width: MAX_WIDTH, kernel: "lanczos3", withoutEnlargement: true, fit: "inside" });
    }
    result = await ENCODERS[fmt](img);
  } catch (e) {
    stats.errors.push(`${rel}: ошибка обработки (${e.message})`);
    return;
  }

  // Предохранитель №2: новый файл должен быть ЛЕГЧЕ. Если кодер не выиграл —
  // старый файл уже оптимален, не портим то, что работает.
  if (!result || result.data.length >= oldSize) {
    stats.skipped++;
    console.log(`  = ${rel}: пережатие не дало выгоды (${human(oldSize)}), оставляем как есть`);
    return;
  }

  const saved = oldSize - result.data.length;
  stats.resized++;
  stats.bytesSaved += saved;
  const dims = result.info.width !== meta.width
    ? `${meta.width}x${meta.height} → ${result.info.width}x${result.info.height}, `
    : "";
  console.log(
    `  ${DRY_RUN ? "[dry] " : ""}${rel}: ${dims}${human(oldSize)} → ${human(result.data.length)} (−${(100 * saved / oldSize).toFixed(0)}%)`,
  );

  if (DRY_RUN) return;

  // Атомарная запись: сначала temp в ТОМ ЖЕ каталоге (другой том → rename упадёт),
  // потом rename поверх. Падение посередине не оставит обезглавленный труп.
  const tmp = file + ".resizin.tmp";
  try {
    writeFileSync(tmp, result.data);
    renameSync(tmp, file);
  } catch (e) {
    try { unlinkSync(tmp); } catch { /* temp мог не создаться — забиваем */ }
    stats.errors.push(`${rel}: запись не удалась (${e.message})`);
  }
}

/* ---------------- пул воркеров ---------------- */

/* Sharp сам параллелит внутри, поэтому пул скромный: 4 файла одновременно.
   Жадность до RAM на больших батчах до добра не доводила никогда. */
async function runPool(files, stats, limit = 4) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, files.length) }, async () => {
    while (i < files.length) {
      const file = files[i++];
      await processFile(file, stats);
    }
  });
  await Promise.all(workers);
}

/* ---------------- main ---------------- */

const files = [];
walk(targetDir, files);
files.sort();

const stats = { resized: 0, skipped: 0, animated: 0, bytesSaved: 0, errors: [] };

const mode = KEEP_SIZE ? `Только пережатие, разрешение НЕ трогаем. JPEG q=${JPEG_QUALITY}.` : `Ресайз до ${MAX_WIDTH}px по ширине. JPEG q=${JPEG_QUALITY}.`;
console.log(`Поиск: ${targetDir}`);
console.log(`Найдено картинок: ${files.length}. ${mode}${DRY_RUN ? " DRY RUN (ничего не пишем)." : ""}\n`);

const t0 = Date.now();
await runPool(files, stats);

console.log(`\n────────── итого ──────────`);
console.log(`Ресайзнуто:      ${stats.resized}`);
console.log(`Уже в порядке:   ${stats.skipped}`);
console.log(`Анимация (мимо): ${stats.animated}`);
console.log(`Сэкономлено:     ${human(stats.bytesSaved)}`);
if (stats.errors.length) {
  console.log(`\nОшибки (${stats.errors.length}):`);
  for (const e of stats.errors) console.log(`  ! ${e}`);
}
console.log(`Время: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(stats.errors.length && !DRY_RUN ? 1 : 0);
