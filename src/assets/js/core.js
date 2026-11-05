/* Ядро: DOM-хелперы, иконки, загрузка данных, картинки */

export const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#060906"/><text x="50%" y="50%" fill="#2E4434" font-family="monospace" font-size="20" text-anchor="middle" dominant-baseline="middle">// no photo</text></svg>`
  );

/* ---------- DOM ---------- */

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "html") node.innerHTML = value; // только для доверенной разметки подсветки поиска
    else if (value === true) node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(child));
  }
  return node;
}

/* ---------- SVG-иконки (никаких эмодзи, всё по чеклисту) ---------- */

const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  sliders: '<path d="M21 6H14M10 6H3M21 12H12M8 12H3M21 18H16M12 18H3"/><path d="M14 4v4M8 10v4M16 16v4"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  cube: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  hexlogo: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M10 8.5 7.5 12 10 15.5M14 8.5 16.5 12 14 15.5"/>',
};

export function icon(name, size = 16) {
  const span = h("span", { class: "icon", "aria-hidden": "true" });
  span.style.display = "inline-flex";
  span.style.flex = "none";
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] ?? ""}</svg>`;
  return span;
}

/* ---------- прочее ---------- */

export function plural(n, one, few, many) {
  const m = Math.abs(n) % 100;
  const d = m % 10;
  if (m > 10 && m < 20) return many;
  if (d > 1 && d < 5) return few;
  if (d === 1) return one;
  return many;
}

/* ---------- данные ---------- */

export async function loadSite(root = "") {
  const [manifest, config] = await Promise.all([
    fetch(root + "manifest.json").then((r) => {
      if (!r.ok) throw new Error("manifest.json не загрузился: " + r.status);
      return r.json();
    }),
    fetch(root + "site.config.json").then((r) => {
      if (!r.ok) throw new Error("site.config.json не загрузился: " + r.status);
      return r.json();
    }),
  ]);
  setAssetRoot(root); /* пути из манифеста — от корня, страницы бывают вложенными */
  return { manifest, config, root };
}

/* справочные лейблы/цвета с фолбэками, чтобы кривой конфиг не ронял рендер */
export function ref(dict, key) {
  return dict[key] ?? { label: key, color: "var(--fg-muted)", order: 999 };
}

/* ---------- картинки ---------- */

/* префикс корня сайта для путей из манифеста (они хранятся от корня,
   а страницы лежат на разной глубине: / и /addons/ */
let ASSET_ROOT = "";
export function setAssetRoot(root) {
  ASSET_ROOT = String(root ?? "");
}

export function assetUrl(path) {
  return path ? ASSET_ROOT + path : path;
}

/* Ленивая загрузка — движок в `core.js`, НЕ нативный loading="lazy" (Chromium на
   медленной сети стартует поздно и строки карточек приезжают пустыми).

   Один sweep() по наблюдаемым:
   - near (вьюпорт ± 100px): старт всегда, fetchPriority="high";
   - остальное: prefetch-очередь ПО БЛИЗОСТИ к вьюпорту, партиями (PREFETCH_BATCH),
     только пока в near нет незагруженных (idle: юзер стоит — тянем хвост и
     НЕ ЖДЁМ скролла; партия load → следующий sweep → следующая партия);
   - hidden (нулевые ректы, display:none): отмена.

   КЛЮЧЕВЫЕ ИНВАРИАНТЫ:
   1. Гистерезис: начатая загрузка near/ближнего rest НЕ отменяется никогда —
      шторм «старт→сброс→рестарт с нуля» оставляет строки пустыми навсегда.
   2. Отмена хвоста только по дальности: > HARD_CANCEL всегда, > CANCEL_DIST
      при активном nearPending (юзер реально ушёл смотреть другое место).

   Триггеры sweep: IO-батч, scroll/resize (rAF), load/error. Скролл-триггер
   обязателен: переход rest→near внутри зоны наблюдения IO не сообщает.

   Грабли (не наступать): complete===true у img БЕЗ src (спека!) — «готово» это
   complete && naturalWidth>0; detached-узел и предок с display:none дают нулевые
   ректы (detached посчитался бы near) — вычищать/детектить отдельно. */

const NEAR = 100, FAR = 1200;         /* зоны: старт и «тёплый» охват */
const CANCEL_DIST = 1200, HARD_CANCEL = 3000; /* отмена хвоста: при nearPending / всегда */
const PREFETCH_BATCH = 12;            /* размер idle-партии: полоса не захлёбывается */

let lazyIO = null;
const tracked = new Set();
let sweepScheduled = false;

function zoneOf(img) {
  if (img.getClientRects().length === 0) return "hidden"; /* display:none у предка (закрытая модалка и т.п.) */
  const r = img.getBoundingClientRect();
  if (r.bottom > -NEAR && r.top < innerHeight + NEAR) return "near";
  return "rest"; /* дальняя сортировка по близости — см. sweep, фиксированный far-предел
                    не тянет хвост за партией: юзер стоит, ректы не меняются, зона бы
                    никогда не расширилась */
}

function distanceToViewport(r) {
  const vpTop = 0, vpBot = innerHeight;
  if (r.bottom < vpTop) return vpTop - r.bottom;   /* выше */
  if (r.top > vpBot) return r.top - vpBot;         /* ниже */
  return 0;                                        /* в вьюпорте */
}

function sweep() {
  let nearPending = false;
  let restLoading = 0;
  const rest = []; /* { img, dist } — idle-кандидаты по близости */
  for (const img of tracked) {
    if (!img.isConnected) { drop(img); continue; }
    if (img.complete && img.naturalWidth > 0) { drop(img); continue; } /* готово */
    const z = zoneOf(img);
    if (z === "hidden") {
      if (img.getAttribute("src")) img.removeAttribute("src"); /* невидимое — не грузим */
      continue;
    }
    const r = img.getBoundingClientRect();
    const dist = distanceToViewport(r);
    if (z === "near") {
      nearPending = true;
      if (!img.getAttribute("src") && img.dataset.src) { /* новая или отменённая */
        img.fetchPriority = "high";
        img.src = img.dataset.src;
      }
      continue;
    }
    /* rest: качается? гистерезис с порогами отмены, стартует — в очередь */
    if (img.getAttribute("src")) {
      if (dist > HARD_CANCEL || (dist > CANCEL_DIST && nearPending)) {
        img.removeAttribute("src"); /* юзер ушёл далеко — хвост больше не нужен */
      } else {
        restLoading++; /* поддерживаем уровень очереди, а не лавину от каждого load */
      }
      continue;
    }
    rest.push({ img, dist });
  }
  if (!nearPending) {
    /* экран загружен — тянем запас ближайший-вперёд, ДОПОЛНЯЯ очередь до уровня
       PREFETCH_BATCH: сколько доехало — столько новых стартует. Без уровня каждый
       load досыпал бы партию, и полоса делилась на десятки ручьёв */
    const slots = PREFETCH_BATCH - restLoading;
    if (slots > 0) {
      rest.sort((a, b) => a.dist - b.dist);
      for (const { img } of rest.slice(0, slots)) {
        img.fetchPriority = "low";
        img.src = img.dataset.src;
      }
    }
  }
}

function scheduleSweep() {
  if (sweepScheduled) return;
  sweepScheduled = true;
  requestAnimationFrame(() => { sweepScheduled = false; sweep(); });
}

function drop(img) {
  tracked.delete(img);
  lazyIO?.unobserve(img);
}

function onBatch() { sweep(); }

export function getLazyIO() {
  if (!lazyIO) {
    lazyIO = new IntersectionObserver(onBatch, { rootMargin: FAR + "px 0px" });
    addEventListener("scroll", scheduleSweep, { passive: true });
    addEventListener("resize", scheduleSweep, { passive: true });
  }
  return lazyIO;
}

export function photo(src, { alt = "", cls = "", w = null, h2 = null, eager = false } = {}) {
  const url = src ? ASSET_ROOT + src : null;
  const img = h("img", {
    alt,
    class: cls,
    decoding: "async",
    ...(url && eager ? { src: url } : {}), /* атрибут src не ставим вовсе: пустой "" бьёт запросом в текущую страницу */
  });
  if (w && h2) {
    img.setAttribute("width", w);
    img.setAttribute("height", h2);
  }
  if (!url) {
    img.src = PLACEHOLDER;
    return img;
  }
  if (eager) {
    /* уже назначен выше */
  } else {
    img.dataset.src = url;
    tracked.add(img);
    getLazyIO().observe(img);
    scheduleSweep(); /* старт без ожидания IO-батча (первый кадр) */
    /* по завершении загрузки/ошибки: снять с наблюдения и пересчитать политику —
       ближняя зона опустела → пора тянуть дальний запас */
    img.addEventListener("load", () => { drop(img); scheduleSweep(); }, { once: true });
    img.addEventListener("error", () => { drop(img); scheduleSweep(); }, { once: true });
  }
  img.addEventListener("error", () => {
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = PLACEHOLDER;
  });
  return img;
}

/* обложка айтема: первое фото (или обложка-переопределение уже учтена сборщиком) */
export function coverPhoto(item, opts = {}) {
  return photo(item.photos?.[0]?.src, { alt: item.name, ...opts });
}

/* ---------- чипы ---------- */

export function chip(label, color, { href = null } = {}) {
  const style = color?.startsWith("#") ? `--chip-color:${color}` : null;
  if (href) return h("a", { class: "chip", href, style }, label);
  return h("span", { class: "chip", style }, label);
}

/* порядок внутри года: order (asc, без order — в конец), затем имя */
export function byOrderThenName(a, b) {
  const oa = Number.isFinite(a.order) ? a.order : 1e9;
  const ob = Number.isFinite(b.order) ? b.order : 1e9;
  return oa - ob || String(a.name).localeCompare(String(b.name), "ru");
}

/* счётчик коллекции в футер: X бейджей · Y аддонов */
export function setFooterStats(manifest) {
  const el = document.getElementById("footer-stats");
  if (!el) return;
  const b = manifest.stats.badges;
  const a = manifest.stats.addons;
  el.textContent = `в архиве: ${b} ${plural(b, "бейдж", "бейджа", "бейджей")} · ${a} ${plural(a, "аддон", "аддона", "аддонов")}`;
}

/* Текст с ссылками: голые URL и [подпись](url) становятся <a>.
   Сборка DOM-узлами без innerHTML — XSS неоткуда, схемы только http(s) */
export function richText(text) {
  const frag = document.createDocumentFragment();
  const src = String(text ?? "");
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+)/g;
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    if (m.index > last) frag.append(src.slice(last, m.index));
    let url = m[2] ?? m[3];
    let trail = "";
    if (!m[1]) {
      /* голый URL: откусываем замыкающую пунктуацию — «смотри https://x.com,» */
      const t = url.match(/[.,;:!?]+$/);
      if (t) { trail = t[0]; url = url.slice(0, -trail.length); }
    }
    frag.append(h("a", { href: url, target: "_blank", rel: "noopener" }, m[1] ?? url), trail);
    last = m.index + m[0].length;
  }
  if (last < src.length) frag.append(src.slice(last));
  return frag;
}
