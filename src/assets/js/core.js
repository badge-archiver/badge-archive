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

export function photo(src, { alt = "", cls = "", w = null, h2 = null, eager = false } = {}) {
  const img = h("img", {
    src: src ? ASSET_ROOT + src : PLACEHOLDER,
    alt,
    class: cls,
    loading: eager ? "eager" : "lazy",
    decoding: "async",
  });
  if (w && h2) {
    img.setAttribute("width", w);
    img.setAttribute("height", h2);
  }
  if (src) {
    img.addEventListener("error", () => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = "1";
      img.src = PLACEHOLDER;
    });
  }
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
