/*
 * Сборка: badges/ + addons/ + src/ → dist/ + manifest.json
 * -------------------------------------------------------
 * 1. Валидация meta.json (плохие данные = красный CI, а не молча сломанный сайт)
 * 2. manifest.json — все айтемы + размеры фото (парсим заголовки, без зависимостей)
 * 3. dist/ — статика для GitHub Pages
 *
 * Запуск из V2/:  node tools/build.mjs
 */
import {
  readFileSync, writeFileSync, readdirSync, existsSync, rmSync, mkdirSync, cpSync,
} from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

const config = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));

const errors = [];
const warnings = [];

/* ---------------- размеры картинок по заголовкам ---------------- */

function sniffFormat(b) {
  const is = (s, at = 0) => b.subarray(at, at + s.length).toString("latin1") === s;
  if (is("RIFF") && is("WEBP", 8)) return "webp";
  if (b[0] === 0x89 && b[1] === 0x50) return "png";
  if (b[0] === 0xff && b[1] === 0xd8) return "jpeg";
  if (is("GIF8")) return "gif";
  if (is("ftyp", 4) && /avif|avis/.test(b.subarray(8, 12).toString("latin1"))) return "avif";
  return null;
}

const EXT_FORMAT = { ".jpg": "jpeg", ".jpeg": "jpeg", ".png": "png", ".webp": "webp", ".avif": "avif", ".gif": "gif" };

function imageSize(buf, ext) {
  try {
    /* формат определяем по магическим байтам — расширению веры нет */
    switch (sniffFormat(buf)) {
      case "webp": return webpSize(buf);
      case "png": return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
      case "jpeg": return jpegSize(buf);
      case "gif": return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
      case "avif": return avifSize(buf);
    }
    throw new Error("неизвестный формат (магия: " + buf.subarray(0, 4).toString("hex") + ", расширение: " + ext + ")");
  } catch { /* битый заголовок — не повод ронять сборку */ }
  return { w: null, h: null };
}

function jpegSize(buf) {
  let i = 2; // после FF D8
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    // SOF0..SOF15, кроме DHT (C4), JPG (C8), DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    i += 2 + len;
  }
  throw new Error("SOF not found");
}

function webpSize(buf) {
  const fourcc = buf.toString("ascii", 12, 16);
  if (fourcc === "VP8X") {
    const w = 1 + (buf[24] | buf[25] << 8 | buf[26] << 16);
    const h = 1 + (buf[27] | buf[28] << 8 | buf[29] << 16);
    return { w, h };
  }
  if (fourcc === "VP8 ") {
    const w = buf.readUInt16LE(26) & 0x3fff;
    const h = buf.readUInt16LE(28) & 0x3fff;
    return { w, h };
  }
  if (fourcc === "VP8L") {
    const b = buf.readUInt32LE(21);
    const w = (b & 0x3fff) + 1;
    const h = ((b >> 14) & 0x3fff) + 1;
    return { w, h };
  }
  throw new Error("unknown webp chunk " + fourcc);
}

function avifSize(buf) {
  // идём по боксам до ispe (внутри meta/iprp/ipco)
  const view = (start, end, depth = 0) => {
    let i = start;
    while (i + 8 <= end && depth < 8) {
      const size = buf.readUInt32BE(i);
      const type = buf.toString("ascii", i + 4, i + 8);
      const boxEnd = size === 0 ? end : i + size;
      if (size < 8 || boxEnd > end) return;
      if (type === "ispe" && boxEnd >= i + 16) {
        return { w: buf.readUInt32BE(i + 12), h: buf.readUInt32BE(i + 16) };
      }
      if (["meta", "iprp", "ipco"].includes(type)) {
        const inner = view(i + (type === "meta" ? 12 : 8), boxEnd, depth + 1);
        if (inner) return inner;
      }
      i = boxEnd;
    }
  };
  const r = view(0, buf.length);
  if (!r) throw new Error("ispe not found");
  return r;
}

/* ---------------- чтение айтемов ---------------- */

function itemDirs(kind) {
  const base = join(ROOT, kind);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

function readItem(kind, slug) {
  const dir = join(ROOT, kind, slug);
  const metaPath = join(dir, "meta.json");
  if (!existsSync(metaPath)) {
    errors.push(`${kind}/${slug}: нет meta.json`);
    return null;
  }
  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, "utf8"));
  } catch (e) {
    errors.push(`${kind}/${slug}: meta.json не парсится — ${e.message}`);
    return null;
  }

  // фотографии = все картинки папки, сортировка по имени (01, 02, ...), cover может переопределить обложку
  const photos = readdirSync(dir)
    .filter((f) => IMG_EXTS.has(extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const cover = typeof meta.cover === "string" ? meta.cover : null;
  const ordered = cover && photos.includes(cover)
    ? [cover, ...photos.filter((f) => f !== cover)]
    : photos;

  const resolved = ordered.map((file) => {
    const buf = readFileSync(join(dir, file));
    const ext = extname(file).toLowerCase();
    const fmt = sniffFormat(buf);
    if (fmt && EXT_FORMAT[ext] && fmt !== EXT_FORMAT[ext]) {
      warnings.push(`${kind}/${slug}: ${file} — это ${fmt.toUpperCase()} с расширением ${ext}, переименуй`);
    }
    const { w, h } = imageSize(buf, ext);
    return { src: `${kind}/${slug}/${file}`, w, h };
  });

  // model3d: путь внутри папки айтема
  let model3d = null;
  if (meta.model3d) {
    const p = join(dir, meta.model3d);
    if (existsSync(p)) model3d = `${kind}/${slug}/${meta.model3d}`;
    else errors.push(`${kind}/${slug}: model3d "${meta.model3d}" не найден`);
  }

  return { slug, kind, photos: resolved, model3d, ...meta };
}

/* ---------------- валидация ---------------- */

const ALLOWED = {
  badge: ["name", "event", "year", "location", "description", "source", "schematic", "model3d", "cover", "order", "todo"],
  addon: ["name", "event", "year", "manufacturer", "category", "rarity", "rarityNote",
    "obtainedFor", "description", "source", "schematic", "tags", "model3d", "cover", "order", "todo"],
};

function validate(item, kind) {
  const id = `${kind}/${item.slug}`;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(item.slug)) errors.push(`${id}: слаг из строчных латиницы/цифр/дефисов`);
  if (typeof item.name !== "string" || !item.name.trim()) errors.push(`${id}: пустое name`);
  if (!config.events[item.event]) errors.push(`${id}: event "${item.event}" отсутствует в site.config.json`);
  if (!Number.isInteger(item.year) || item.year < 2000 || item.year > 2100) errors.push(`${id}: year должен быть числом 2000–2100`);
  // «Исходники проекта» (schematic) — строго ссылка с протоколом. Без http(s):// браузер
  // считает href относительным и молча уводит на 404 внутри сайта. Ловим красным CI.
  if (item.schematic !== undefined && (typeof item.schematic !== "string" || !/^https?:\/\//.test(item.schematic.trim()))) {
    errors.push(`${id}: schematic должен быть URL вида https://… (или отсутствовать)`);
  }
  if (kind === "addon") {
    if (item.category && !config.categories[item.category]) errors.push(`${id}: category "${item.category}" нет в конфиге`);
    if (item.rarity && !config.rarities[item.rarity]) errors.push(`${id}: rarity "${item.rarity}" нет в конфиге`);
    if (item.tags && !Array.isArray(item.tags)) errors.push(`${id}: tags должен быть массивом`);
  }
  if (kind === "badge" && !item.photos.length) errors.push(`${id}: у бейджа должна быть хотя бы одна фотка`);
  if (kind === "addon" && !item.photos.length) warnings.push(`${id}: нет фоток — будет плейсхолдер`);
  for (const key of Object.keys(item)) {
    if (!ALLOWED[kind].includes(key) && !["slug", "kind", "photos", "model3d"].includes(key)) {
      warnings.push(`${id}: неизвестное поле "${key}" — опечатка?`);
    }
  }
  for (const p of item.photos) {
    if (p.w == null) warnings.push(`${id}: не удалось прочитать размер ${p.src}`);
  }
}

/* ---------------- сборка ---------------- */

const badges = itemDirs("badges").map((s) => readItem("badges", s)).filter(Boolean);
const addons = itemDirs("addons").map((s) => readItem("addons", s)).filter(Boolean);

badges.forEach((b) => validate(b, "badge"));
addons.forEach((a) => validate(a, "addon"));

// уникальность слагов и пар (event, year) у бейджей
const seenSlug = new Set();
for (const it of [...badges, ...addons]) {
  const key = it.kind + "/" + it.slug;
  if (seenSlug.has(key)) errors.push(`дубль слага: ${key}`);
  seenSlug.add(key);
}
const seenPair = new Set();
for (const b of badges) {
  const pair = `${b.event}:${b.year}`;
  if (seenPair.has(pair)) errors.push(`два бейджа на ${pair}`);
  seenPair.add(pair);
}
// кросс-ссылка аддон → бейдж (мягкая проверка)
for (const a of addons) {
  if (!seenPair.has(`${a.event}:${a.year}`)) {
    warnings.push(`addons/${a.slug}: бейджа ${a.event} ${a.year} нет в архиве — кросс-ссылки не будет`);
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  stats: {
    badges: badges.length,
    addons: addons.length,
    events: Object.keys(config.events).length,
    years: [...new Set([...badges.map((b) => b.year), ...addons.map((a) => a.year)])].sort(),
  },
  badges,
  addons,
};

if (errors.length) {
  console.error("\nОШИБКИ ВАЛИДАЦИИ:");
  for (const e of errors) console.error("  ! " + e);
  process.exit(1);
}

/* dist/: чистая пересборка */
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, "src"), DIST, { recursive: true });
cpSync(join(ROOT, "site.config.json"), join(DIST, "site.config.json"));
cpSync(join(ROOT, "badges"), join(DIST, "badges"), { recursive: true });
cpSync(join(ROOT, "addons"), join(DIST, "addons"), { recursive: true });
writeFileSync(join(DIST, "manifest.json"), JSON.stringify(manifest));

console.log(`dist/ собран: ${badges.length} бейджей, ${addons.length} аддонов`);
if (warnings.length) {
  console.log("\nПредупреждения:");
  for (const w of warnings) console.log("  ~ " + w);
}
