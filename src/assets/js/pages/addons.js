/* Страница /addons/: годы desc + фасеточные фильтры + поиск */
import { loadSite, h, icon, plural, byOrderThenName, setFooterStats } from "../core.js";
import { createItemModal } from "../modal.js";
import { createFacetEngine, searchMatch } from "../facets.js";
import { addonCard, setOpenHandler } from "../cards.js";

export async function runAddonsPage(root) {
  const site = await loadSite(root);
  const { manifest, config } = site;
  const main = document.getElementById("content");
  main.replaceChildren();
  setFooterStats(manifest);

  /* модалка + хеш-роутинг */
  const items = new Map(manifest.addons.map((a) => [a.slug, a]));
  const modal = createItemModal({ site, kind: "addons", items });
  setOpenHandler((slug) => modal.open(slug));

  const facets = createFacetEngine({ config, items: manifest.addons, onChange: () => renderGrid() });

  /* ---------- каркас: слева поиск+фильтры, справа каталог ---------- */

  const searchInput = h("input", {
    type: "search",
    placeholder: "поиск…",
    "aria-label": "Поиск по коллекции",
    inputmode: "search",
  });

  const filterBtn = h("button", { class: "filters-open-btn", onclick: () => openFiltersSheet() },
    "ФИЛЬТРЫ", h("span", {}, ""));

  const panel = h("aside", { class: "filter-panel", "aria-label": "Фильтры" });
  const sideCol = h("div", { class: "side-col" },
    h("div", { class: "search-row" },
      h("div", { class: "search-box" }, icon("search", 15), searchInput),
      filterBtn,
    ),
    panel,
  );

  const gridHost = h("div");
  const layout = h("div", { class: "wrap catalog-page" },
    h("div", { class: "layout-cols" },
      sideCol,
      h("div", {}, gridHost),
    ),
  );
  main.append(layout);

  /* ---------- мобильная шторка фильтров ---------- */

  const sheet = document.getElementById("filters-sheet");
  let sheetHost = null;

  function openFiltersSheet() {
    sheetHost = h("div");
    /* панель переносим в диалог целиком — один рендер, ноль дублирования.
       display:none из мобильного CSS перебиваем инлайном, пустая строка его не перебьёт */
    panel.style.display = "block";
    panel.style.position = "static";
    panel.style.maxHeight = "none";
    panel.style.border = "none";
    panel.style.background = "transparent";
    sheetHost.append(panel);
    sheet.replaceChildren(
      h("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem" },
        h("p", { class: "section-label", style: "margin:0" }, "ФИЛЬТРЫ"),
        h("button", { class: "modal-close", "aria-label": "Закрыть фильтры", onclick: () => sheet.close() }, "×"),
      ),
      sheetHost,
    );
    sheet.showModal();
  }

  sheet.addEventListener("close", () => {
    /* возвращаем панель в сайдбар */
    panel.style.cssText = "";
    sideCol.append(panel);
    renderGrid();
  });

  /* ---------- рендер ---------- */

  function countActive() {
    let n = 0;
    const params = new URLSearchParams(location.search);
    for (const f of config.facets) n += params.getAll(f.field).length;
    return n;
  }

  function renderGrid() {
    const query = searchInput.value.toLowerCase().replaceAll("ё", "е").trim();
    const list = facets.filter(manifest.addons).filter((a) => searchMatch(a, query));
    const active = facets.selections(); /* для зажатых чипов в карточках */

    gridHost.replaceChildren();
    if (!list.length) {
      gridHost.append(h("div", { class: "empty-note" },
        "// ничего не найдено — попробуй ослабить фильтры",
        h("div", { style: "margin-top:.8rem" },
          h("button", { class: "filters-clear", style: "width:auto", onclick: () => { facets.clear(); searchInput.value = ""; renderAll(); } }, "× сбросить всё"),
        ),
      ));
      updateFilterBtn();
      return;
    }

    /* годовые секции: desc, внутри — order, затем имя */
    const byYear = new Map();
    for (const a of list) {
      if (!byYear.has(a.year)) byYear.set(a.year, []);
      byYear.get(a.year).push(a);
    }

    for (const year of [...byYear.keys()].sort((a, b) => b - a)) {
      const group = byYear.get(year).sort(byOrderThenName);
      gridHost.append(
        h("section", { class: "year-block" },
          h("div", { class: "year-head" },
            h("h2", {}, String(year)),
            h("span", { class: "y-count" }, `${group.length} ${plural(group.length, "аддон", "аддона", "аддонов")}`),
          ),
          h("div", { class: "cards-grid" }, group.map((a) => addonCard(a, config, { query, active, onChipToggle }))),
        ),
      );
    }
    updateFilterBtn();
  }

  function updateFilterBtn() {
    const n = countActive();
    filterBtn.lastChild.textContent = n ? ` (${n})` : "";
  }

  /* клик по чипу в карточке: тумблер фасета + перерисовка панели (сетку обновит onChange) */
  function onChipToggle(field, value) {
    facets.toggle(field, value);
    facets.render(panel);
  }

  function renderAll() {
    facets.render(panel);
    renderGrid();
  }

  let debounce = 0;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(renderGrid, 120);
  });

  renderAll();
  modal.sync(); // глубокая ссылка /addons/#slug
}
