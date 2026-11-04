/*
 * Локальный предпросмотр dist/ — как GitHub Pages, включая 404.html.
 * Ноль зависимостей. Запуск: node tools/preview.mjs [порт]
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));
const PORT = Number(process.argv[2] ?? 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary", ".woff2": "font/woff2", ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    // path traversal — по-простому, но надёжно: нормализуем и держим внутри dist
    let filePath = normalize(join(DIST, urlPath));
    if (!filePath.startsWith(DIST)) throw Object.assign(new Error("forbidden"), { code: "EACCES" });

    let body;
    try {
      body = await readFile(filePath);
    } catch {
      body = await readFile(join(DIST, "404.html")); // поведение gh-pages
      res.writeHead(404, { "content-type": MIME[".html"] });
      res.end(body);
      return;
    }
    res.writeHead(200, { "content-type": MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(403);
    res.end("forbidden");
  }
}).listen(PORT, () => {
  console.log(`превью: http://localhost:${PORT}/ (обслуживает dist/)`);
});
