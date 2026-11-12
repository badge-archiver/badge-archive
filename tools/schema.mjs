/*
 * Единый контракт полей meta.json.
 * -------------------------------
 * build.mjs берёт отсюда ALLOWED (валидация), сервер редактора отдаёт схему
 * в /api/data и режет запись неизвестных полей, редактор строит форму по ней же.
 *
 * Раньше whitelist валидатора и набор полей формы жили по отдельности и молча
 * расходились: форма писала tags в бейдж, валидатор ныл про «неизвестное поле
 * manufacturer». Теперь расхождения быть не может: поля нет в схеме — его нет
 * ни в форме, ни в ALLOWED, и сервер его не запишет.
 *
 * Это данные, не код: порядок ключей в KIND_FIELDS = порядок полей в форме.
 * label/контролы нужны редактору, build они безразличны — но живут здесь,
 * чтобы описать поле один раз.
 */
export const FIELDS = {
  name: { label: "Название *", control: "text", full: true, required: true },
  event: { label: "Конференция *", control: "select", dict: "events", required: true },
  year: { label: "Год *", control: "number", required: true },
  manufacturer: { label: "Изготовитель", control: "text", list: "mfr" },
  location: { label: "Город", control: "text" },
  category: { label: "Категория", control: "select", dict: "categories" },
  rarity: { label: "Редкость", control: "select", dict: "rarities" },
  rarityNote: { label: "Тираж / пояснение", control: "text", full: true, suggest: true },
  obtainedFor: { label: "За что выдавали", control: "text", full: true, suggest: true },
  description: { label: "Описание", control: "textarea", full: true, suggest: true, hint: "ссылки: голый URL или [подпись](url)" },
  tags: { label: "Теги (через запятую)", control: "text", full: true, hint: "новые теги сами появятся в фильтрах сайта" },
  source: { label: "Источник (URL)", control: "text" },
  schematic: { label: "Исходники проекта (URL)", control: "text" },
  model3d: { label: "3D-модель (файл .glb в папке)", control: "text" },
  cover: { label: "Обложка (имя файла)", control: "text" },
  order: { label: "Порядок в секции", control: "number" },
  todo: { label: "TODO (на сайте не видно)", control: "text", full: true },
};

/* какие поля у какого типа айтема; ALLOWED в build.mjs = ровно это */
export const KIND_FIELDS = {
  badge: ["name", "event", "year", "manufacturer", "location", "description", "source", "schematic", "model3d", "cover", "order", "todo"],
  addon: ["name", "event", "year", "manufacturer", "category", "rarity", "rarityNote", "obtainedFor", "description", "tags", "source", "schematic", "model3d", "cover", "order", "todo"],
};

/* самопроверка: ключ без описания роняет build и сервер редактора сразу,
   а не оказывается «полем без лейбла» в UI посреди релиза */
for (const list of Object.values(KIND_FIELDS)) {
  for (const key of list) {
    if (!FIELDS[key]) throw new Error(`schema: поле "${key}" упомянуто в KIND_FIELDS, но не описано в FIELDS`);
  }
}
