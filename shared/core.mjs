/* Lógica de pedidos compartida por la función de Netlify y el servidor de pruebas.
   El servidor recalcula todo con este catálogo: el precio que manda el teléfono del cliente no se usa. */

const N = {
  carne: "Carne", queso: "Queso amarillo", jamon: "Jamón", salchicha: "Salchicha", tocino: "Tocino", pina: "Piña asada",
  lechuga: "Lechuga", jitomate: "Jitomate", cebolla: "Cebolla", chile: "Chile en vinagre", catsup: "Catsup", mostaza: "Mostaza",
  hd_salchicha: "Salchicha", hd_salchicha_tocino: "Salchicha con tocino", hd_jitomate: "Jitomate", hd_cebolla: "Cebolla", hd_catsup: "Catsup", hd_mostaza: "Mostaza",
  sp_papas: "Papas", salchipulpo: "Salchipulpos", sp_queso: "Queso de nachos", sp_catsup: "Catsup", sp_valentina: "Valentina",
  alitas: "Alitas", alitas_lechuga: "Cama de lechuga", zanahoria: "Zanahoria", pepino: "Pepino", jicama: "Jícama", ranch: "Ranch",
};
const VEG = ["lechuga", "jitomate", "cebolla", "chile", "catsup", "mostaza"];
const WINGS = ["alitas", "alitas_lechuga", "zanahoria", "pepino", "jicama", "ranch"];
const burger = (meats, price) => ({ recipe: [...meats, ...VEG], fixed: ["carne"], opts: [["Con papas", price], ["Sin papas", price - 10]] });
/* bebida: sin ingredientes que quitar; una opción por tamaño. Ej.: bebida("Refresco", [["600 ml", 25]]) */
const bebida = (name, opts) => ({ name, recipe: [], fixed: [], opts, drink: true });

export const CATALOG = {
  sencilla: { name: "Sencilla", ...burger(["carne", "queso"], 60) },
  hawaiana: { name: "Hawaiana", ...burger(["carne", "queso", "jamon", "pina"], 70) },
  bbq: { name: "BBQ", ...burger(["carne", "queso", "jamon", "tocino"], 70) },
  loba: { name: "Loba", ...burger(["carne", "queso", "jamon", "salchicha"], 80) },
  monstruo: { name: "Monstruo", ...burger(["carne", "carne", "queso", "jamon", "salchicha", "tocino", "pina"], 90) },
  hotdog: { name: "Hotdog sencillo", recipe: ["hd_salchicha", "hd_jitomate", "hd_cebolla", "hd_catsup", "hd_mostaza"], fixed: ["hd_salchicha"], opts: [["1 hotdog", 20], ["3 hotdogs", 40]] },
  "hotdog-tocino": { name: "Hotdog con tocino", recipe: ["hd_salchicha_tocino", "hd_jitomate", "hd_cebolla", "hd_catsup", "hd_mostaza"], fixed: ["hd_salchicha_tocino"], opts: [["1 hotdog", 25], ["3 hotdogs", 50]] },
  salchipulpos: { name: "Salchipulpos", recipe: ["sp_papas", "salchipulpo", "sp_queso", "sp_catsup", "sp_valentina"], fixed: ["sp_papas", "salchipulpo"], opts: [["Chico (4 pulpos)", 40], ["Grande (6 pulpos)", 60]] },
  papas: { name: "Orden de papas", recipe: ["sp_papas"], fixed: ["sp_papas"], opts: [["Chica", 30], ["Grande", 50]] },
  alitas: { name: "Alitas", recipe: WINGS, fixed: ["alitas"], opts: [["Orden de 10", 110], ["Media orden (5)", 60]], sauces: true },
  "alitas-mixto": { name: "Combo mixto de alitas", recipe: WINGS, fixed: ["alitas"], opts: [["10 alitas (2 de cada sabor)", 110], ["Medio combo (1 de cada sabor)", 60]] },
  /* bebidas: agregarlas aquí, en el menú (MENU.drinks) y en la caja (PRODUCTS, cat "drinks") con el mismo id */
};
export const SAUCES = {
  "receta-secreta": "Receta secreta sin salsa", "pina-habanero": "Piña habanero", "mango-habanero": "Mango habanero",
  "tamarindo-picante": "Tamarindo picante", "bbq-picante": "BBQ picante", "bbq-dulce": "BBQ dulce",
};
export const ESTADOS = ["nuevo", "aceptado", "listo", "entregado", "rechazado"];
const MODES = { domicilio: "A domicilio", recoger: "Pasa a recoger" };
const PAYS = { efectivo: "Efectivo", transferencia: "Transferencia" };
const TICKETS = { no: "Sin ticket", correo: "Ticket por correo", pdf: "Ticket en PDF (lo descargó el cliente)" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

/* Revisa el pedido que llega del menú y lo deja listo para la caja. Lanza Error con un mensaje para el cliente. */
export function normalizeOrder(body) {
  if (!body || typeof body !== "object") throw new Error("El pedido llegó vacío.");
  const items = Array.isArray(body.items) ? body.items.slice(0, 40) : [];
  if (!items.length) throw new Error("El pedido no tiene productos.");
  const lines = items.map((it) => {
    const p = CATALOG[it && it.id];
    if (!p) throw new Error("Hay un producto que ya no está en el menú.");
    const opt = Number(it.opt) || 0;
    if (!p.opts[opt]) throw new Error("Hay una opción que ya no existe.");
    const qty = Math.max(1, Math.min(30, Math.floor(Number(it.qty) || 1)));
    const off = [...new Set((Array.isArray(it.off) ? it.off : []).filter((x) => p.recipe.includes(x) && !p.fixed.includes(x)))];
    let sauces = [];
    if (p.sauces) {
      sauces = [...new Set((Array.isArray(it.sauces) ? it.sauces : []).filter((s) => SAUCES[s]))].slice(0, 2);
      if (!sauces.length) sauces = ["receta-secreta"];
    }
    const counts = {};
    p.recipe.forEach((x) => { if (!off.includes(x)) counts[x] = (counts[x] || 0) + 1; });
    return {
      pid: it.id, name: p.name, opt, optLabel: p.opts.length > 1 ? p.opts[opt][0] : "", qty, price: p.opts[opt][1],
      sauces: sauces.map((s) => SAUCES[s]),
      sin: off.map((x) => N[x]),
      lleva: Object.keys(counts).map((x) => N[x] + (counts[x] > 1 ? " ×" + counts[x] : "")),
    };
  });
  const c = body.cliente || {};
  const mode = MODES[c.mode] ? c.mode : "domicilio";
  const cliente = {
    nombre: str(c.name, 60), telefono: str(c.phone, 20).replace(/[^\d+ ]/g, ""), entrega: mode, entregaLabel: MODES[mode],
    direccion: mode === "domicilio" ? str(c.addr, 200) : "", referencias: mode === "domicilio" ? str(c.refs, 160) : "",
    pago: PAYS[c.pay] ? c.pay : "efectivo", pagaCon: Math.max(0, Math.floor(Number(String(c.cash || "").replace(/[^\d.]/g, "")) || 0)),
    notas: str(c.notes, 300),
    ticket: TICKETS[c.ticket] ? c.ticket : "no",
  };
  cliente.ticketLabel = TICKETS[cliente.ticket];
  cliente.email = cliente.ticket === "correo" ? str(c.email, 120) : "";
  if (cliente.ticket === "correo" && !EMAIL.test(cliente.email)) throw new Error("Falta un correo válido para el ticket.");
  if (!cliente.nombre) throw new Error("Falta el nombre.");
  if (cliente.telefono.replace(/\D/g, "").length < 10) throw new Error("Falta un teléfono de 10 dígitos.");
  if (mode === "domicilio" && !cliente.direccion) throw new Error("Falta la dirección.");
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return { lines, cliente, total };
}

/* Fecha del negocio (hora del centro de México) para agrupar las claves por día */
export function diaMX(date = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return p; // AAAA-MM-DD
}

/* Operaciones sobre un almacén con la forma de Netlify Blobs (setJSON, get, list) */
export async function crearPedido(store, body, now = new Date()) {
  const o = normalizeOrder(body);
  const dia = diaMX(now);
  const { blobs } = await store.list({ prefix: `dia/${dia}/` });
  const folio = blobs.length + 1;
  const key = `dia/${dia}/${String(now.getTime()).padStart(14, "0")}-${Math.random().toString(36).slice(2, 7)}`;
  const pedido = { key, folio, creado: now.toISOString(), estado: "nuevo", historial: [{ estado: "nuevo", t: now.toISOString() }], ...o };
  await store.setJSON(key, pedido);
  return pedido;
}

export async function listarPedidos(store, desdeISO, now = new Date()) {
  const desde = desdeISO ? new Date(desdeISO) : new Date(now.getTime() - 18 * 3600e3);
  const dias = new Set([diaMX(desde), diaMX(now)]);
  const keys = [];
  for (const d of dias) {
    const { blobs } = await store.list({ prefix: `dia/${d}/` });
    blobs.forEach((b) => keys.push(b.key));
  }
  const out = [];
  for (const k of keys) {
    const ts = Number(k.split("/")[2].split("-")[0]);
    if (ts < desde.getTime()) continue;
    const p = await store.get(k, { type: "json" });
    if (p) out.push(p);
  }
  return out.sort((a, b) => (a.creado < b.creado ? -1 : 1));
}

export async function cambiarEstado(store, key, estado, extra = {}, now = new Date()) {
  if (!ESTADOS.includes(estado)) throw new Error("Estado no válido.");
  if (typeof key !== "string" || !key.startsWith("dia/")) throw new Error("Pedido no válido.");
  const p = await store.get(key, { type: "json" });
  if (!p) throw new Error("No encontré ese pedido.");
  p.estado = estado;
  p.historial = (p.historial || []).concat([{ estado, t: now.toISOString() }]);
  if (extra.ventaFolio) p.ventaFolio = Number(extra.ventaFolio) || null;
  await store.setJSON(key, p);
  return p;
}

/* Un pedido por minuto desde la misma conexión. Se guarda un resumen (hash) de la IP, no la IP. */
export const ESPERA_MS = 60e3;
async function claveIP(ip) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("carboncito:" + ip));
  return "limite/" + [...new Uint8Array(h)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* Maneja la petición HTTP; lo usan Netlify y el servidor local */
export async function handle(req, store, pin, ip = "") {
  const url = new URL(req.url);
  const json = (data, status = 200) => new Response(JSON.stringify(data), {
    status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
  const okPin = () => pin && req.headers.get("x-caja-pin") === pin;
  try {
    if (req.method === "POST" && url.pathname === "/api/pedidos") {
      const len = Number(req.headers.get("content-length") || 0);
      if (len > 20000) return json({ error: "El pedido es demasiado grande." }, 413);
      const body = await req.json().catch(() => null);
      if (body && body.website) return json({ ok: true, folio: 0 }); /* trampa para robots */
      normalizeOrder(body); /* un pedido con errores no cuenta para la espera */
      const lim = ip ? await claveIP(ip) : "";
      if (lim) {
        const prev = await store.get(lim, { type: "json" });
        const falta = prev ? ESPERA_MS - (Date.now() - prev.t) : 0;
        if (falta > 0) {
          const s = Math.ceil(falta / 1000);
          return json({ error: `Ya recibimos un pedido tuyo. Espera ${s} segundos para mandar otro.`, espera: s }, 429);
        }
      }
      const p = await crearPedido(store, body);
      if (lim) await store.setJSON(lim, { t: Date.now() });
      return json({ ok: true, folio: p.folio, total: p.total });
    }
    if (!pin) return json({ error: "Falta configurar CAJA_PIN en Netlify." }, 500);
    if (!okPin()) return json({ error: "PIN incorrecto." }, 401);
    if (req.method === "GET" && url.pathname === "/api/pedidos") {
      return json({ ok: true, ahora: new Date().toISOString(), pedidos: await listarPedidos(store, url.searchParams.get("desde")) });
    }
    if (req.method === "POST" && url.pathname === "/api/pedidos/estado") {
      const b = await req.json().catch(() => ({}));
      return json({ ok: true, pedido: await cambiarEstado(store, b.key, b.estado, b) });
    }
    return json({ error: "No encontrado." }, 404);
  } catch (e) {
    return json({ error: e.message || "Error" }, 400);
  }
}
