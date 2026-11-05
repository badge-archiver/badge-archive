/* Логика редактора: дерево слева, форма справа, сохранение в meta.json */

const $ = (sel) => document.querySelector(sel);

const state = {
  data: null,        // { config, badges, addons }
  kind: null,
  slug: null,
  draft: null,       // редактируемая копия meta
  dirty: false,
};

/* раскрытость веток дерева: key ("badge:offzone" / "addon:2024") → boolean */
const treeOpen = new Map();

/* ---------- утилиты ---------- */

function toast(text, isErr = false) {
  const el = $("#toast");
  el.textContent = text;
  el.className = "toast show" + (isErr ? " err" : "");
  setTimeout(() => (el.className = "toast"), 2600);
}

const NUM_FIELDS = new Set(["year", "order"]);

function fieldFromInput(key, raw) {
  if (NUM_FIELDS.has(key)) return raw === "" ? undefined : Number(raw);
  if (key === "tags") return raw.split(",").map((t) => t.trim()).filter(Boolean);
  return raw === "" ? undefined : raw;
}

function inputFromField(key, value) {
  if (key === "tags") return Array.isArray(value) ? value.join(", ") : "";
  return value ?? "";
}

/* ---------- дерево ---------- */

function eventOrder(config) {
  return Object.entries(config.events)
    .sort(([, a], [, b]) => (a.order ?? 999) - (b.order ?? 999));
}

function renderTree() {
  const { config, badges, addons } = state.data;
  const q = $("#tree-filter").value.toLowerCase().trim();
  const forceOpen = Boolean(q); /* с фильтром раскрываем всё — иначе находки спрятаны в свёрнутых ветках */
  const tree = $("#tree");
  tree.replaceChildren();

  /* раскрытость веток переживает перерисовку: выбор пользователя в Map,
     дефолт — только когда пользователь ветку ещё не трогал */
  const branchOpen = (key, def) => (treeOpen.has(key) ? treeOpen.get(key) : def);
  const watchToggle = (details, key) =>
    details.addEventListener("toggle", () => {
      if (!q) treeOpen.set(key, details.open); /* служебное раскрытие фильтром — не выбор пользователя */
    });

  const leaf = (item, kind) => {
    if (q && !String(item.name ?? "").toLowerCase().includes(q) && !item.slug.includes(q)) return null;
    const b = document.createElement("button");
    b.className = "leaf" + (state.slug === item.slug && state.kind === kind ? " active" : "");
    b.textContent = item.name ?? item.slug;
    b.addEventListener("click", () => selectItem(kind, item.slug));
    return b;
  };

  /* БЕЙДЖИ: конференция → год */
  const badgesBranch = document.createElement("div");
  badgesBranch.className = "branch";
  badgesBranch.append(Object.assign(document.createElement("div"), { className: "group-label", textContent: "БЕЙДЖИ" }));
  for (const [key, def] of eventOrder(config)) {
    const items = badges.filter((b) => b.event === key).sort((a, b) => b.year - a.year);
    if (!items.length) continue;
    const details = document.createElement("details");
    const branchKey = "badge:" + key;
    details.open = forceOpen || branchOpen(branchKey, false); /* старт — всё свёрнуто */
    watchToggle(details, branchKey);
    const summary = document.createElement("summary");
    summary.textContent = `${def.label} · ${items.length}`;
    details.append(summary);
    for (const item of items) {
      const l = leaf(item, "badges");
      if (l) details.append(l);
    }
    badgesBranch.append(details);
  }
  tree.append(badgesBranch);

  /* АДДОНЫ: год → список */
  const addonsBranch = document.createElement("div");
  addonsBranch.className = "branch";
  addonsBranch.append(Object.assign(document.createElement("div"), { className: "group-label", textContent: "АДДОНЫ" }));
  const years = [...new Set(addons.map((a) => a.year))].sort((a, b) => b - a);
  for (const year of years) {
    const items = addons
      .filter((a) => a.year === year)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
    const details = document.createElement("details");
    const branchKey = "addon:" + year;
    details.open = forceOpen || branchOpen(branchKey, false); /* старт — всё свёрнуто */
    watchToggle(details, branchKey);
    const summary = document.createElement("summary");
    summary.textContent = `${year} · ${items.length}`;
    details.append(summary);
    for (const item of items) {
      const l = leaf(item, "addons");
      if (l) details.append(l);
    }
    addonsBranch.append(details);
  }
  tree.append(addonsBranch);
}

$("#tree-filter").addEventListener("input", renderTree);

/* ---------- панель подсказок: неповторяющиеся фразы поля из всего архива ---------- */

const SUGGEST_FIELDS = new Set(["rarityNote", "obtainedFor", "description"]);
const SUGGEST_LABELS = {
  rarityNote: "тираж / пояснение",
  obtainedFor: "за что выдавали",
  description: "описание",
};
let suggestEl = null;
let suggestField = null;

function suggestionsFor(key) {
  const list = state.kind === "badges" ? state.data.badges : state.data.addons;
  const counts = new Map();
  for (const it of list) {
    const v = it[key];
    if (typeof v === "string" && v.trim() && v !== state.draft?.[key]) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
    .slice(0, 30);
}

function renderSuggestions(key, inputEl) {
  suggestField = key;
  const panel = suggestEl;
  if (!panel) return;
  panel.replaceChildren();

  const title = document.createElement("p");
  title.className = "suggest-title";
  title.textContent = `частые формулировки · ${SUGGEST_LABELS[key]}`;
  panel.append(title);

  const items = suggestionsFor(key);
  if (!items.length) {
    const e = document.createElement("p");
    e.className = "suggest-empty";
    e.textContent = "// других формулировок нет";
    panel.append(e);
    return;
  }
  for (const [text, count] of items) {
    const b = document.createElement("button");
    b.className = "suggest-item";
    b.type = "button";
    const txt = document.createElement("span");
    txt.className = "txt";
    txt.textContent = text;
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = "×" + count;
    b.append(txt, n);
    b.title = text;
    b.addEventListener("mousedown", (e) => {
      /* mousedown, а не click: раньше blur — курсор и фокус поля не теряем */
      e.preventDefault();
      insertSuggestion(text, inputEl);
    });
    panel.append(b);
  }
}

function insertSuggestion(text, inputEl) {
  const start = inputEl.selectionStart ?? inputEl.value.length;
  const end = inputEl.selectionEnd ?? start;
  inputEl.value = inputEl.value.slice(0, start) + text + inputEl.value.slice(end);
  const pos = start + text.length;
  inputEl.setSelectionRange(pos, pos);
  inputEl.focus();
  inputEl.dispatchEvent(new Event("input", { bubbles: true }));
}

/* ---------- форма ---------- */

function selectItem(kind, slug) {
  if (state.dirty && !confirm("Есть несохранённые изменения — потерять их?")) return;
  state.kind = kind;
  state.slug = slug;
  const list = kind === "badges" ? state.data.badges : state.data.addons;
  const item = list.find((i) => i.slug === slug);
  if (!item) return;
  state.draft = { ...item };
  state.dirty = false;
  renderTree();
  renderForm();
}

function manufacturers() {
  return [...new Set(state.data.addons.map((a) => a.manufacturer).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ru"));
}

function field(key, label, { type = "text", full = false, list = null, hint = null } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "field" + (full ? " full" : "");
  const id = "f-" + key;
  const lab = document.createElement("label");
  lab.htmlFor = id;
  lab.textContent = label;
  const input = document.createElement(type === "textarea" ? "textarea" : "input");
  input.id = id;
  if (type !== "textarea") input.type = type;
  if (list) input.setAttribute("list", list);
  input.value = inputFromField(key, state.draft[key]);
  input.addEventListener("input", () => {
    state.draft[key] = fieldFromInput(key, input.value);
    markDirty();
  });
  if (SUGGEST_FIELDS.has(key)) {
    input.addEventListener("focus", () => renderSuggestions(key, input));
  }
  wrap.append(lab, input);
  if (hint) {
    const h = document.createElement("span");
    h.className = "hint";
    h.textContent = hint;
    wrap.append(h);
  }
  return wrap;
}

function select(key, label, dict, { full = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "field" + (full ? " full" : "");
  const id = "f-" + key;
  const lab = document.createElement("label");
  lab.htmlFor = id;
  lab.textContent = label;
  const sel = document.createElement("select");
  sel.id = id;

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "— не задано —";
  sel.append(empty);
  for (const [value, def] of Object.entries(dict).sort(([, a], [, b]) => (a.order ?? 999) - (b.order ?? 999))) {
    const o = document.createElement("option");
    o.value = value;
    o.textContent = def.label ?? value;
    sel.append(o);
  }
  sel.value = state.draft[key] ?? "";
  sel.addEventListener("change", () => {
    state.draft[key] = sel.value || undefined;
    markDirty();
  });
  wrap.append(lab, sel);
  return wrap;
}

function renderForm() {
  const host = $("#form-host");
  const { config } = state.data;
  const isBadge = state.kind === "badges";
  const draft = state.draft;

  host.replaceChildren();
  const main = document.createElement("div");
  main.className = "form-main";

  /* шапка формы */
  const head = document.createElement("div");
  head.className = "form-head";
  const kindEl = document.createElement("span");
  kindEl.className = "kind";
  kindEl.textContent = isBadge ? "БЕЙДЖ" : "АДДОН";
  const title = document.createElement("h2");
  title.textContent = draft.name ?? draft.slug;
  const slugEl = document.createElement("span");
  slugEl.className = "slug";
  slugEl.textContent = `${state.kind}/${draft.slug}`;
  head.append(kindEl, title, slugEl, dirtyBadge());
  main.append(head);

  /* превью фото */
  const photos = document.createElement("div");
  photos.className = "photos";
  if (draft.photos?.length) {
    for (const p of draft.photos.slice(0, 8)) {
      const img = document.createElement("img");
      img.src = `/content/${state.kind}/${draft.slug}/${p}`;
      img.alt = "";
      img.loading = "lazy";
      photos.append(img);
    }
    if (draft.photos.length > 8) {
      const more = document.createElement("span");
      more.className = "none";
      more.textContent = `+${draft.photos.length - 8}`;
      photos.append(more);
    }
  } else {
    const none = document.createElement("span");
    none.className = "none";
    none.textContent = "// фото в папку можно накидать мимо редактора";
    photos.append(none);
  }
  main.append(photos);

  /* поля */
  const grid = document.createElement("div");
  grid.className = "grid";

  grid.append(
    field("name", "Название *", { full: true }),
    select("event", "Конференция *", config.events),
    field("year", "Год *", { type: "number" }),
  );
  if (isBadge) {
    grid.append(field("location", "Город"));
  } else {
    grid.append(
      field("manufacturer", "Изготовитель", { list: "mfr-list" }),
      select("category", "Категория", config.categories),
      select("rarity", "Редкость", config.rarities),
      field("rarityNote", "Тираж / пояснение", { full: true }),
      field("obtainedFor", "За что выдавали", { full: true }),
    );
  }
  grid.append(
    field("description", "Описание (ссылки: голый URL или [подпись](url))", { type: "textarea", full: true }),
    field("tags", "Теги (через запятую)", { full: true, hint: "новые теги сами появятся в фильтрах сайта" }),
    field("source", "Источник (URL)"),
    field("schematic", "Исходники проекта (URL)"),
    field("model3d", "3D-модель (файл .glb в папке)"),
    field("cover", "Обложка (имя файла)"),
    field("order", "Порядок в секции", { type: "number" }),
    field("todo", "TODO (на сайте не видно)", { full: true }),
  );
  /* datalist изготовителей */
  const dl = document.createElement("datalist");
  dl.id = "mfr-list";
  for (const m of manufacturers()) {
    const o = document.createElement("option");
    o.value = m;
    dl.append(o);
  }
  main.append(grid, dl);

  /* панель подсказок справа: оживает при фокусе в тираж/за-что/описание */
  suggestEl = document.createElement("aside");
  suggestEl.className = "suggest-panel";
  suggestEl.append(hint0("подсказки формулировок", "// сфокусируй поле «тираж», «за что выдавали» или «описание»"));

  host.append(main, suggestEl);
  syncActions();
}

function hint0(title, text) {
  const box = document.createElement("div");
  const t = document.createElement("p");
  t.className = "suggest-title";
  t.textContent = title;
  const p = document.createElement("p");
  p.className = "suggest-empty";
  p.textContent = text;
  box.append(t, p);
  return box;
}

function dirtyBadge() {
  const el = document.createElement("span");
  el.className = state.dirty ? "dirty" : "saved";
  el.textContent = state.dirty ? "● не сохранено" : "✓ сохранено";
  return el;
}

function markDirty() {
  state.dirty = true;
  const head = $(".form-head");
  if (head) {
    const old = head.querySelector(".dirty, .saved");
    if (old) old.replaceWith(dirtyBadge());
  }
  syncActions();
}

/* кнопки сохранения живут в хедере — синхронизируем их состояние */
function syncActions() {
  const save = $("#btn-save");
  const revert = $("#btn-revert");
  if (!save) return;
  save.disabled = !state.dirty || !state.slug;
  revert.disabled = !state.dirty || !state.slug;
}

$("#btn-save").addEventListener("click", () => {
  if (state.dirty && state.slug) saveItem();
});
$("#btn-revert").addEventListener("click", () => {
  if (state.dirty && state.slug) selectItem(state.kind, state.slug);
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    if (state.dirty && state.slug) saveItem();
  }
});

/* ---------- сохранение ---------- */

async function refreshData() {
  state.data = await fetch("/api/data").then((r) => r.json());
  renderTree();
}

async function saveItem() {
  const payload = { ...state.draft };
  delete payload.slug;
  delete payload.photos;
  for (const key of Object.keys(payload)) {
    const v = payload[key];
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) delete payload[key];
  }
  if (!payload.name || !payload.event || !payload.year) {
    toast("name / event / year обязательны", true);
    return;
  }
  const r = await fetch(`/api/item/${state.kind}/${state.slug}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

  if (r.error) return toast(r.error, true);
  state.dirty = false;
  toast("meta.json записан");
  await refreshData();
  renderForm();
}

/* ---------- новый айтем ---------- */

const newDialog = $("#new-dialog");
$("#btn-new").addEventListener("click", () => {
  if (state.dirty && !confirm("Есть несохранённые изменения — потерять их?")) return;
  $("#new-slug").value = "";
  newDialog.showModal();
});
$("#new-cancel").addEventListener("click", () => newDialog.close());
$("#new-create").addEventListener("click", async () => {
  const kind = $("#new-kind").value;
  const slug = $("#new-slug").value.trim();
  const r = await fetch("/api/item", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind,
      slug,
      meta: { name: slug, event: "offzone", year: new Date().getFullYear() },
    }),
  }).then((r) => r.json());
  if (r.error) return toast(r.error, true);
  newDialog.close();
  toast("создан: " + slug);
  await refreshData();
  selectItem(kind, slug);
});

/* ---------- проверка сборкой ---------- */

const validateDialog = $("#validate-dialog");
$("#btn-validate").addEventListener("click", async () => {
  const out = $("#validate-out");
  out.textContent = "сборка идёт…";
  out.className = "";
  validateDialog.showModal();
  const r = await fetch("/api/validate", { method: "POST" }).then((r) => r.json());
  out.textContent = r.output || (r.ok ? "OK" : "сборка упала без вывода");
  out.className = r.ok ? "ok" : "err";
});
$("#validate-close").addEventListener("click", () => validateDialog.close());

/* ---------- запуск ---------- */

window.addEventListener("beforeunload", (e) => {
  if (state.dirty) e.preventDefault();
});

(async () => {
  await refreshData();
})();
