/* Страница бейджей (она же корень сайта): конференция → год */
import { loadSite, h, plural, byOrderThenName, setFooterStats } from "../core.js";
import { createItemModal } from "../modal.js";
import { badgeCard, setOpenHandler } from "../cards.js";

export async function runBadgesPage(root) {
  const site = await loadSite(root);
  const { manifest, config } = site;
  const main = document.getElementById("content");
  main.replaceChildren();
  setFooterStats(manifest);

  /* модалка + хеш-роутинг */
  const items = new Map(manifest.badges.map((b) => [b.slug, b]));
  const modal = createItemModal({ site, kind: "badges", items });
  setOpenHandler((slug) => modal.open(slug));

  /* счётчик аддонов на пару (event, year) */
  const addonCounts = new Map();
  for (const a of manifest.addons) {
    const key = `${a.event}:${a.year}`;
    addonCounts.set(key, (addonCounts.get(key) ?? 0) + 1);
  }

  /* порядок мероприятий — из конфига */
  const eventOrder = Object.entries(config.events)
    .sort(([, a], [, b]) => (a.order ?? 999) - (b.order ?? 999))
    .map(([key, def]) => ({ key, def }));

  const wrap = h("div", { class: "wrap catalog-page" });

  for (const { key, def } of eventOrder) {
    const badges = manifest.badges
      .filter((b) => b.event === key)
      .sort((a, b) => b.year - a.year || byOrderThenName(a, b));
    if (!badges.length) continue;

    const addonsCount = badges.reduce((s, b) => s + (addonCounts.get(`${b.event}:${b.year}`) ?? 0), 0);
    const years = `${badges[badges.length - 1].year}–${badges[0].year}`;

    wrap.append(
      h("section", { class: "event-block", style: `--event-color:${def.color}` },
        h("h2", {}, def.label),
        h("p", { class: "ev-sub" },
          `${years} · ${badges.length} ${plural(badges.length, "бейдж", "бейджа", "бейджей")} · ${addonsCount} ${plural(addonsCount, "аддон", "аддона", "аддонов")}`),
        h("div", { class: "cards-grid" }, badges.map((b) => badgeCard(b, config, addonCounts))),
      ),
    );
  }

  main.append(wrap);
  modal.sync(); // глубокая ссылка /#slug
}
