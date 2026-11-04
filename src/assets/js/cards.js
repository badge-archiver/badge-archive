/* Карточки сеток */
import { h, coverPhoto, chip, ref, plural } from "./core.js";

/* карточка — article с ролью кнопки: в <button> нельзя класть заголовки/дивы (модель контента),
   а article + keydown даёт ту же клавиатурную доступность без битого HTML.
   Клик по вложенным чипам-фильтрам карточку НЕ открывает */
function cardShell(item, children) {
  const el = h("article", {
    class: "card",
    role: "button",
    tabindex: "0",
    dataset: { slug: item.slug },
    "aria-label": item.name,
  }, ...children);
  const fromChip = (target) => target && target.closest && target.closest(".chip-btn");
  el.addEventListener("click", (e) => {
    if (fromChip(e.target)) return;
    open(item.slug);
  });
  el.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (fromChip(e.target)) return;
    e.preventDefault();
    open(item.slug);
  });
  return el;
}

/* чип-фильтр внутри карточки: клик применяет/снимает фасет */
function filterChip(field, value, def, active, onChipToggle) {
  const pressed = active?.get(field)?.has(value) ? "true" : "false";
  return h("button", {
    class: "chip chip-btn",
    "aria-pressed": pressed,
    style: `--chip-color:${def.color}`,
    onclick: (e) => {
      e.stopPropagation();
      onChipToggle?.(field, value);
    },
  }, h("span", { class: "chip-label" }, def.label));
}

export function addonCard(item, config, { query = "", active = null, onChipToggle = null } = {}) {
  const cat = ref(config.categories, item.category);
  const rar = ref(config.rarities, item.rarity ?? "unknown");
  const name = item.name;

  const nameEl = h("h3", { class: "card-name" });
  if (query) {
    const norm = name.toLowerCase().replaceAll("ё", "е");
    const i = norm.indexOf(query);
    if (i !== -1) {
      nameEl.append(name.slice(0, i), h("mark", {}, name.slice(i, i + query.length)), name.slice(i + query.length));
    } else nameEl.append(name);
  } else nameEl.append(name);

  return cardShell(item, [
    h("div", { class: "card-photo-wrap", "aria-hidden": "true" },
      coverPhoto(item),
      h("span", { class: "card-year" }, String(item.year)),
    ),
    h("div", { class: "card-body" },
      nameEl,
      item.manufacturer ? h("p", { class: "card-sub" }, item.manufacturer) : null,
      h("div", { class: "chips" },
        filterChip("category", item.category, cat, active, onChipToggle),
        filterChip("rarity", item.rarity ?? "unknown", rar, active, onChipToggle),
      ),
    ),
  ]);
}

export function badgeCard(item, config, addonCounts) {
  const ev = ref(config.events, item.event);
  const n = addonCounts.get(`${item.event}:${item.year}`) ?? 0;
  return cardShell(item, [
    h("div", { class: "card-photo-wrap", "aria-hidden": "true" },
      coverPhoto(item),
      h("span", { class: "card-year" }, String(item.year)),
    ),
    h("div", { class: "card-body" },
      h("h3", { class: "card-name" }, item.name),
      item.location ? h("p", { class: "card-sub" }, item.location) : null,
      h("div", { class: "chips" },
        chip(ev.label, ev.color),
        n ? chip(`${n} ${plural(n, "аддон", "аддона", "аддонов")}`, "#616161") : null,
      ),
    ),
  ]);
}

/* open() прокидывается страницей, чтобы не таскать модалку через слои */
let openHandler = () => {};
export function setOpenHandler(fn) { openHandler = fn; }
function open(slug) { openHandler(slug); }
