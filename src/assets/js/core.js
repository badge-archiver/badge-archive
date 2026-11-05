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
   - near (вьюпорт ± NEAR): немедленный старт, fetchPriority="high";
   - warm (до WARM от вьюпорта): упреждающий старт "low" пока есть свободные
     слоты загрузки — авангард качается ЗАРАНЕЕ, на подлёте юзера;
   - дальний rest: старт только когда near чист (юзер стоит — idle тянет хвост
     до конца списка, не дожидаясь скролла);
   - hidden (нулевые ректы, display:none): отмена.

   ГЛАВНЫЙ ИНВАРИАНТ (нарушение = баг «строки не прогружаются до конца страницы»):
   качающаяся картинка НЕ отменяется из-за появившейся near-работы. При
   непрерывном листании nearPending ВСЕГДА true — связанная с ним отмена косила
   всё недокачанное за спиной (старт→сброс→рестарт с нуля), и клетки оставались
   пустыми, пока юзер не упирался в конец страницы. Отмена качающегося — только
   безусловно за CANCEL_DIST или в hidden.

   Второй инвариант: суммарно качающихся ≤ MAX_LOADING — полоса не делится на
   десятки ручьёв, у near всегда есть доля.

   Триггеры sweep: IO-батч, scroll/resize (rAF), load/error. Скролл-триггер
   обязателен: переход rest→near внутри зоны наблюдения IO не сообщает.

   Грабли (не наступать): complete===true у img БЕЗ src (спека!) — «готово» это
   complete && naturalWidth>0; detached-узел и предок с display:none дают нулевые
   ректы (detached посчитался бы near) — вычищать/детектить отдельно. */

const NEAR = 150;            /* зона немедленного high-старта (вьюпорт ± это) */
const WARM_MIN = 900;        /* упреждающий low-старт на подлёте: минимум */
const WARM_LEAD_MS = 1300;   /* форы по времени: warm = скорость скролла × это */
const WARM_MAX = 3500;       /* и потолок зоны упреждения */
const WARM_SLOTS = 6;        /* гарант слотов авангарду — НЕ делятся с хвостом */
const TAIL_SLOTS = 6;        /* лимит качающегося хвоста (за warm-зоной) */
const SOCKET_BUDGET = 7;     /* качающихся не-near больше — жертвуем самыми дальними */
const CANCEL_DIST = 6000;    /* безусловная отмена качающегося: юзер ушёл далеко */
const FAR = 1200;            /* rootMargin IO-будильника */

let lazyIO = null;
const tracked = new Set();
let sweepScheduled = false;

/* скорость скролла (px/s): зона упреждения обязана масштабироваться темпом юзера.
   Отклик быстрый (0.5): резкий первый флинг не должен встречать минимальную зону */
let lastY = null, lastT = 0, velocity = 0;

function currentWarm() {
  return Math.max(WARM_MIN, Math.min(WARM_MAX, Math.round(velocity * WARM_LEAD_MS / 1000)));
}

function zoneOf(img) {
  if (img.getClientRects().length === 0) return "hidden"; /* display:none у предка (закрытая модалка и т.п.) */
  return "live"; /* близость к вьюпорту считаем по dist — см. sweep */
}

function distanceToViewport(r) {
  const vpTop = 0, vpBot = innerHeight;
  if (r.bottom < vpTop) return vpTop - r.bottom;   /* выше */
  if (r.top > vpBot) return r.top - vpBot;         /* ниже */
  return 0;                                        /* в вьюпорте */
}

function start(img, priority) {
  img.fetchPriority = priority;
  img.src = img.dataset.src;
}

function sweep() {
  const warmDist = currentWarm();
  let nearBusy = false;      /* в near есть незагруженная — юзер активно смотрит/едет */
  const loading = [];        /* качающиеся не-near: { img, dist } — для бюджетирования сокетов */
  const warm = [], idle = [];
  for (const img of tracked) {
    if (!img.isConnected) { drop(img); continue; }
    if (img.complete && img.naturalWidth > 0) { drop(img); continue; } /* готово */
    if (zoneOf(img) === "hidden") {
      if (img.getAttribute("src")) img.removeAttribute("src"); /* невидимое — не грузим */
      continue;
    }
    const dist = distanceToViewport(img.getBoundingClientRect());
    if (dist <= NEAR) {
      nearBusy = true;
      if (!img.getAttribute("src") && img.dataset.src) {
        start(img, "high");
      } else if (!img.dataset.resynced && loading.length >= SOCKET_BUDGET) {
        /* ДОГНАЛИ качающуюся low И сокеты кончились: идущему запросу приоритет
           не поднять, юзер смотрит на пустую клетку. Перезапуск с high теряет
           часть тела, но ставит запрос в голову очереди. Только по дефициту
           сокетов — иначе перезапуск лишь сбрасывает честный прогресс */
        img.dataset.resynced = "1";
        img.removeAttribute("src");
        start(img, "high");
      }
      continue;
    }
    if (img.getAttribute("src")) {
      /* ГИСТЕРЕЗИС: качается — пусть доезжает. Отмены — только за CANCEL_DIST
         (безусловно) и по бюджету сокетов (ниже, самые дальние) */
      if (dist > CANCEL_DIST) { img.removeAttribute("src"); continue; }
      loading.push({ img, dist });
      continue;
    }
    (dist <= warmDist ? warm : idle).push({ img, dist });
  }
  /* бюджет сокетов: HTTP/1.1 даёт ~6 соединений — если хвост съел их все,
     новые near-старты вечно ждут. Жертвуем самыми дальними качающимися */
  if (loading.length > SOCKET_BUDGET) {
    loading.sort((a, b) => b.dist - a.dist); /* дальние вперёд */
    for (const { img } of loading.slice(0, loading.length - SOCKET_BUDGET)) {
      img.removeAttribute("src");
      img.dataset.resynced = ""; /* рестарт ей снова разрешён */
    }
    loading.length = SOCKET_BUDGET;
  }
  /* авангард: гарантированные слоты — хвост за спиной не должен съедать их,
     иначе при быстром листании впереди ничего не стартует */
  if (warm.length) {
    warm.sort((a, b) => a.dist - b.dist);
    for (const { img } of warm.slice(0, WARM_SLOTS)) start(img, "low");
  }
  /* idle-догрузка хвоста: только когда видимое обеспечено (юзер стоит) */
  if (!nearBusy && idle.length && loading.length < TAIL_SLOTS) {
    idle.sort((a, b) => a.dist - b.dist);
    const slots = TAIL_SLOTS - loading.length;
    for (const { img } of idle.slice(0, slots)) start(img, "low");
  }
}

function scheduleSweep() {
  if (sweepScheduled) return;
  sweepScheduled = true;
  requestAnimationFrame(() => {
    sweepScheduled = false;
    /* скорость по факту кадра: сглаженная, гаснет при остановке */
    const y = scrollY, t = performance.now();
    if (lastY !== null) {
      const dt = t - lastT;
      if (dt > 0 && dt < 500) {
        const v = Math.abs(y - lastY) / dt * 1000;
        velocity = velocity * 0.5 + v * 0.5; /* отклик за 2-3 кадра: резкий флинг сразу раскрывает зону */
      }
    }
    lastY = y; lastT = t;
    sweep();
  });
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
    console.info("[badge-archive] lazy engine v10 (adaptive warm, socket budget, resync) — если видите эту строку, движок свежий");
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
