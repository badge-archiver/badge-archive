/* Юнит-прогон фасеточного движка без браузера: стабаем location/history */
globalThis.location = { search: "", hash: "", pathname: "/addons/" };
globalThis.history = {
  replaceState(state, title, url) {
    const u = new URL(url, "http://test.local" + globalThis.location.pathname + globalThis.location.search + globalThis.location.hash);
    globalThis.location.pathname = u.pathname;
    globalThis.location.search = u.search;
    globalThis.location.hash = u.hash;
  },
};

const { createFacetEngine, searchMatch } = await import("../src/assets/js/facets.js");

const config = {
  facets: [
    { field: "year", label: "Год", sort: "desc" },
    { field: "event", label: "Конференция", sort: "config" },
    { field: "category", label: "Категория", sort: "config" },
    { field: "manufacturer", label: "Изготовитель", sort: "alpha" },
    { field: "tags", label: "Теги", sort: "alpha" },
  ],
  events: { offzone: { label: "OFFZONE", order: 1 }, phdays: { label: "PHDays", order: 2 } },
  categories: { partner: { label: "Партнёрский", order: 1 }, soldering: { label: "Зона пайки", order: 2 } },
  rarities: {},
};

const items = [
  { name: "A", year: 2024, event: "offzone", category: "partner", manufacturer: "Т-Банк", tags: ["интерактив"] },
  { name: "B", year: 2024, event: "offzone", category: "partner", manufacturer: "Лаборатория Касперского", tags: [] },
  { name: "C", year: 2025, event: "offzone", category: "soldering", manufacturer: "Craft.Zone", tags: ["интерактив"] },
  { name: "D", year: 2024, event: "phdays", category: "soldering", manufacturer: "PT", tags: [] },
  { name: "E", year: 2023, event: "offzone", category: "soldering", rarity: undefined, manufacturer: "Craft.Zone", tags: ["раритет"] },
];

let failed = 0;
function eq(what, got, expected) {
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "FAIL"} ${what}: ${JSON.stringify(got)}${ok ? "" : " — ожидалось " + JSON.stringify(expected)}`);
}

const eng = createFacetEngine({ config, items, onChange: () => {} });

eq("все элементы", eng.filter().length, 5);
eq("год desc со счётчиками", eng.valuesFor("year").map((v) => `${v.value}:${v.count}`), ["2025:1", "2024:3", "2023:1"]);

eng.toggle("category", "partner");
eq("partner → счётчики годов пересчитались", eng.valuesFor("year").map((v) => `${v.value}:${v.count}`), ["2024:2"]);
eq("partner → остались A,B", eng.filter().map((i) => i.name), ["A", "B"]);
eq("partner → событие только offzone", eng.valuesFor("event").map((v) => `${v.value}:${v.count}`), ["offzone:2"]);
eq("partner → тег только интерактив:A", eng.valuesFor("tags").map((v) => `${v.value}:${v.count}`), ["интерактив:1"]);

eng.toggle("category", "partner");
eng.toggle("tags", "интерактив");
eq("тег интерактив → A,C", eng.filter().map((i) => i.name), ["A", "C"]);

eq("поиск по имени", searchMatch(items[0], "т-банк"), true);
eq("поиск по изготовителю", searchMatch(items[1], "Лаборатория Касперского"), true);
eq("поиск мимо", searchMatch(items[3], "т-банк"), false);

eng.clear();
eng.toggle("year", "2025");
eq("url после toggle", globalThis.location.search, "?year=2025");
eng.toggle("year", "2025");
eq("url после снятия", globalThis.location.search, "");

console.log(failed ? `\n${failed} провал(ов)` : "\nвсе проверки прошли");
process.exit(failed ? 1 : 0);
