/*
 * Модалка айтема: нативные <dialog> + хеш-роутинг.
 *
 * Инвариант: источник правды — location.hash.
 *  - hash = "#slug"  → модалка открыта
 *  - hash пуст       → модалка закрыта
 * Esc/крестик/клик по подложке закрывают через history.back() (если хеш
 * проставили мы) или через pushState-strip (если пришли по глубокой ссылке).
 *
 * Лайтбокс — отдельный <dialog> ВЫШЕ модалки: top layer бьёт любой z-index,
 * вложенные showModal() стекуются, Esc нативно закрывает только верхний.
 * Листание фото: стрелки ← →, колесо мыши, свайп — и в галерее, и в лайтбоксе.
 */
import { h, icon, chip, ref, PLACEHOLDER, assetUrl, richText } from "./core.js";

const MODEL_VIEWER_CDN = "https://cdn.jsdelivr.net/npm/@google/model-viewer@3/dist/model-viewer.min.js";
let modelViewerLoading = null;

function ensureModelViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (!modelViewerLoading) {
    modelViewerLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.type = "module";
      s.src = MODEL_VIEWER_CDN;
      s.onload = resolve;
      s.onerror = () => reject(new Error("model-viewer не загрузился"));
      document.head.append(s);
    });
  }
  return modelViewerLoading;
}

export function createItemModal({ site, kind, items }) {
  const { manifest, config, root } = site;
  const dialog = document.getElementById("item-modal");
  const body = dialog.querySelector(".modal-body");
  const kindLabel = kind === "badges" ? "БЕЙДЖ" : "АДДОН";

  let currentSlug = null;
  let openedByUs = false;

  /* навигация по фото текущей открытой модалки (пересоздаётся на каждый render) */
  let photoNav = null;

  /* ---------- лайтбокс: один диалог на страницу, контент подменяем ---------- */

  let lb = null;
  let lbImg = null;

  function ensureLightbox() {
    if (lb) return lb;
    lb = document.createElement("dialog");
    lb.className = "lightbox";
    lb.setAttribute("aria-label", "Просмотр фотографии");
    lbImg = document.createElement("img");
    lbImg.decoding = "async";
    const hint = h("span", { class: "hint" }, "← → / колесо / свайп — листать · клик или esc — закрыть");
    lb.append(lbImg, hint);
    lb.addEventListener("click", () => lb.close());
    /* колесо в лайтбоксе — листаем (стрелки ловит общий document-keydown, свайп ниже) */
    lb.addEventListener("wheel", (e) => {
      if (!photoNav) return;
      e.preventDefault();
      if (e.deltaY > 0 || e.deltaX > 0) photoNav.next(); else photoNav.prev();
    }, { passive: false });
    /* свайп в лайтбоксе */
    let tX = 0, tY = 0;
    lb.addEventListener("touchstart", (e) => {
      tX = e.touches[0].clientX; tY = e.touches[0].clientY;
    }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - tX;
      const dy = e.changedTouches[0].clientY - tY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) photoNav?.next(); else photoNav?.prev();
      }
    }, { passive: true });
    document.body.append(lb);
    return lb;
  }

  /* ---------- рендер содержимого ---------- */

  function mediaColumn(item) {
    const col = h("div", { class: "modal-media" });
    const photos = item.photos ?? [];
    let active = 0;

    const mainWrap = h("div", {
      class: "main-photo-wrap",
      role: "button",
      tabindex: "0",
      "aria-label": "Фото: клик — увеличить, колесо или свайп — листать",
    });
    const main = h("img", { src: PLACEHOLDER, alt: item.name, decoding: "async" });

    const thumbs = h("div", { class: "thumb-strip", role: "tablist", "aria-label": "Фотографии" });

    const setPhoto = (i) => {
      if (!photos.length) return;
      active = Math.max(0, Math.min(i, photos.length - 1));
      main.src = assetUrl(photos[active].src);
      if (photos[active].w) main.setAttribute("width", photos[active].w);
      if (photos[active].h) main.setAttribute("height", photos[active].h);
      if (!lb || !lb.open) {
        thumbs.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-current", j === active ? "true" : "false"));
      }
      if (lb && lb.open) lbImg.src = assetUrl(photos[active].src);
    };

    const next = () => setPhoto(active + 1);
    const prev = () => setPhoto(active - 1);

    if (photos.length) {
      main.src = assetUrl(photos[0].src);
      if (photos[0].w) main.setAttribute("width", photos[0].w);
      if (photos[0].h) main.setAttribute("height", photos[0].h);
      mainWrap.append(main);
    } else {
      mainWrap.append(h("span", { class: "no-photos" }, "// нет фотографий"));
    }

    /* открываем лайтбокс поверх модалки: тоже dialog → top layer */
    const openLightbox = () => {
      if (!photos.length) return;
      ensureLightbox();
      lbImg.src = assetUrl(photos[active].src);
      lbImg.alt = item.name;
      lb.showModal();
    };
    mainWrap.addEventListener("click", openLightbox);
    mainWrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(); }
    });

    /* колесо мыши над фото — листание (скролл модалки не дёргаем) */
    mainWrap.addEventListener("wheel", (e) => {
      if (!photos.length) return;
      e.preventDefault();
      if (e.deltaY > 0 || e.deltaX > 0) next(); else prev();
    }, { passive: false });

    /* свайп по главному фото */
    let tX = 0, tY = 0;
    mainWrap.addEventListener("touchstart", (e) => {
      tX = e.touches[0].clientX; tY = e.touches[0].clientY;
    }, { passive: true });
    mainWrap.addEventListener("touchend", (e) => {
      if (!photos.length) return;
      const dx = e.changedTouches[0].clientX - tX;
      const dy = e.changedTouches[0].clientY - tY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) next(); else prev();
      }
    }, { passive: true });

    col.append(mainWrap);

    photos.forEach((p, i) => {
      const b = h("button", { role: "tab", "aria-current": i === 0 ? "true" : "false", "aria-label": `Фото ${i + 1}`, onclick: () => setPhoto(i) },
        h("img", { src: assetUrl(p.src), alt: "", loading: "lazy", decoding: "async" }));
      thumbs.append(b);
    });
    if (photos.length > 1) col.append(thumbs);

    /* экспорт навигации для клавиатуры/лайтбокса */
    photoNav = photos.length ? { next, prev } : null;

    if (item.model3d) {
      ensureModelViewer()
        .then(() => {
          const mv = document.createElement("model-viewer");
          mv.setAttribute("src", assetUrl(item.model3d));
          mv.setAttribute("camera-controls", "");
          mv.setAttribute("auto-rotate", "");
          mv.setAttribute("shadow-intensity", "1");
          mv.setAttribute("aria-label", `3D-модель: ${item.name}`);
          mv.style.marginTop = "0.65rem";
          col.append(mv, h("p", { class: "visually-hidden" }, "3D-модель доступна выше"));
        })
        .catch(() => {
          col.append(h("p", { class: "no-photos", style: "margin-top:.65rem" }, "// 3D-модель не загрузилась"));
        });
    }
    return col;
  }

  function specRow(table, key, value) {
    if (value == null || value === "" || value === "Нет информации") return;
    table.append(h("tr", {}, h("th", { scope: "row" }, key), h("td", {}, value)));
  }

  function infoColumn(item) {
    const col = h("div", { class: "modal-info" });
    const ev = ref(config.events, item.event);

    const chips = h("div", { class: "chips" });
    if (kind === "addons") {
      chips.append(
        chip(ref(config.categories, item.category).label, ref(config.categories, item.category).color),
        chip(ref(config.rarities, item.rarity ?? "unknown").label, ref(config.rarities, item.rarity ?? "unknown").color),
      );
    }
    chips.append(chip(ev.label, ev.color), chip(String(item.year), "#94A3B8"));
    if (Array.isArray(item.tags)) for (const t of item.tags) chips.append(chip(t, "#616161"));

    const titleId = "modal-title-" + item.slug;
    col.append(
      h("h2", { id: titleId }, item.name),
      item.manufacturer ? h("p", { class: "mfr" }, item.manufacturer) : null,
      chips,
    );

    const table = h("table", { class: "spec-table" });
    if (kind === "addons") {
      specRow(table, "Категория", ref(config.categories, item.category).label);
      specRow(table, "Редкость", ref(config.rarities, item.rarity ?? "unknown").label);
      specRow(table, "Тираж", item.rarityNote ? richText(item.rarityNote) : null);
      specRow(table, "За что выдавали", item.obtainedFor ? richText(item.obtainedFor) : null);
      specRow(table, "Описание", item.description ? h("p", {}, richText(item.description)) : null);
    } else {
      specRow(table, "Конференция", ev.label);
      specRow(table, "Год", String(item.year));
      specRow(table, "Место", item.location);
      specRow(table, "Описание", item.description ? h("p", {}, richText(item.description)) : null);
    }
    col.append(table);

    /* «источник» и «исходники проекта» — одним абзацем: влезают — одна строка,
       не влезают — обычный перенос текста, без отдельной строки на каждую ссылку */
    const srcLinks = [];
    if (item.source) srcLinks.push(h("a", { href: item.source, target: "_blank", rel: "noopener" }, "источник ", icon("external", 13)));
    if (item.schematic) srcLinks.push(h("a", { href: item.schematic, target: "_blank", rel: "noopener" }, "исходники проекта ", icon("external", 13)));
    if (srcLinks.length) {
      const p = h("p", { class: "src-link" });
      srcLinks.forEach((a, i) => { if (i) p.append(" · "); p.append(a); });
      col.append(p);
    }

    /* кросс-ссылки */
    if (kind === "badges") {
      const related = manifest.addons
        .filter((a) => a.event === item.event && a.year === item.year)
        .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || a.name.localeCompare(b.name, "ru"));
      if (related.length) {
        const box = h("div", { class: "related" }, h("h3", {}, `Аддоны этого года — ${related.length}`));
        const chipsRow = h("div", { class: "chips" });
        for (const a of related) {
          chipsRow.append(h("a", { class: "chip", href: `${root}addons/#${a.slug}` }, a.name));
        }
        box.append(chipsRow);
        col.append(box);
      }
    } else {
      const badge = manifest.badges.find((b) => b.event === item.event && b.year === item.year);
      if (badge) {
        col.append(h("div", { class: "related" }, h("h3", {}, "Бейдж конференции"),
          h("div", { class: "chips" },
            h("a", { class: "chip", href: `${root}#${badge.slug}` }, badge.name))));
      }
    }
    return col;
  }

  function render(item) {
    dialog.querySelector(".modal-kind").textContent = kindLabel;
    body.replaceChildren(mediaColumn(item), infoColumn(item));
    dialog.setAttribute("aria-labelledby", "modal-title-" + item.slug);
  }

  /* ---------- клавиатура: ← → листают фото открытой модалки/лайтбокса ---------- */

  document.addEventListener("keydown", (e) => {
    if (!dialog.open || !photoNav) return;
    if (e.key === "ArrowRight") { e.preventDefault(); photoNav.next(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); photoNav.prev(); }
  });

  /* ---------- синхронизация с URL ---------- */

  function sync() {
    const slug = decodeURIComponent(location.hash.replace(/^#/, ""));
    const item = slug ? items.get(slug) : null;
    if (item) {
      currentSlug = item.slug;
      render(item);
      if (!dialog.open) dialog.showModal();
    } else {
      currentSlug = null;
      if (dialog.open) dialog.close();
    }
  }

  function open(slug) {
    if (location.hash.slice(1) !== slug) {
      openedByUs = true;
      history.pushState(null, "", "#" + slug);
    }
    sync();
  }

  dialog.addEventListener("close", () => {
    /* Esc/крестик/клик по подложке: чистим хеш тем же способом, каким он появился */
    if (currentSlug && location.hash.slice(1) === currentSlug) {
      if (openedByUs) history.back();
      else history.pushState(null, "", location.pathname + location.search);
    }
    body.replaceChildren();
    photoNav = null;
    openedByUs = false;
  });

  dialog.querySelector(".modal-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close(); // клик в подложку
  });

  window.addEventListener("popstate", sync);
  window.addEventListener("hashchange", sync);

  return { open, sync };
}
