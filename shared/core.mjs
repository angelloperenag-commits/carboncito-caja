/* Lógica de pedidos compartida por la función de Netlify y el servidor de pruebas.
   El servidor recalcula todo con este catálogo: el precio que manda el teléfono del cliente no se usa. */

/* Ingredientes. Lo que no está en "fixed" se puede pedir "sin" (no hay extras con costo). */
const N = {
  carne: "Carne", queso: "Queso amarillo", jamon: "Jamón", salchicha: "Salchicha", tocino: "Tocino", pina: "Piña asada",
  lechuga: "Lechuga", jitomate: "Jitomate", cebolla: "Cebolla", chile: "Chile en vinagre", catsup: "Catsup", mostaza: "Mostaza",
  hd_salchicha: "Salchicha", hd_salchicha_tocino: "Salchicha con tocino", hd_jitomate: "Jitomate", hd_cebolla: "Cebolla", hd_catsup: "Catsup", hd_mostaza: "Mostaza", hd_chile: "Chiles",
  sp_papas: "Papas", salchipulpo: "Salchipulpos", sp_queso: "Queso de nachos", sp_catsup: "Catsup", sp_valentina: "Valentina",
  alitas: "Alitas", ranch: "Ranch",
};
const VEG = ["lechuga", "jitomate", "cebolla", "chile", "catsup", "mostaza"];
const HD = ["hd_jitomate", "hd_cebolla", "hd_catsup", "hd_mostaza", "hd_chile"];
/* las verduras de las alitas no siempre van, así que no se anuncian ni se pueden quitar: solo el ranch */
const WINGS = ["alitas", "ranch"];
const burger = (meats, price) => ({ recipe: [...meats, ...VEG], fixed: ["carne"], opts: [["Con papas", price], ["Sin papas", price - 10]] });
/* bebida: sin ingredientes que quitar; una opción por presentación, con su precio.
   Ej.: "refresco": bebida("Refresco", [["600 ml", 25]]). disponible: false la saca de la venta. */
const bebida = (name, opts, extra) => Object.assign({ name, recipe: [], fixed: [], opts, drink: true, disponible: true }, extra);
/* combo: precio fijo y partes. Cada parte toma de su producto (pid) las salsas y lo que se puede quitar.
   unSabor: la parte lleva exactamente un sabor. pend: algo por confirmar. repetidos: null = falta confirmar.
   Queda en borrador (no se vende) mientras falte el precio, haya un pend o falte decidir repetidos. */
const part = (pid, label, extra) => Object.assign({ pid, label }, extra);
const combo = (name, price, parts, extra) => {
  const c = Object.assign({ name, recipe: [], fixed: [], opts: [["Combo", price]], parts }, extra);
  c.draft = price == null || parts.some((x) => x.pend) || (parts.some((x) => x.unSabor) && typeof c.repetidos !== "boolean");
  return c;
};
/* refrescos de 600 ml que se pueden elegir en un combo */
const JARRITOS = ["jarritos-uva", "jarritos-pina", "jarritos-manzana", "jarritos-limon", "jarritos-tamarindo"];

export const CATALOG = {
  sencilla: { name: "Sencilla", ...burger(["carne", "queso"], 60) },
  hawaiana: { name: "Hawaiana", ...burger(["carne", "queso", "jamon", "pina"], 70) },
  bbq: { name: "BBQ", ...burger(["carne", "queso", "jamon", "tocino"], 70) },
  loba: { name: "Loba", ...burger(["carne", "queso", "jamon", "salchicha"], 80) },
  monstruo: { name: "Monstruo", ...burger(["carne", "carne", "queso", "jamon", "salchicha", "tocino", "pina"], 90) },
  hotdog: { name: "Hotdog sencillo", recipe: ["hd_salchicha", ...HD], fixed: ["hd_salchicha"], opts: [["1 hotdog", 20], ["3 hotdogs", 40]] },
  "hotdog-tocino": { name: "Hotdog con tocino", recipe: ["hd_salchicha_tocino", ...HD], fixed: ["hd_salchicha_tocino"], opts: [["1 hotdog", 25], ["3 hotdogs", 50]] },
  salchipulpos: { name: "Salchipulpos", recipe: ["sp_papas", "salchipulpo", "sp_queso", "sp_catsup", "sp_valentina"], fixed: ["sp_papas", "salchipulpo"], opts: [["Chico (4 pulpos)", 40], ["Grande (6 pulpos)", 60]] },
  papas: { name: "Orden de papas", recipe: ["sp_papas", "sp_queso", "sp_catsup", "sp_valentina"], fixed: ["sp_papas"], opts: [["Chica", 30], ["Grande", 50]] },
  alitas: { name: "Alitas", recipe: WINGS, fixed: ["alitas"], opts: [["Orden de 10", 110], ["Media orden (5)", 60]], piezas: [10, 5], sauces: true },
  "alitas-mixto": { name: "Combo mixto de alitas", recipe: WINGS, fixed: ["alitas"], opts: [["10 alitas (2 de cada sabor)", 110], ["Medio combo (1 de cada sabor)", 60]] },
  /* combos (mismos ids y partes en el menú y en la caja) */
  "combo-carboncito": combo("CARBONCITO", 100, [
    part("sencilla", "Hamburguesa sencilla con papas"), part("alitas", "4 alitas", { piezas: 4 }),
    part(null, "Refresco de 600 ml", { opciones: JARRITOS }),
  ]),
  "combo-rico": combo("Combo rico", 200, [
    part("hawaiana", "Hamburguesa hawaiana (sin papas)"), part("alitas", "Alitas (orden de 10)"),
    part("salchipulpos", "Salchipulpos chicos (4 pulpos)"), part("hotdog", "Hotdogs sencillos (orden de 3)"),
  ]),
  "combo-domi": combo("Domi combo", 300, [
    part("hawaiana", "Hamburguesa hawaiana 1 (sin papas)"), part("hawaiana", "Hamburguesa hawaiana 2 (sin papas)"),
    part("alitas", "Alitas (orden de 10)"), part("salchipulpos", "Salchipulpos grandes (6 pulpos)"),
    part("hotdog", "Hotdogs sencillos (orden de 3)"),
  ]),
  "medio-alicombo": combo("1/2 Alicombo", 150, [
    part("alitas", "Media orden 1", { unSabor: true, opt: 1 }), part("alitas", "Media orden 2", { unSabor: true, opt: 1 }), part("alitas", "Media orden 3", { unSabor: true, opt: 1 }),
  ], { repetidos: true }),
  /* Alicombo: 6 medias órdenes, una de cada sabor (el sabor ya viene puesto, no se elige). Es otro producto que el 1/2 Alicombo. */
  alicombo: combo("Alicombo", 300, [
    ["receta-secreta", "natural"], ["mango-habanero", "mango habanero"], ["pina-habanero", "piña habanero"],
    ["tamarindo-picante", "tamarindo picante"], ["bbq-picante", "BBQ picante"], ["bbq-dulce", "BBQ dulce"],
  ].map(([sabor, txt]) => part("alitas", "1/2 " + txt, { opt: 1, sabor })), { desc: "1/2 natural, 1/2 mango habanero, 1/2 piña habanero, 1/2 tamarindo picante, 1/2 BBQ picante y 1/2 BBQ dulce." }),
  /* bebidas (mismos ids en el menú y en la caja). La cerveza es solo de la caja: no está aquí. */
  "jarritos-uva": bebida("Jarritos Uva", [["600 ml", 25]]),
  "jarritos-pina": bebida("Jarritos Piña", [["600 ml", 25]]),
  "jarritos-manzana": bebida("Jarritos Manzana", [["600 ml", 25]]),
  "jarritos-limon": bebida("Jarritos Limón", [["600 ml", 25]]),
  "jarritos-tamarindo": bebida("Jarritos Tamarindo", [["600 ml", 25]]),
  "coca-cola": bebida("Coca-Cola de vidrio", [["500 ml", 25]]),
};
/* se puede vender: no es borrador, está disponible y todas sus opciones tienen precio */
export const sellable = (p) => !!p && !p.draft && p.disponible !== false && p.opts.every((o) => typeof o[1] === "number");
export const SAUCES = {
  "receta-secreta": "Receta secreta sin salsa", "pina-habanero": "Piña habanero", "mango-habanero": "Mango habanero",
  "tamarindo-picante": "Tamarindo picante", "bbq-picante": "BBQ picante", "bbq-dulce": "BBQ dulce",
};
const MODES = { domicilio: "A domicilio", recoger: "Pasa a recoger" };
const PAYS = { efectivo: "Efectivo", transferencia: "Transferencia" };
const TICKETS = { no: "Sin ticket", correo: "Ticket por correo", pdf: "Ticket en PDF (lo descargó el cliente)" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* solo claves propias: "constructor" o "__proto__" no cuentan como sabor, producto ni opción */
const own = (o, k) => typeof k === "string" && Object.prototype.hasOwnProperty.call(o, k);
const str = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

/* salsas de unas alitas en pedidos de antes: hasta dos (mitad y mitad); si no eligió, la receta secreta */
function salsas(list) {
  const s = [...new Set((Array.isArray(list) ? list : []).filter((x) => own(SAUCES, x)))].slice(0, 2);
  return s.length ? s : ["receta-secreta"];
}
/* Cuántas alitas de cada sabor: { sabor: cuántas }, y deben sumar exactamente n.
   Si el pedido no trae "sabores" (menú viejo en caché), se reparten entre sus 1 o 2 salsas. */
function repartir(sabores, n, viejas, nombre) {
  const m = {};
  if (sabores && typeof sabores === "object" && !Array.isArray(sabores)) {
    for (const [k, v] of Object.entries(sabores)) {
      const c = Number(v);   /* solo enteros: 2.5 alitas no existe */
      if (own(SAUCES, k) && Number.isInteger(c) && c > 0 && c <= 10) m[k] = (m[k] || 0) + c;
    }
  } else {
    const s = salsas(viejas);
    s.forEach((k, i) => { m[k] = Math.floor(n / s.length) + (i < n % s.length ? 1 : 0); });
  }
  const total = Object.values(m).reduce((a, b) => a + b, 0);
  if (total !== n) throw new Error(`Elige el sabor de las ${n} alitas de ${nombre}: llevas ${total}.`);
  return m;
}
/* texto para la cocina: "BBQ dulce" si todas son de un sabor; si no, "6 × BBQ dulce", "4 × Mango habanero" */
const alasTexto = (m) => {
  const e = Object.entries(m);
  return e.length === 1 ? [SAUCES[e[0][0]]] : e.map(([k, c]) => `${c} × ${SAUCES[k]}`);
};
/* alitas que lleva una parte de combo: las que diga (piezas) o la orden (10) o media (5) */
const piezasParte = (c) => c.piezas || (c.opt === 1 ? 5 : 10);
/* lo elegido en cada parte de un combo, revisado contra el producto de esa parte */
function componentes(p, combo, cat) {
  const elegido = Array.isArray(combo) ? combo : [];
  if (elegido.length !== p.parts.length) throw new Error(`Falta personalizar tu ${p.name}.`);
  const out = p.parts.map((c, i) => {
    const r = c.pid && own(cat, c.pid) ? cat[c.pid] : null, e = elegido[i] || {};
    const off = r ? [...new Set((Array.isArray(e.off) ? e.off : []).filter((x) => r.recipe.includes(x) && !r.fixed.includes(x)))] : [];
    let s = [];
    if (r && r.sauces) {
      if (c.sabor) s = [c.sabor];   /* sabor fijo (Alicombo): no se elige */
      else if (c.unSabor) {
        s = (Array.isArray(e.sauces) ? e.sauces : []).filter((x) => own(SAUCES, x)).slice(0, 1);
        if (!s.length) throw new Error(`Elige el sabor de: ${c.label}.`);
      } else s = null;
    }
    /* parte con opciones (el refresco del combo): una, de la lista */
    let opcion = "";
    if (c.opciones) {
      if (!c.opciones.includes(e.opcion) || !own(cat, e.opcion) || !sellable(cat[e.opcion])) throw new Error(`Elige: ${c.label}.`);
      opcion = cat[e.opcion].name;
    }
    const textoSalsas = s === null ? alasTexto(repartir(e.sabores, piezasParte(c), e.sauces, `tu ${p.name} (${c.label})`)) : s.map((x) => SAUCES[x]);
    return { label: c.label, sauces: textoSalsas, sin: off.map((x) => N[x]), opcion, unSabor: !!c.unSabor };
  });
  const unos = out.filter((x) => x.unSabor).map((x) => x.sauces[0]);
  if (p.repetidos === false && new Set(unos).size !== unos.length) throw new Error(`En el ${p.name} los sabores no se repiten.`);
  return out.map(({ label, sauces, sin, opcion }) => ({ label, sauces, sin, opcion }));
}

/* Ubicación de entrega: coordenadas que el cliente confirmó (dentro de México) y, si pegó uno, un enlace de Google Maps.
   El enlace solo se guarda para que la caja lo abra; el servidor nunca lo visita. */
const MAPAS = ["maps.app.goo.gl", "goo.gl", "maps.google.com", "www.google.com", "google.com", "www.google.com.mx", "google.com.mx"];
function ubicacion(c) {
  const lat = Number(c.lat), lng = Number(c.lng);
  const coords = c.lat != null && c.lng != null && Number.isFinite(lat) && Number.isFinite(lng) && lat > 14 && lat < 33 && lng > -118.5 && lng < -86
    ? { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 } : null;
  let mapa = "";
  try {
    const u = new URL(str(c.mapa, 400));
    if (u.protocol === "https:" && MAPAS.includes(u.hostname) && (u.hostname.includes("goo.gl") || u.pathname.startsWith("/maps"))) mapa = u.href;
  } catch (e) { mapa = ""; }
  return { coords, mapa };
}

/* Revisa el pedido que llega del menú y lo deja listo para la caja. Lanza Error con un mensaje para el cliente.
   cat: catálogo con los precios y la disponibilidad vigentes (los que se cambian en la caja). */
export function normalizeOrder(body, cat = CATALOG) {
  if (!body || typeof body !== "object") throw new Error("El pedido llegó vacío.");
  const items = Array.isArray(body.items) ? body.items.slice(0, 40) : [];
  if (!items.length) throw new Error("El pedido no tiene productos.");
  const lines = items.map((it) => {
    const p = it && own(cat, it.id) ? cat[it.id] : null;
    if (!p) throw new Error("Hay un producto que ya no está en el menú.");
    if (!sellable(p)) throw new Error(`${p.name} no está disponible ahorita.`);
    const opt = Number(it.opt) || 0;
    if (!p.opts[opt]) throw new Error("Hay una opción que ya no existe.");
    const qty = Math.max(1, Math.min(30, Math.floor(Number(it.qty) || 1)));
    const off = [...new Set((Array.isArray(it.off) ? it.off : []).filter((x) => p.recipe.includes(x) && !p.fixed.includes(x)))];
    const sauces = p.sauces ? alasTexto(repartir(it.sabores, p.piezas[opt], it.sauces, "tu orden")) : [];
    const counts = {};
    p.recipe.forEach((x) => { if (!off.includes(x)) counts[x] = (counts[x] || 0) + 1; });
    /* se guarda una copia del nombre y del precio: si después cambian en el catálogo, este pedido no cambia */
    return {
      pid: it.id, name: p.name, opt, optLabel: p.opts.length > 1 ? p.opts[opt][0] : "", qty, price: p.opts[opt][1],
      sauces,
      sin: off.map((x) => N[x]),
      lleva: Object.keys(counts).map((x) => N[x] + (counts[x] > 1 ? " ×" + counts[x] : "")),
      componentes: p.parts ? componentes(p, it.combo, cat) : [],
    };
  });
  const c = body.cliente || {};
  const mode = own(MODES, c.mode) ? c.mode : "domicilio";
  const u = mode === "domicilio" ? ubicacion(c) : { coords: null, mapa: "" };
  const cliente = {
    nombre: str(c.name, 60), telefono: str(c.phone, 20).replace(/[^\d+ ]/g, ""), entrega: mode, entregaLabel: MODES[mode],
    direccion: mode === "domicilio" ? str(c.addr, 200) : "", referencias: mode === "domicilio" ? str(c.refs, 160) : "",
    ubicacion: u.coords, mapa: u.mapa,
    pago: own(PAYS, c.pay) ? c.pay : "efectivo", pagaCon: Math.max(0, Math.floor(Number(String(c.cash || "").replace(/[^\d.]/g, "")) || 0)),
    notas: str(c.notes, 300),
    ticket: own(TICKETS, c.ticket) ? c.ticket : "no",
  };
  cliente.ticketLabel = TICKETS[cliente.ticket];
  cliente.email = cliente.ticket === "correo" ? str(c.email, 120) : "";
  if (cliente.ticket === "correo" && !EMAIL.test(cliente.email)) throw new Error("Falta un correo válido para el ticket.");
  if (!cliente.nombre) throw new Error("Falta el nombre.");
  if (cliente.telefono.replace(/\D/g, "").length < 10) throw new Error("Falta un teléfono de 10 dígitos.");
  if (mode === "domicilio" && !cliente.direccion && !cliente.ubicacion && !cliente.mapa) throw new Error("Falta la dirección.");
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return { lines, cliente, total };
}

/* Fecha del negocio (hora del centro de México) para agrupar las claves por día */
export function diaMX(date = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return p; // AAAA-MM-DD
}

/* Operaciones sobre un almacén con la forma de Netlify Blobs (setJSON, get, list, delete) */
export async function crearPedido(store, body, now = new Date(), cat = CATALOG, invitado = "") {
  const o = normalizeOrder(body, cat);
  const dia = diaMX(now);
  const { blobs } = await store.list({ prefix: `dia/${dia}/` });
  const folio = blobs.length + 1;
  const id = `${String(now.getTime()).padStart(14, "0")}-${Math.random().toString(36).slice(2, 7)}`;
  const key = `dia/${dia}/${id}`;
  const pedido = { key, folio, creado: now.toISOString(), estado: "nuevo", historial: [{ estado: "nuevo", t: now.toISOString() }], invitado, ...o };
  await store.setJSON(key, pedido);
  if (invitado) await store.setJSON(`invitado/${invitado}/${id}`, { key });
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
    if (p) { delete p.invitado; out.push(p); }
  }
  return out.sort((a, b) => (a.creado < b.creado ? -1 : 1));
}

/* Estados del pedido y a cuáles se puede pasar desde cada uno (solo la caja los cambia) */
export const ESTADOS = ["nuevo", "aceptado", "preparando", "listo", "entregado", "rechazado"];
export const ESTADO_LABEL = { nuevo: "Pendiente de aceptación", aceptado: "Aceptado", preparando: "En preparación", listo: "Listo", entregado: "Entregado", rechazado: "Cancelado" };
const PASOS = {
  nuevo: ["aceptado", "rechazado"], aceptado: ["preparando", "listo", "entregado", "rechazado"],
  preparando: ["listo", "entregado", "rechazado"], listo: ["entregado", "rechazado"], entregado: [], rechazado: [],
};
const CLAVE_PEDIDO = /^dia\/\d{4}-\d{2}-\d{2}\/\d{14}-[a-z0-9]{1,8}$/;
export async function cambiarEstado(store, key, estado, extra = {}, now = new Date()) {
  if (!ESTADOS.includes(estado)) throw new Error("Estado no válido.");
  if (typeof key !== "string" || !CLAVE_PEDIDO.test(key)) throw new Error("Pedido no válido.");
  const p = await store.get(key, { type: "json" });
  if (!p) throw new Error("No encontré ese pedido.");
  if (p.estado === estado) return { p, cambio: false };
  if (!(PASOS[p.estado] || []).includes(estado)) throw new Error(`El pedido ya está ${ESTADO_LABEL[p.estado].toLowerCase()}.`);
  p.estado = estado;
  p.historial = (p.historial || []).concat([{ estado, t: now.toISOString() }]);
  if (extra.ventaFolio) p.ventaFolio = Number(extra.ventaFolio) || null;
  await store.setJSON(key, p);
  return { p, cambio: true };
}

/* Un pedido por minuto desde la misma conexión. Se guarda un resumen (hash) de la IP, no la IP. */
export const ESPERA_MS = 60e3;
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
async function claveIP(ip, prefix = "limite/") {
  return prefix + (await sha("carboncito:" + ip)).slice(0, 24);
}
async function hmac(key, msg) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}
/* compara sin revelar por el tiempo cuántos caracteres coinciden */
async function iguales(a, b) { return (await hmac("comparar", String(a))) === (await hmac("comparar", String(b))); }

/* Sesión de la caja: "vence.firma". La firma usa usuario y contraseña, así que cambiar la contraseña cierra todas las sesiones. */
export const SESION_DIAS = 30;
const firma = (cfg, exp) => hmac("carboncito-sesion:" + cfg.usuario + ":" + cfg.password, String(exp));
export async function crearSesion(cfg, now = Date.now()) { const exp = now + SESION_DIAS * 864e5; return exp + "." + (await firma(cfg, exp)); }
async function sesionValida(cfg, tok) {
  const m = /^(\d{13})\.([0-9a-f]{64})$/.exec(tok || "");
  if (!cfg.password || !m || Number(m[1]) < Date.now()) return false;
  return iguales(m[2], await firma(cfg, Number(m[1])));
}

/* Intentos de entrada: 5 errores seguidos desde la misma conexión bloquean 15 minutos */
export const MAX_INTENTOS = 5, BLOQUEO_MS = 15 * 60e3;
async function bloqueado(store, k) {
  const r = k ? await store.get(k, { type: "json" }) : null;
  return r && r.n >= MAX_INTENTOS && Date.now() - r.t < BLOQUEO_MS ? Math.ceil((BLOQUEO_MS - (Date.now() - r.t)) / 60e3) : 0;
}
async function fallo(store, k) {
  if (!k) return;
  const r = (await store.get(k, { type: "json" })) || { n: 0 };
  const n = Date.now() - (r.t || 0) > BLOQUEO_MS ? 1 : r.n + 1;
  await store.setJSON(k, { n, t: Date.now() });
}

/* ================== Catálogo compartido ==================
   Los precios, la disponibilidad y los productos nuevos que se cambian en la caja se guardan en "catalogo/ajustes".
   El menú y la caja los leen de aquí, y el servidor cobra con ellos. */
const AJUSTES = "catalogo/ajustes";
const CATS = ["burgers", "snacks", "wings", "combos", "drinks"];
const ID_EXTRA = /^x-[a-z0-9-]{2,36}$/, ID_FOTO = /^x-[a-z0-9-]{2,36}-\d{13}$/;
const precio = (v) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 5000 ? n : null; };
export async function leerAjustes(store) {
  return (await store.get(AJUSTES, { type: "json" })) || { v: 0, precios: {}, agotado: {}, extra: [] };
}
/* catálogo vigente: el del código con los precios y la disponibilidad de la caja, más los productos nuevos */
export function catalogoCon(aj) {
  const cat = {};
  for (const [id, p] of Object.entries(CATALOG)) {
    const q = Object.assign({}, p, { opts: p.opts.map((o) => o.slice()) });
    const pr = own(aj.precios || {}, id) ? aj.precios[id] : null;
    if (Array.isArray(pr)) q.opts.forEach((o, i) => { if (precio(pr[i])) o[1] = pr[i]; });
    if (aj.agotado && aj.agotado[id] === true) q.disponible = false;
    cat[id] = q;
  }
  (aj.extra || []).forEach((x) => {
    cat[x.id] = { name: x.name, desc: x.desc, cat: x.cat, recipe: [], fixed: [], opts: [["", x.price]], img: x.img, extra: true, disponible: x.disponible !== false };
  });
  return cat;
}
/* revisa lo que manda la caja antes de guardarlo */
function limpiarAjustes(b, prev) {
  const precios = {}, agotado = {};
  for (const [id, arr] of Object.entries(b.precios || {})) {
    if (!own(CATALOG, id) || !Array.isArray(arr)) continue;
    const ok = CATALOG[id].opts.map((o, i) => precio(arr[i]));
    if (ok.some((v, i) => v !== null && v !== CATALOG[id].opts[i][1])) precios[id] = ok.map((v, i) => v || CATALOG[id].opts[i][1]);
  }
  for (const [id, v] of Object.entries(b.agotado || {})) if (own(CATALOG, id) && v === true) agotado[id] = true;
  const ids = new Set();
  const extra = (Array.isArray(b.extra) ? b.extra : []).slice(0, 60).map((x) => {
    const id = str(x && x.id, 40);
    if (!ID_EXTRA.test(id) || ids.has(id)) throw new Error("Hay un producto con un identificador no válido.");
    ids.add(id);
    const name = str(x.name, 40), desc = str(x.desc, 140), cat = CATS.includes(x.cat) ? x.cat : "", price = precio(x.price);
    if (!name || !cat || !price) throw new Error(`Al producto "${name || id}" le falta nombre, categoría o precio.`);
    const img = typeof x.img === "string" && x.img.startsWith("/api/img/") && ID_FOTO.test(x.img.slice(9)) ? x.img : "";
    return { id, name, desc, cat, price, img, disponible: x.disponible !== false };
  });
  /* un producto nuevo nunca se borra: si no viene, se conserva desactivado (los pedidos viejos lo siguen nombrando) */
  (prev.extra || []).forEach((x) => { if (!ids.has(x.id)) extra.push(Object.assign({}, x, { disponible: false })); });
  return { precios, agotado, extra };
}
const ajustesPublicos = (aj) => ({ v: aj.v || 0, precios: aj.precios || {}, agotado: aj.agotado || {}, extra: aj.extra || [] });

/* fotos de productos nuevos: JPEG o PNG, hasta 400 KB y 1600 px por lado (la caja las achica antes de subirlas) */
function medidasImagen(b) {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { tipo: "image/png", w: ((b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19]) >>> 0, h: ((b[20] << 24) | (b[21] << 16) | (b[22] << 8) | b[23]) >>> 0 };
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9;) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = (b[i + 2] << 8) | b[i + 3];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { tipo: "image/jpeg", h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
      i += 2 + len;
    }
  }
  return null;
}

/* ================== Seguimiento del pedido para el cliente ==================
   Al mandar su pedido, el teléfono recibe una cookie de invitado (aleatoria, HttpOnly). El pedido guarda el hash de esa cookie,
   así solo ese navegador puede verlo. Para pasarlo a la app de la pantalla de inicio hay un enlace con un token firmado que vence. */
const COOKIE = "cbx_invitado";
const TOKEN_HORAS = 48;
function leerCookie(req, nombre) {
  const m = new RegExp("(?:^|;\\s*)" + nombre + "=([0-9a-f]{64})(?:;|$)").exec(req.headers.get("cookie") || "");
  return m ? m[1] : "";
}
function aleatorio() { const a = new Uint8Array(32); crypto.getRandomValues(a); return hex(a); }
const secretoSeguimiento = (cfg) => "carboncito-seguimiento:" + cfg.password;
async function tokenPedido(cfg, key, now = Date.now()) { const exp = now + TOKEN_HORAS * 3600e3; return exp + "." + (await hmac(secretoSeguimiento(cfg), key + "|" + exp)); }
async function tokenValido(cfg, key, tok) {
  const m = /^(\d{13})\.([0-9a-f]{64})$/.exec(tok || "");
  if (!cfg.password || !m || Number(m[1]) < Date.now()) return false;
  return iguales(m[2], await hmac(secretoSeguimiento(cfg), key + "|" + m[1]));
}
/* lo que ve el cliente de su pedido: sin teléfono, dirección ni correo */
function vistaCliente(p) {
  return {
    key: p.key, folio: p.folio, creado: p.creado, estado: p.estado, estadoLabel: ESTADO_LABEL[p.estado],
    historial: (p.historial || []).map((h) => ({ estado: h.estado, t: h.t })), total: p.total,
    entrega: p.cliente.entrega, pago: p.cliente.pago, nombre: p.cliente.nombre,
    lines: p.lines.map((l) => ({ name: l.name, optLabel: l.optLabel, qty: l.qty, price: l.price, sauces: l.sauces, sin: l.sin, componentes: l.componentes })),
  };
}

/* ================== Notificaciones push (Web Push, sin WhatsApp ni n8n) ==================
   Se manda un aviso vacío firmado con VAPID; el service worker del menú pregunta el estado al servidor y muestra la notificación.
   Así no hace falta cifrar contenido y ningún dato del cliente viaja por el servicio de push. */
const PUSH_HOSTS = /^(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.push\.apple\.com|[a-z0-9.-]+\.notify\.windows\.com)$/;
const b64u = (buf) => { let s = ""; const a = new Uint8Array(buf); for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const desdeB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
async function jwtVapid(cfg, aud) {
  const pub = desdeB64u(cfg.vapidPublic);
  const key = await crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", x: b64u(pub.slice(1, 33)), y: b64u(pub.slice(33, 65)), d: cfg.vapidPrivate, ext: true },
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const parte = (o) => b64u(enc.encode(JSON.stringify(o)));
  const datos = parte({ typ: "JWT", alg: "ES256" }) + "." + parte({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "mailto:pedidos@elcarboncito.mx" });
  return datos + "." + b64u(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(datos)));
}
async function enviarPush(cfg, endpoint) {
  const u = new URL(endpoint);
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(endpoint, { method: "POST", redirect: "manual", signal: ctl.signal, headers: {
      authorization: `vapid t=${await jwtVapid(cfg, u.origin)}, k=${cfg.vapidPublic}`, ttl: "86400", urgency: "high" } });
    return r.status;
  } catch (e) { return 0; } finally { clearTimeout(t); }
}
const pushListo = (cfg) => !!(cfg.vapidPublic && cfg.vapidPrivate);
const idPedido = (key) => key.split("/")[2];
/* manda (o reintenta) el aviso de un estado a cada teléfono suscrito a ese pedido. Nunca lanza error: el pedido ya quedó guardado. */
export async function notificar(store, cfg, p, enviar = enviarPush) {
  if (!pushListo(cfg) || !["aceptado", "preparando", "listo", "rechazado"].includes(p.estado)) return 0;
  let mandados = 0;
  try {
    const { blobs } = await store.list({ prefix: `push/${idPedido(p.key)}/` });
    for (const b of blobs.slice(0, 5)) {
      const sub = await store.get(b.key, { type: "json" }); if (!sub) continue;
      const k = `notif/${idPedido(p.key)}/${p.estado}/${b.key.split("/")[2]}`;   /* uno por evento, pedido y teléfono */
      const prev = await store.get(k, { type: "json" });
      if (prev && (prev.ok || prev.n >= 3)) continue;
      const st = await enviar(cfg, sub.endpoint);
      if (st === 404 || st === 410) { await store.delete(b.key); await store.delete(k); continue; }   /* suscripción vencida */
      const ok = st >= 200 && st < 300; if (ok) mandados++;
      await store.setJSON(k, { ok, n: ((prev && prev.n) || 0) + 1, st, t: Date.now(), pedido: p.key });
    }
  } catch (e) { /* un aviso que falla no afecta el pedido */ }
  return mandados;
}
/* al terminar un pedido (entregado o cancelado) se borran sus suscripciones y sus registros de avisos: no se guarda de más */
async function limpiarAvisos(store, key) {
  try {
    for (const pre of [`push/${idPedido(key)}/`, `notif/${idPedido(key)}/`]) {
      const { blobs } = await store.list({ prefix: pre });
      for (const b of blobs) await store.delete(b.key);
    }
  } catch (e) { /* se reintenta al siguiente cambio */ }
}
/* reintentos limitados de avisos que fallaron (se aprovecha la consulta de la caja, sin tareas extra; a lo más una vez por minuto) */
let ultimoReintento = 0;
async function reintentar(store, cfg) {
  if (!pushListo(cfg) || Date.now() - ultimoReintento < 60e3) return;
  ultimoReintento = Date.now();
  try {
    const { blobs } = await store.list({ prefix: "notif/" });
    let hechos = 0;
    for (const b of blobs.slice(0, 30)) {
      if (hechos >= 3) break;
      const n = await store.get(b.key, { type: "json" });
      if (n && Date.now() - n.t > 864e5) { await store.delete(b.key); continue; }   /* de más de un día: ya no sirve */
      if (!n || n.ok || n.n >= 3 || Date.now() - n.t < 60e3) continue;
      const p = await store.get(n.pedido, { type: "json" });
      if (p) { hechos++; await notificar(store, cfg, p); }
    }
  } catch (e) { /* sin efecto en la caja */ }
}

/* Maneja la petición HTTP; lo usan Netlify y el servidor local.
   cfg: { usuario, password (de la caja), vapidPublic, vapidPrivate (notificaciones), secure (cookie solo por https) } */
export async function handle(req, store, cfg, ip = "") {
  const url = new URL(req.url);
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store, private" };
  const json = (data, status = 200, extra) => new Response(JSON.stringify(data), { status, headers: Object.assign({}, headers, extra) });
  cfg = Object.assign({ usuario: "caja", password: "", vapidPublic: "", vapidPrivate: "", secure: true }, cfg);
  const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const ruta = url.pathname;
  try {
    /* ---- catálogo vigente (público) ---- */
    if (req.method === "GET" && ruta === "/api/catalogo") return json(Object.assign({ ok: true }, ajustesPublicos(await leerAjustes(store))));
    /* ---- fotos de productos nuevos (públicas) ---- */
    if (req.method === "GET" && ruta.startsWith("/api/img/")) {
      const id = ruta.slice(9);
      if (!ID_FOTO.test(id)) return json({ error: "No encontrado." }, 404);
      const f = await store.get("img/" + id, { type: "json" });
      if (!f) return json({ error: "No encontrado." }, 404);
      return new Response(desdeB64u(f.datos), { headers: { "content-type": f.tipo, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
    }
    /* ---- clave pública para notificaciones ---- */
    if (req.method === "GET" && ruta === "/api/push/clave") return json({ ok: true, clave: pushListo(cfg) ? cfg.vapidPublic : "" });

    /* ---- pedido del menú ---- */
    if (req.method === "POST" && ruta === "/api/pedidos") {
      const len = Number(req.headers.get("content-length") || 0);
      if (len > 20000) return json({ error: "El pedido es demasiado grande." }, 413);
      const body = await req.json().catch(() => null);
      if (body && body.website) return json({ ok: true, folio: 0 }); /* trampa para robots */
      const cat = catalogoCon(await leerAjustes(store));
      const o = normalizeOrder(body, cat); /* un pedido con errores no cuenta para la espera */
      /* si un precio cambió mientras el cliente tenía el carrito abierto, se le enseña el total nuevo antes de crear el pedido */
      if (body.totalVisto != null && Number(body.totalVisto) !== o.total && !body.confirmado) {
        return json({ error: `Un precio cambió. El total ahora es $${o.total}.`, cambioPrecio: true, total: o.total }, 409);
      }
      const lim = ip ? await claveIP(ip) : "";
      if (lim) {
        const prev = await store.get(lim, { type: "json" });
        const falta = prev ? ESPERA_MS - (Date.now() - prev.t) : 0;
        if (falta > 0) {
          const s = Math.ceil(falta / 1000);
          return json({ error: `Ya recibimos un pedido tuyo. Espera ${s} segundos para mandar otro.`, espera: s }, 429);
        }
      }
      const inv = leerCookie(req, COOKIE) || aleatorio();
      const p = await crearPedido(store, body, new Date(), cat, await sha("invitado:" + inv));
      if (lim) await store.setJSON(lim, { t: Date.now() });
      const cookie = `${COOKIE}=${inv}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax${cfg.secure ? "; Secure" : ""}`;
      return json({ ok: true, folio: p.folio, total: p.total, pedido: p.key, token: cfg.password ? await tokenPedido(cfg, p.key) : "" }, 200, { "set-cookie": cookie });
    }

    /* ---- seguimiento: solo el navegador que mandó el pedido (cookie) o quien tenga su enlace (token) ---- */
    if (ruta === "/api/seguimiento" || ruta === "/api/seguimiento/push") {
      const inv = leerCookie(req, COOKIE), invHash = inv ? await sha("invitado:" + inv) : "";
      const tok = req.headers.get("x-seguimiento") || "";
      const puede = async (key) => {
        if (typeof key !== "string" || !CLAVE_PEDIDO.test(key)) return null;
        const p = await store.get(key, { type: "json" });
        if (!p) return null;
        if (invHash && p.invitado && (await iguales(p.invitado, invHash))) return p;
        if (tok && (await tokenValido(cfg, key, tok))) return p;
        return null;
      };
      if (req.method === "GET" && ruta === "/api/seguimiento") {
        const key = url.searchParams.get("p");
        if (key) {
          const p = await puede(key);
          return p ? json({ ok: true, pedido: vistaCliente(p) }) : json({ error: "No encontramos ese pedido en este teléfono." }, 404);
        }
        /* mis pedidos recientes en este navegador */
        if (!invHash) return json({ ok: true, pedidos: [] });
        const { blobs } = await store.list({ prefix: `invitado/${invHash}/` });
        const out = [];
        for (const b of blobs.slice(-10)) {
          const ref = await store.get(b.key, { type: "json" });
          const p = ref && (await store.get(ref.key, { type: "json" }));
          if (p && Date.now() - new Date(p.creado).getTime() < 36 * 3600e3) out.push(vistaCliente(p));
        }
        return json({ ok: true, pedidos: out });
      }
      if (req.method === "POST" && ruta === "/api/seguimiento/push") {
        if (!pushListo(cfg)) return json({ error: "Las notificaciones todavía no están configuradas." }, 503);
        const b = await req.json().catch(() => ({}));
        const p = await puede(b.p);
        if (!p) return json({ error: "No encontramos ese pedido en este teléfono." }, 404);
        let endpoint = "";
        try { const u = new URL(str(b.endpoint, 800)); if (u.protocol === "https:" && PUSH_HOSTS.test(u.hostname)) endpoint = u.href; } catch (e) { endpoint = ""; }
        if (!endpoint) return json({ error: "Este navegador no es compatible con las notificaciones." }, 400);
        const { blobs } = await store.list({ prefix: `push/${idPedido(p.key)}/` });
        const k = `push/${idPedido(p.key)}/${(await sha(endpoint)).slice(0, 24)}`;
        if (blobs.length >= 5 && !blobs.some((x) => x.key === k)) return json({ error: "Ya hay demasiados teléfonos avisados para este pedido." }, 429);
        await store.setJSON(k, { endpoint, t: Date.now() });
        return json({ ok: true });
      }
      return json({ error: "No encontrado." }, 404);
    }

    /* ---- caja ---- */
    if (!cfg.password) return json({ error: "Falta configurar CAJA_PASSWORD en Netlify." }, 500);
    const intentos = ip ? await claveIP(ip, "intentos/") : "";
    if (req.method === "POST" && ruta === "/api/caja/login") {
      const espera = await bloqueado(store, intentos);
      if (espera) return json({ error: `Demasiados intentos. Espera ${espera} min y vuelve a probar.` }, 429);
      const b = await req.json().catch(() => ({}));
      const okUsuario = await iguales(str(b.usuario, 60).toLowerCase(), cfg.usuario.toLowerCase());
      const okPassword = await iguales(String(b.password || ""), cfg.password);
      if (!okUsuario || !okPassword) { await fallo(store, intentos); return json({ error: "Usuario o contraseña incorrectos." }, 401); }
      if (intentos) await store.delete(intentos);
      return json({ ok: true, token: await crearSesion(cfg), usuario: cfg.usuario, dias: SESION_DIAS });
    }
    if (!(await sesionValida(cfg, bearer))) return json({ error: "La sesión de la caja venció. Vuelve a entrar.", login: true }, 401);
    if (req.method === "GET" && ruta === "/api/pedidos") {
      await reintentar(store, cfg);
      const aj = await leerAjustes(store);
      return json({ ok: true, ahora: new Date().toISOString(), catalogoV: aj.v || 0, pedidos: await listarPedidos(store, url.searchParams.get("desde")) });
    }
    if (req.method === "POST" && ruta === "/api/pedidos/estado") {
      const b = await req.json().catch(() => ({}));
      const { p, cambio } = await cambiarEstado(store, b.key, b.estado, b);
      if (cambio) await notificar(store, cfg, p);
      if (cambio && (p.estado === "entregado" || p.estado === "rechazado")) await limpiarAvisos(store, p.key);
      delete p.invitado;
      return json({ ok: true, pedido: p });
    }
    if (req.method === "POST" && ruta === "/api/catalogo") {
      const len = Number(req.headers.get("content-length") || 0);
      if (len > 60000) return json({ error: "Demasiados datos." }, 413);
      const b = await req.json().catch(() => ({}));
      const aj = Object.assign(limpiarAjustes(b, await leerAjustes(store)), { v: Date.now() });
      await store.setJSON(AJUSTES, aj);
      return json(Object.assign({ ok: true }, ajustesPublicos(aj)));
    }
    if (req.method === "POST" && ruta === "/api/catalogo/img") {
      const len = Number(req.headers.get("content-length") || 0);
      if (len > 600000) return json({ error: "La foto pesa demasiado (máximo 400 KB)." }, 413);
      const b = await req.json().catch(() => ({}));
      const m = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(String(b.foto || ""));
      const id = str(b.id, 40);
      if (!m || !ID_EXTRA.test(id)) return json({ error: "La foto debe ser JPG o PNG." }, 400);
      const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
      const med = medidasImagen(bytes);
      if (!med || bytes.length > 400 * 1024 || !med.w || !med.h || med.w > 1600 || med.h > 1600) return json({ error: "La foto debe ser JPG o PNG de hasta 1600 px y 400 KB." }, 400);
      const nombre = `${id}-${Date.now()}`;
      await store.setJSON("img/" + nombre, { tipo: med.tipo, datos: b64u(bytes), w: med.w, h: med.h });
      return json({ ok: true, img: "/api/img/" + nombre });
    }
    return json({ error: "No encontrado." }, 404);
  } catch (e) {
    return json({ error: e.message || "Error" }, 400);
  }
}
