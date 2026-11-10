/* Servidor local que imita Cloudflare: pasa cada petición por cloudflare/worker.mjs con D1 sobre SQLite (dev/d1-local.mjs).
   node dev/cloudflare.mjs  (puerto 8789; CAJA_PASSWORD por defecto prueba1234; D1_ARCHIVO para guardar entre corridas) */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../cloudflare/worker.mjs";
import { d1Local } from "./d1-local.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const ASSETS = {
  async fetch(req) {
    let f = path.join(root, decodeURIComponent(new URL(req.url).pathname));
    if (!f.startsWith(root)) return new Response("", { status: 403 });
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) return new Response("no", { status: 404 });
    return new Response(fs.readFileSync(f), { headers: { "content-type": types[path.extname(f)] || "application/octet-stream" } });
  },
};
const env = { DB: d1Local(process.env.D1_ARCHIVO || ":memory:"), ASSETS, CAJA_USUARIO: "caja", CAJA_PASSWORD: process.env.CAJA_PASSWORD || "prueba1234", VAPID_PUBLIC: process.env.VAPID_PUBLIC || "", VAPID_PRIVATE: process.env.VAPID_PRIVATE || "" };
const port = Number(process.env.PORT || 8789);

http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const headers = Object.assign({}, req.headers, { "cf-connecting-ip": req.socket.remoteAddress });
  const r = await worker.fetch(new Request(new URL(req.url, "http://localhost:" + port), { method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, () => console.log("como Cloudflare en http://localhost:" + port));
