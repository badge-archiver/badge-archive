/* OFFZONE Badge Archive — рендер из SITE_DATA (data.js) */
(function () {
  "use strict";

  var PLACEHOLDER = "assets/img/placeholder.svg";

  var CATEGORIES = {
    partner:   { label: "Партнёрские",  chip: "cat-partner" },
    soldering: { label: "Зона пайки",   chip: "cat-soldering" },
    community: { label: "Комьюнити",    chip: "cat-community" }
  };

  var RARITIES = {
    common:    { label: "Обычный",      chip: "rar-common" },
    uncommon:  { label: "Необычный",    chip: "rar-uncommon" },
    rare:      { label: "Редкий",       chip: "rar-rare" },
    epic:      { label: "Эпический",    chip: "rar-epic" },
    legendary: { label: "Легендарный",  chip: "rar-legendary" },
    unknown:   { label: "Неизвестно",   chip: "rar-unknown" }
  };

  var state = { eventId: null, filter: "all" };

  /* ---------- helpers ---------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function photo(src, cls, alt) {
    var img = el("img", cls);
    img.src = src || PLACEHOLDER;
    img.alt = alt || "";
    img.loading = "lazy";
    img.onerror = function () {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "1";
        img.src = PLACEHOLDER;
      }
    };
    return img;
  }

  function chip(text, cls) {
    return el("span", "chip " + cls, text);
  }

  function plural(n, one, few, many) {
    var m = Math.abs(n) % 100, d = m % 10;
    if (m > 10 && m < 20) return many;
    if (d > 1 && d < 5) return few;
    if (d === 1) return one;
    return many;
  }

  function getEvent(id) {
    return SITE_DATA.events.find(function (e) { return e.id === id; });
  }

  /* Аддоны конкретного года: из общего списка по years[],
     порядок — addonOrder события, затем порядок в addons[] */
  function eventAddons(ev) {
    var list = SITE_DATA.addons.filter(function (a) {
      return a.years && a.years.indexOf(ev.id) !== -1;
    });
    if (ev.addonOrder && ev.addonOrder.length) {
      var rank = {};
      ev.addonOrder.forEach(function (id, i) { rank[id] = i; });
      var rest = ev.addonOrder.length;
      list = list.slice().sort(function (a, b) {
        var ra = rank[a.id] != null ? rank[a.id] : rest;
        var rb = rank[b.id] != null ? rank[b.id] : rest;
        return ra - rb;
      });
    }
    return list;
  }

  /* ---------- stats ---------- */

  function renderStats() {
    var box = document.getElementById("stats-line");
    if (!box) return;
    var unique = SITE_DATA.addons.length;
    var appearances = SITE_DATA.addons.reduce(function (s, a) {
      return s + (a.years ? a.years.length : 0);
    }, 0);
    box.textContent =
      "В коллекции: " + unique + " " +
      plural(unique, "уникальный аддон", "уникальных аддона", "уникальных аддонов") +
      " · " + appearances + " " +
      plural(appearances, "появление", "появления", "появлений") + " по годам";
  }

  /* ---------- tabs (сгруппированные) ---------- */

  /* Группа события: явное поле group в data.js, иначе —
     id начинается с "offzone" → блок OFFZONE, остальные → «Другое» */
  function eventGroup(ev) {
    if (ev.group) return ev.group;
    return ev.id.indexOf("offzone") === 0 ? "offzone" : "other";
  }

  var GROUPS = [
    { key: "offzone", label: "OFFZONE" },
    { key: "other",   label: "Другое" }
  ];

  function renderTabs() {
    var nav = document.getElementById("event-tabs");
    nav.innerHTML = "";

    GROUPS.forEach(function (g) {
      var evs = SITE_DATA.events.filter(function (ev) { return eventGroup(ev) === g.key; });
      if (!evs.length) return;

      var row = el("div", "tab-group");
      row.appendChild(el("span", "tab-group-label", g.label));

      evs.forEach(function (ev) {
        var btn = el("button", "tab-btn" + (ev.id === state.eventId ? " active" : ""), ev.title);
        btn.addEventListener("click", function () {
          state.eventId = ev.id;
          state.filter = "all";
          render();
        });
        row.appendChild(btn);
      });

      nav.appendChild(row);
    });
  }

  /* ---------- media block (фото + галерея + 3D) ---------- */

  function buildMedia(item) {
    var box = el("div", "media-box");
    var photos = item.photos && item.photos.length ? item.photos : [];

    if (item.model3d) {
      var mv = document.createElement("model-viewer");
      mv.setAttribute("src", item.model3d);
      mv.setAttribute("camera-controls", "");
      mv.setAttribute("auto-rotate", "");
      mv.setAttribute("shadow-intensity", "1");
      box.appendChild(mv);
      box.appendChild(el("p", "model-note", "3D-модель — вращайте мышью / пальцем"));
    }

    var main = photo(photos[0], "main-photo", item.name);
    if (item.model3d && !photos.length) main.style.display = "none";
    main.title = "Нажмите, чтобы увеличить";
    main.addEventListener("click", function () {
      openLightbox(main.src, item.name);
    });
    box.appendChild(main);

    if (photos.length > 1) {
      var gal = el("div", "gallery");
      photos.forEach(function (src, i) {
        var thumb = photo(src, i === 0 ? "active" : "", item.name + " — фото " + (i + 1));
        thumb.addEventListener("click", function () {
          main.src = src;
          main.style.display = "";
          gal.querySelectorAll("img").forEach(function (t) { t.classList.remove("active"); });
          thumb.classList.add("active");
        });
        gal.appendChild(thumb);
      });
      box.appendChild(gal);
    }
    return box;
  }

  /* ---------- badge section ---------- */

  function renderBadge(ev) {
    var sec = document.getElementById("badge-section");
    sec.innerHTML = "";

    var layout = el("div", "badge-layout");
    layout.appendChild(buildMedia(ev.badge));

    var info = el("div", "badge-info");
    info.appendChild(el("p", "section-label", "Бейдж"));
    info.appendChild(el("h1", "event-title", ev.title));
    var meta = [ev.date, ev.location].filter(Boolean).join(" · ");
    info.appendChild(el("p", "event-meta", meta));
    info.appendChild(el("h3", null, ev.badge.name));
    if (ev.badge.description) info.appendChild(el("p", null, ev.badge.description));
    if (ev.badge.source) {
      var link = el("p");
      var a = el("a", null, "Источник ↗");
      a.href = ev.badge.source;
      a.target = "_blank";
      a.rel = "noopener";
      link.appendChild(a);
      info.appendChild(link);
    }
    layout.appendChild(info);
    sec.appendChild(layout);
  }

  /* ---------- filters ---------- */

  function renderFilters(ev) {
    var box = document.getElementById("filters");
    box.innerHTML = "";

    var all = eventAddons(ev);
    var counts = { all: all.length };
    Object.keys(CATEGORIES).forEach(function (c) {
      counts[c] = all.filter(function (a) { return a.category === c; }).length;
    });

    var defs = [{ key: "all", label: "Все" }].concat(
      Object.keys(CATEGORIES).map(function (k) { return { key: k, label: CATEGORIES[k].label }; })
    );

    defs.forEach(function (d) {
      var btn = el("button", "filter-btn" + (state.filter === d.key ? " active" : ""));
      btn.appendChild(document.createTextNode(d.label));
      btn.appendChild(el("span", "count", String(counts[d.key] || 0)));
      btn.addEventListener("click", function () {
        state.filter = d.key;
        renderFilters(ev);
        renderAddons(ev);
      });
      box.appendChild(btn);
    });
  }

  /* ---------- addons grid ---------- */

  function renderAddons(ev) {
    var grid = document.getElementById("addons-grid");
    grid.innerHTML = "";

    var list = eventAddons(ev).filter(function (a) {
      return state.filter === "all" || a.category === state.filter;
    });

    if (!list.length) {
      grid.appendChild(el("div", "empty-note", "// пока пусто — коллекция пополняется"));
      return;
    }

    list.forEach(function (a) {
      var card = el("article", "card");
      card.appendChild(photo(a.photos && a.photos[0], "card-photo", a.name));

      var body = el("div", "card-body");
      body.appendChild(el("h3", "card-name", a.name));
      body.appendChild(el("p", "card-company", a.company || ""));

      var chips = el("div", "chips");
      var cat = CATEGORIES[a.category];
      var rar = RARITIES[a.rarity];
      if (cat) chips.appendChild(chip(cat.label, cat.chip));
      if (rar) chips.appendChild(chip(rar.label, rar.chip));
      body.appendChild(chips);

      card.appendChild(body);
      card.addEventListener("click", function () { openModal(a); });
      grid.appendChild(card);
    });
  }

  /* ---------- modal ---------- */

  var backdrop = document.getElementById("modal-backdrop");

  function openModal(a) {
    var body = document.getElementById("modal-body");
    body.innerHTML = "";

    var layout = el("div", "modal-layout");
    layout.appendChild(buildMedia(a));

    var info = el("div");
    var cat = CATEGORIES[a.category];
    var rar = RARITIES[a.rarity];
    if (cat) info.appendChild(el("p", "section-label", cat.label));
    info.appendChild(el("h3", null, a.name));
    if (a.company) info.appendChild(el("p", "company-line", a.company));

    var chips = el("div", "chips");
    if (cat) chips.appendChild(chip(cat.label, cat.chip));
    if (rar) chips.appendChild(chip(rar.label, rar.chip));
    info.appendChild(chips);

    var table = el("table", "detail-table");
    function row(k, v) {
      if (!v) return;
      var tr = document.createElement("tr");
      tr.appendChild(el("td", null, k));
      tr.appendChild(el("td", null, v));
      table.appendChild(tr);
    }
    row("Редкость", rar ? rar.label : null);
    row("Тираж", a.rarityNote);
    row("За что выдавали", a.obtainedFor);
    row("Описание", a.description);
    info.appendChild(table);

    if (a.source) {
      var p = el("p");
      var link = el("a", null, "Источник информации ↗");
      link.href = a.source;
      link.target = "_blank";
      link.rel = "noopener";
      p.appendChild(link);
      info.appendChild(p);
    }

    layout.appendChild(info);
    body.appendChild(layout);
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
    document.getElementById("modal-body").innerHTML = "";
  }

  document.getElementById("modal-close").addEventListener("click", closeModal);
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeModal();
  });

  /* ---------- lightbox (увеличение фото) ---------- */

  var lightbox = null;

  function openLightbox(src, alt) {
    if (!lightbox) {
      lightbox = el("div", "lightbox");
      lightbox.hidden = true;
      lightbox.appendChild(el("img"));
      lightbox.appendChild(el("div", "lightbox-hint", "клик или Esc — закрыть"));
      lightbox.addEventListener("click", closeLightbox);
      document.body.appendChild(lightbox);
    }
    var img = lightbox.querySelector("img");
    img.src = src;
    img.alt = alt || "";
    lightbox.hidden = false;
  }

  function closeLightbox() {
    if (lightbox) lightbox.hidden = true;
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (lightbox && !lightbox.hidden) { closeLightbox(); return; }
    if (!backdrop.hidden) closeModal();
  });

  /* ---------- main ---------- */

  function render() {
    var ev = getEvent(state.eventId);
    if (!ev) return;
    renderTabs();
    renderBadge(ev);
    renderFilters(ev);
    renderAddons(ev);
  }

  if (SITE_DATA.events.length) {
    state.eventId = SITE_DATA.events[0].id;
    renderStats();
    render();
  }
})();
