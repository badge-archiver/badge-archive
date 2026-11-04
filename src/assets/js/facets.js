/*
 * Фасеточные фильтры: состояние в URL (?year=2025&year=2024&maker=...),
 * счётчики по правилу «все остальные активные фильтры, кроме текущей размерности»,
 * мультиселект AND между размерностями, OR внутри одной.
 */
import { h } from "./core.js";

const MAX_VISIBLE = 10;

export function createFacetEngine({ config, items, onChange = () => {} }) {
  const facetDefs = config.facets ?? [];
  const dicts = { event: config.events, category: config.categories, rarity: config.rarities };

  /* значения поля айтема → массив строк */
  function itemValues(item, field) {
    if (field === "rarity") return [item.rarity ?? "unknown"];
    const raw = item[field];
    if (Array.isArray(raw)) return raw.map(String);
    if (raw == null || raw === "") return [];
    return [String(raw)];
  }

  /* ---------- состояние (URL → Map<field, Set<value>>) ---------- */

  let state = readState();

  function readState() {
    const params = new URLSearchParams(location.search);
    const st = new Map();
    for (const def of facetDefs) {
      const vals = params.getAll(def.field).filter(Boolean);
      if (vals.length) st.set(def.field, new Set(vals));
    }
    return st;
  }

  function writeState() {
    const params = new URLSearchParams(location.search);
    for (const def of facetDefs) params.delete(def.field);
    for (const [field, values] of state) {
      for (const v of values) params.append(field, v);
    }
    const qs = params.toString();
    /* replaceState: перещёлкивание фильтров не должно засирать историю */
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  }

  function matchesExcept(item, exceptField) {
    for (const [field, values] of state) {
      if (field === exceptField) continue;
      const iv = itemValues(item, field);
      let hit = false;
      for (const v of values) if (iv.includes(v)) { hit = true; break; }
      if (!hit) return false;
    }
    return true;
  }

  function filter(list = items) {
    return list.filter((it) => matchesExcept(it, null));
  }

  function valuesFor(field) {
    const counts = new Map();
    for (const it of items) {
      if (!matchesExcept(it, field)) continue;
      for (const v of new Set(itemValues(it, field))) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const def = facetDefs.find((d) => d.field === field);
    const dict = dicts[field];
    const arr = [...counts.entries()].map(([value, count]) => ({ value, count }));
    arr.sort((a, b) => {
      if (def?.sort === "desc") return Number(b.value) - Number(a.value) || b.value.localeCompare(a.value);
      if (def?.sort === "config" && dict) {
        return (dict[a.value]?.order ?? 999) - (dict[b.value]?.order ?? 999) || a.value.localeCompare(b.value, "ru");
      }
      return a.value.localeCompare(b.value, "ru");
    });
    return arr;
  }

  function labelFor(field, value) {
    const dict = dicts[field];
    return dict?.[value]?.label ?? value;
  }

  /* ---------- операции ---------- */

  function isActive() {
    for (const values of state.values()) if (values.size) return true;
    return false;
  }

  /* снимок выделений для отрисовки нажатых чипов в карточках */
  function selections() {
    return new Map([...state].map(([k, v]) => [k, new Set(v)]));
  }

  function toggle(field, value) {
    const values = state.get(field) ?? new Set();
    if (values.has(value)) values.delete(value);
    else values.add(value);
    if (values.size) state.set(field, values);
    else state.delete(field);
    writeState();
    onChange(); /* единая точка: любое изменение состояния оповещает страницу */
  }

  function clear() {
    state = new Map();
    writeState();
    onChange();
  }

  /* ---------- рендер ---------- */

  const collapsed = new Set(); // какие группы пользователь раскрыл

  function render(container) {
    container.replaceChildren();

    if (isActive()) {
      container.append(h("button", {
        class: "filters-clear",
        onclick: () => { clear(); render(container); },
      }, "× сбросить всё"));
    }

    for (const def of facetDefs) {
      const values = valuesFor(def.field);
      if (values.length < 2) continue; // один вариант — нечего фильтровать

      const active = state.get(def.field) ?? new Set();
      const expanded = collapsed.has(def.field) || values.length <= MAX_VISIBLE;
      const visible = expanded ? values : values.slice(0, MAX_VISIBLE - 1);

      const group = h("div", { class: "facet-group", dataset: { field: def.field } });
      group.append(h("p", { class: "facet-title" }, def.label, h("span", { class: "cnt" }, String(active.size || ""))));

      const row = h("div", { class: "facet-values" });
      for (const { value, count } of visible) {
        row.append(h("button", {
          class: "facet-btn",
          "aria-pressed": active.has(value) ? "true" : "false",
          onclick: () => { toggle(def.field, value); render(container); },
        }, labelFor(def.field, value), h("span", { class: "n" }, String(count))));
      }
      if (!expanded) {
        row.append(h("button", {
          class: "facet-more",
          onclick: () => { collapsed.add(def.field); render(container); },
        }, `ещё ${values.length - (MAX_VISIBLE - 1)} →`));
      }
      group.append(row);
      container.append(group);
    }

    if (!container.children.length || (container.children.length === 1 && !facetDefs.length)) {
      container.append(h("p", { class: "facet-title" }, "фильтров нет"));
    }
  }

  return { filter, valuesFor, render, isActive, selections, toggle, clear };
}

/* поиск по подстроке: имя/изготовитель/описание.
   запрос нормализуем здесь же — не зависим от дисциплины вызывающего */
export function searchMatch(item, query) {
  const q = String(query ?? "").toLowerCase().replaceAll("ё", "е").trim();
  if (!q) return true;
  const hay = [item.name, item.manufacturer, item.description]
    .map((s) => String(s ?? "").toLowerCase().replaceAll("ё", "е"))
    .join(" \n ");
  return hay.includes(q);
}

/* подсветка совпадения в имени */
export function highlightName(name, queryNorm) {
  if (!queryNorm) return [name];
  const norm = String(name).toLowerCase().replaceAll("ё", "е");
  const i = norm.indexOf(queryNorm);
  if (i === -1) return [name];
  return [name.slice(0, i), h("mark", {}, name.slice(i, i + queryNorm.length)), name.slice(i + queryNorm.length)];
}
