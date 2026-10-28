/* Servidor de pruebas local: sirve public/ y la misma API con un almacén en memoria. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { handle } from "../shared/core.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../public");
const mem = new Map();
const store = {
  async list({ prefix }) { return { blobs: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key, etag: "x" })) }; },
  async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
  async setJSON(k, v) { mem.set(k, JSON.stringify(v)); },
  async delete(k) { mem.delete(k); },
};
/* CAJA_PASSWORD=prueba1234 AVISOS_TOKEN=una-llave-de-20-o-mas node dev/server.mjs */
const CFG = { usuario: process.env.CAJA_USUARIO || "caja", password: process.env.CAJA_PASSWORD || "prueba1234", avisos: process.env.AVISOS_TOKEN || "" };
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".json": "application/json", ".webmanifest": "application/manifest+json" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = await handle(new Request(url, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined }), store, CFG, req.socket.remoteAddress);
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(await r.text()); return;
  }
  let f = path.join(root, decodeURIComponent(url.pathname));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end("no"); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(Number(process.env.PORT || 8787), () => console.log("listo en http://localhost:" + (process.env.PORT || 8787)));
