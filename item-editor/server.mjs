/*
 * Локальный редактор карточек: отдаёт UI + API над badges/ и addons/.
 * Запуск из корня репы: node item-editor/server.mjs  →  http://localhost:4174
 * Ноль зависимостей. Пишет meta.json напрямую (2 пробела + перевод строки).
 */
import { createServer } from "node:http";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.argv[2] ?? 4174);

const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const KINDS = { badges: "badges", addons: "addons" };

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
};

/* ---------- данные ---------- */

async function readItems(kind) {
  const base = join(ROOT, kind);
  const out = [];
  for (const entry of await readdir(base, { withFileTypes: true })) {
    if (!entry.isDirectory() || !SLUG_RE.test(entry.name)) continue;
    const dir = join(base, entry.name);
    let meta;
    try {
      meta = JSON.parse(await readFile(join(dir, "meta.json"), "utf8"));
    } catch {
      meta = { name: "!! сломан meta.json", event: "", year: 0 }; // всё равно покажем в дереве
    }
    const files = await readdir(dir);
    out.push({
      slug: entry.name,
      photos: files.filter((f) => IMG_EXTS.has(extname(f).toLowerCase())).sort((a, b) => a.localeCompare(b, "en", { numeric: true })),
      ...meta,
    });
  }
  return out;
}

async function readData() {
  const [config, badges, addons] = await Promise.all([
    readFile(join(ROOT, "site.config.json"), "utf8").then(JSON.parse),
    readItems("badges"),
    readItems("addons"),
  ]);
  return { config, badges, addons };
}

/* ---------- API ---------- */

async function json(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

function send(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const path = decodeURIComponent(url.pathname);

  try {
    if (path === "/api/data" && req.method === "GET") {
      return send(res, 200, await readData());
    }

    const itemMatch = path.match(/^\/api\/item\/(badges|addons)\/([a-z0-9-]+)$/);
    if (itemMatch && req.method === "PUT") {
      const [, kind, slug] = itemMatch;
      const dir = normalize(join(ROOT, kind, slug));
      if (!dir.startsWith(join(ROOT, kind))) return send(res, 400, { error: "плохой путь" });
      const meta = await json(req);
      delete meta.slug;
      delete meta.photos; // служебные поля не пишем
      await writeFile(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
      return send(res, 200, { ok: true });
    }

    if (path === "/api/item" && req.method === "POST") {
      const { kind, slug, meta } = await json(req);
      if (!KINDS[kind]) return send(res, 400, { error: "kind должен быть badges/addons" });
      if (!SLUG_RE.test(slug ?? "")) return send(res, 400, { error: "слаг: строчная латиница/цифры/дефисы" });
      const dir = join(ROOT, kind, slug);
      try {
        await readdir(dir);
        return send(res, 409, { error: `папка ${kind}/${slug} уже существует` });
      } catch { /* не существует — то, что нужно */ }
      await mkdir(dir, { recursive: true });
      const clean = { ...meta };
      delete clean.slug;
      delete clean.photos;
      await writeFile(join(dir, "meta.json"), JSON.stringify(clean, null, 2) + "\n");
      return send(res, 200, { ok: true });
    }

    if (path === "/api/validate" && req.method === "POST") {
      /* гоняем реальную сборку с валидацией */
      const result = await new Promise((resolve) => {
        const child = spawn(process.execPath, [join(ROOT, "tools", "build.mjs")], {
          cwd: ROOT,
          shell: false,
        });
        let out = "";
        child.stdout.on("data", (d) => (out += d));
        child.stderr.on("data", (d) => (out += d));
        child.on("close", (code) => resolve({ ok: code === 0, output: out.slice(-4000) }));
      });
      return send(res, 200, result);
    }

    /* фото айтемов для превью в форме */
    const contentMatch = path.match(/^\/content\/(badges|addons)\/([a-z0-9-]+)\/([A-Za-z0-9._-]+)$/);
    if (contentMatch && req.method === "GET") {
      const [, kind, slug, file] = contentMatch;
      const full = normalize(join(ROOT, kind, slug, file));
      if (!full.startsWith(join(ROOT, kind))) return send(res, 403, { error: "плохой путь" });
      const body = await readFile(full);
      res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream" });
      return res.end(body);
    }

    /* статика редактора */
    let file = path === "/" ? "/index.html" : path;
    file = normalize(join(HERE, file));
    if (!file.startsWith(HERE)) return send(res, 403, { error: "forbidden" });
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream" });
    return res.end(body);
  } catch (e) {
    if (e.code === "ENOENT") return send(res, 404, { error: "не найдено: " + path });
    return send(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`редактор: http://localhost:${PORT}/`);
  console.log("пишет напрямую в badges/*/meta.json и addons/*/meta.json");
});
