/* Pruebas del servidor (shared/core.mjs) con un almacén en memoria: node dev/pruebas.mjs
   Cubre catálogo compartido, cambio de precio, Alicombo, seguimiento privado, avisos push y ubicación. */
import { handle, notificar, CATALOG } from "../shared/core.mjs";

const mem = new Map();
const store = {
  async list({ prefix }) { return { blobs: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
  async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
  async setJSON(k, v) { mem.set(k, JSON.stringify(v)); },
  async delete(k) { mem.delete(k); },
};
const cfg = { usuario: "caja", password: "prueba1234", secure: false };
let ok = 0, mal = 0;
const prueba = (nombre, cond, extra) => { if (cond) ok++; else mal++; console.log((cond ? "  ✓ " : "  ✗ ") + nombre + (cond || extra === undefined ? "" : "  → " + JSON.stringify(extra))); };
let ipN = 1;
async function api(method, path, body, headers = {}, ip) {
  const r = await handle(new Request("http://localhost" + path, { method, headers: Object.assign({ "content-type": "application/json" }, headers), body: body ? JSON.stringify(body) : undefined }), store, cfg, ip || "10.0.0." + ipN++);
  const txt = await r.text(); let d; try { d = JSON.parse(txt); } catch (e) { d = txt; }
  return { status: r.status, d, cookie: (r.headers.get("set-cookie") || "").split(";")[0], cache: r.headers.get("cache-control") };
}
const cliente = (extra) => Object.assign({ mode: "recoger", name: "Ana", phone: "7771234567", pay: "efectivo" }, extra);
const pedidoSencilla = (extra) => Object.assign({ items: [{ id: "sencilla", opt: 0, qty: 2 }], cliente: cliente() }, extra);

console.log("Caja: sesión");
const login = await api("POST", "/api/caja/login", { usuario: "caja", password: "prueba1234" });
prueba("login correcto da sesión", login.status === 200 && login.d.token);
const caja = { authorization: "Bearer " + login.d.token };
prueba("sin sesión no se ven pedidos", (await api("GET", "/api/pedidos")).status === 401);
prueba("sin sesión no se cambia el catálogo", (await api("POST", "/api/catalogo", { precios: { sencilla: [1, 1] } })).status === 401);

console.log("Catálogo compartido y precios");
let cat = await api("GET", "/api/catalogo");
prueba("catálogo público y sin caché", cat.status === 200 && cat.d.ok && /no-store/.test(cat.cache));
const p1 = await api("POST", "/api/pedidos", pedidoSencilla({ totalVisto: 120 }));
prueba("pedido con el precio de fábrica ($60 × 2)", p1.status === 200 && p1.d.total === 120, p1.d);
const guardado = await api("POST", "/api/catalogo", { precios: { sencilla: [65, 55] }, agotado: {}, extra: [] }, caja);
prueba("la caja guarda el precio nuevo", guardado.status === 200 && guardado.d.precios.sencilla[0] === 65 && guardado.d.v > 0, guardado.d);
cat = await api("GET", "/api/catalogo");
prueba("el menú lee el precio nuevo", cat.d.precios.sencilla[0] === 65);
const viejo = await api("POST", "/api/pedidos", pedidoSencilla({ totalVisto: 120 }));
prueba("carrito con precio viejo: 409 con el total nuevo, sin crear pedido", viejo.status === 409 && viejo.d.cambioPrecio && viejo.d.total === 130, viejo.d);
const nuevo = await api("POST", "/api/pedidos", pedidoSencilla({ totalVisto: 130 }));
prueba("con el total nuevo confirmado se crea", nuevo.status === 200 && nuevo.d.total === 130, nuevo.d);
const precioFalso = await api("POST", "/api/pedidos", Object.assign(pedidoSencilla(), { total: 1, items: [{ id: "sencilla", opt: 0, qty: 1, price: 1 }] }));
prueba("el precio que manda el navegador no se usa", precioFalso.d.total === 65, precioFalso.d);
const lista = (await api("GET", "/api/pedidos", null, caja)).d.pedidos;
const anterior = lista.find((p) => p.key === p1.d.pedido);
prueba("el pedido anterior conserva su precio ($60)", anterior && anterior.lines[0].price === 60 && anterior.total === 120 && anterior.lines[0].name === "Sencilla");
prueba("la caja no ve el hash del invitado", lista.every((p) => !("invitado" in p)));
const malo = await api("POST", "/api/catalogo", { precios: { sencilla: [0.5, -3], constructor: [1] }, agotado: { __proto__: true }, extra: [] }, caja);
prueba("precios no válidos se ignoran (vuelve a fábrica)", malo.status === 200 && !malo.d.precios.sencilla && !Object.prototype.hasOwnProperty.call(malo.d.precios, "constructor"), malo.d);
await api("POST", "/api/catalogo", { precios: {}, agotado: { hotdog: true }, extra: [] }, caja);
const agot = await api("POST", "/api/pedidos", { items: [{ id: "hotdog", opt: 0, qty: 1 }], cliente: cliente() });
prueba("producto agotado se rechaza", agot.status === 400 && /no está disponible/.test(agot.d.error), agot.d);
await api("POST", "/api/catalogo", { precios: {}, agotado: {}, extra: [] }, caja);

console.log("Alicombo y 1/2 Alicombo");
prueba("Alicombo y 1/2 Alicombo son productos distintos", CATALOG.alicombo.opts[0][1] === 300 && CATALOG["medio-alicombo"].opts[0][1] === 150);
const ali = await api("POST", "/api/pedidos", { items: [{ id: "alicombo", qty: 1, combo: Array(6).fill({}) }], cliente: cliente() });
const comps = ali.d.pedido && (await store.get(ali.d.pedido)).lines[0].componentes;
prueba("Alicombo $300 con un sabor fijo en cada media orden", ali.status === 200 && ali.d.total === 300 && comps.length === 6 && comps.map((c) => c.sauces[0]).join("|") === "Receta secreta sin salsa|Mango habanero|Piña habanero|Tamarindo picante|BBQ picante|BBQ dulce", ali.d);
const aliTrampa = await api("POST", "/api/pedidos", { items: [{ id: "alicombo", qty: 1, combo: Array(6).fill({ sauces: ["bbq-dulce"], sabores: { "bbq-dulce": 5 } }) }], cliente: cliente() });
prueba("no se pueden cambiar los sabores del Alicombo", aliTrampa.status === 200 && (await store.get(aliTrampa.d.pedido)).lines[0].componentes[0].sauces[0] === "Receta secreta sin salsa");

console.log("Productos nuevos");
const sinFoto = await api("POST", "/api/catalogo", { precios: {}, agotado: {}, extra: [{ id: "x-agua-fresca", name: "Agua de horchata", desc: "1 litro", cat: "drinks", price: 30, img: "" }] }, caja);
prueba("crear producto nuevo", sinFoto.status === 200 && sinFoto.d.extra.length === 1, sinFoto.d);
const conExtra = await api("POST", "/api/pedidos", { items: [{ id: "x-agua-fresca", opt: 0, qty: 2 }], cliente: cliente() });
prueba("se vende desde el menú con su precio", conExtra.status === 200 && conExtra.d.total === 60, conExtra.d);
const sinLista = await api("POST", "/api/catalogo", { precios: {}, agotado: {}, extra: [] }, caja);
prueba("si la caja lo omite, no se borra: queda desactivado", sinLista.d.extra.length === 1 && sinLista.d.extra[0].disponible === false, sinLista.d);
const desact = await api("POST", "/api/pedidos", { items: [{ id: "x-agua-fresca", opt: 0, qty: 1 }], cliente: cliente() });
prueba("desactivado no se vende", desact.status === 400);
prueba("el pedido viejo lo sigue nombrando", (await store.get(conExtra.d.pedido)).lines[0].name === "Agua de horchata");
const idMalo = await api("POST", "/api/catalogo", { precios: {}, agotado: {}, extra: [{ id: "sencilla", name: "x", cat: "drinks", price: 3 }] }, caja);
prueba("un producto nuevo no puede pisar uno del catálogo", idMalo.status === 400);
const imgFalsa = await api("POST", "/api/catalogo/img", { id: "x-agua-fresca", foto: "data:image/png;base64," + Buffer.from("<svg onload=alert(1)>").toString("base64") }, caja);
prueba("foto que no es PNG/JPG real se rechaza", imgFalsa.status === 400, imgFalsa.d);
const png1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const imgOk = await api("POST", "/api/catalogo/img", { id: "x-agua-fresca", foto: "data:image/png;base64," + png1x1 }, caja);
prueba("foto PNG válida se guarda", imgOk.status === 200 && /^\/api\/img\/x-agua-fresca-\d{13}$/.test(imgOk.d.img), imgOk.d);
const verImg = await handle(new Request("http://localhost" + imgOk.d.img), store, cfg);
prueba("la foto se sirve con su tipo y nosniff", verImg.status === 200 && verImg.headers.get("content-type") === "image/png" && verImg.headers.get("x-content-type-options") === "nosniff");
const grande = Buffer.alloc(24); grande.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); grande.writeUInt32BE(5000, 16); grande.writeUInt32BE(5000, 20);
prueba("foto de 5000 px se rechaza", (await api("POST", "/api/catalogo/img", { id: "x-agua-fresca", foto: "data:image/png;base64," + grande.toString("base64") }, caja)).status === 400);

console.log("Seguimiento privado (dos clientes en la misma IP)");
const ipCompartida = "200.1.1.1";
const a = await api("POST", "/api/pedidos", pedidoSencilla({ cliente: cliente({ name: "Cliente A" }) }), {}, ipCompartida);
mem.forEach((v, k) => { if (k.startsWith("limite/")) mem.delete(k); });   /* sin la espera de un minuto entre A y B */
const b = await api("POST", "/api/pedidos", pedidoSencilla({ cliente: cliente({ name: "Cliente B" }) }), {}, ipCompartida);
prueba("cada cliente recibe su cookie HttpOnly distinta", a.cookie && b.cookie && a.cookie !== b.cookie);
const verA = await api("GET", "/api/seguimiento?p=" + encodeURIComponent(a.d.pedido), null, { cookie: a.cookie }, ipCompartida);
prueba("A ve su pedido", verA.status === 200 && verA.d.pedido.nombre === "Cliente A" && /no-store/.test(verA.cache));
prueba("la vista del cliente no trae teléfono ni dirección", !JSON.stringify(verA.d).includes("7771234567"));
const ajeno = await api("GET", "/api/seguimiento?p=" + encodeURIComponent(a.d.pedido), null, { cookie: b.cookie }, ipCompartida);
prueba("B no puede ver el pedido de A cambiando la URL (misma IP)", ajeno.status === 404);
prueba("sin cookie ni token no se ve", (await api("GET", "/api/seguimiento?p=" + encodeURIComponent(a.d.pedido))).status === 404);
const misB = await api("GET", "/api/seguimiento", null, { cookie: b.cookie });
prueba("la lista de B solo trae su pedido", misB.d.pedidos.length === 1 && misB.d.pedidos[0].key === b.d.pedido);
const conToken = await api("GET", "/api/seguimiento?p=" + encodeURIComponent(a.d.pedido), null, { "x-seguimiento": a.d.token });
prueba("con el enlace firmado se recupera (app de Inicio)", conToken.status === 200);
const tokenAjeno = await api("GET", "/api/seguimiento?p=" + encodeURIComponent(b.d.pedido), null, { "x-seguimiento": a.d.token });
prueba("el token de A no abre el pedido de B", tokenAjeno.status === 404);
const vencido = (Date.now() - 1000) + "." + a.d.token.split(".")[1];
prueba("token vencido no sirve", (await api("GET", "/api/seguimiento?p=" + encodeURIComponent(a.d.pedido), null, { "x-seguimiento": vencido })).status === 404);
prueba("un cliente no puede cambiar el estado", (await api("POST", "/api/pedidos/estado", { key: a.d.pedido, estado: "aceptado" }, { cookie: a.cookie })).status === 401);

console.log("Estados");
const est = async (e) => (await api("POST", "/api/pedidos/estado", { key: a.d.pedido, estado: e }, caja));
prueba("no se puede entregar sin aceptar", (await est("entregado")).status === 400);
prueba("aceptar", (await est("aceptado")).status === 200);
prueba("en preparación", (await est("preparando")).status === 200);
prueba("listo", (await est("listo")).status === 200);
const salaA = await api("GET", "/api/seguimiento?p=" + encodeURIComponent(a.d.pedido), null, { cookie: a.cookie });
const salaB = await api("GET", "/api/seguimiento?p=" + encodeURIComponent(b.d.pedido), null, { cookie: b.cookie });
prueba("la sala de A dice Listo y la de B sigue pendiente", salaA.d.pedido.estado === "listo" && salaB.d.pedido.estado === "nuevo" && salaA.d.pedido.historial.length === 4);
prueba("de listo no se regresa a aceptado", (await est("aceptado")).status === 400);
prueba("clave de pedido inventada se rechaza", (await api("POST", "/api/pedidos/estado", { key: "../catalogo/ajustes", estado: "aceptado" }, caja)).status === 400);

console.log("Avisos push (sin WhatsApp ni n8n)");
const pushCfg = Object.assign({}, cfg, { vapidPublic: "x", vapidPrivate: "y" });
const subA = await handle(new Request("http://localhost/api/seguimiento/push", { method: "POST", headers: { cookie: a.cookie, "content-type": "application/json" }, body: JSON.stringify({ p: a.d.pedido, endpoint: "https://fcm.googleapis.com/fcm/send/aaa" }) }), store, pushCfg);
prueba("A suscribe su teléfono a su pedido", subA.status === 200);
const subAjena = await handle(new Request("http://localhost/api/seguimiento/push", { method: "POST", headers: { cookie: b.cookie, "content-type": "application/json" }, body: JSON.stringify({ p: a.d.pedido, endpoint: "https://fcm.googleapis.com/fcm/send/bbb" }) }), store, pushCfg);
prueba("B no puede suscribirse al pedido de A", subAjena.status === 404);
const ssrf = await handle(new Request("http://localhost/api/seguimiento/push", { method: "POST", headers: { cookie: b.cookie, "content-type": "application/json" }, body: JSON.stringify({ p: b.d.pedido, endpoint: "https://169.254.169.254/latest/meta-data" }) }), store, pushCfg);
prueba("destino de push que no es un servicio de push se rechaza", ssrf.status === 400);
await handle(new Request("http://localhost/api/seguimiento/push", { method: "POST", headers: { cookie: b.cookie, "content-type": "application/json" }, body: JSON.stringify({ p: b.d.pedido, endpoint: "https://fcm.googleapis.com/fcm/send/bbb" }) }), store, pushCfg);
const enviados = [];
const pA = await store.get(a.d.pedido), pB = await store.get(b.d.pedido);
let n = await notificar(store, pushCfg, pA, async (c, ep) => { enviados.push(ep); return 201; });
prueba("el aviso de A solo va al teléfono de A", n === 1 && enviados.length === 1 && enviados[0].endsWith("/aaa"));
n = await notificar(store, pushCfg, pA, async (c, ep) => { enviados.push(ep); return 201; });
prueba("el mismo evento no se manda dos veces", n === 0 && enviados.length === 1);
pB.estado = "aceptado";
let intentos = 0;
for (let i = 0; i < 5; i++) await notificar(store, pushCfg, pB, async () => { intentos++; return 0; });
prueba("si falla, se reintenta como máximo 3 veces", intentos === 3);
pB.estado = "preparando";
await notificar(store, pushCfg, pB, async () => 410);
const quedan = (await store.list({ prefix: "push/" + pB.key.split("/")[2] + "/" })).blobs.length;
prueba("suscripción vencida (410) se borra", quedan === 0);
const roto = await notificar({ list: async () => { throw new Error("caído"); } }, pushCfg, pA, async () => 201);
prueba("una falla del almacén de avisos no rompe nada", roto === 0);

await handle(new Request("http://localhost/api/pedidos/estado", { method: "POST", headers: Object.assign({ "content-type": "application/json" }, caja), body: JSON.stringify({ key: a.d.pedido, estado: "entregado" }) }), store, pushCfg);
const idA = a.d.pedido.split("/")[2];
prueba("al entregar se borran sus suscripciones y registros de avisos", (await store.list({ prefix: "push/" + idA })).blobs.length === 0 && (await store.list({ prefix: "notif/" + idA })).blobs.length === 0);

/* firma VAPID real: claves nuevas, un receptor local en lugar del servicio de push, y se revisa la firma con la clave pública */
{
  const http = await import("node:http");
  const llaves = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const b64u = (b) => Buffer.from(b).toString("base64url");
  const pub = b64u(await crypto.subtle.exportKey("raw", llaves.publicKey)), priv = (await crypto.subtle.exportKey("jwk", llaves.privateKey)).d;
  let recibido = null;
  const srv = http.createServer((req, res) => { recibido = req.headers; res.writeHead(201); res.end(); }).listen(0);
  const puerto = srv.address().port;
  const pV = await store.get(b.d.pedido); pV.estado = "listo";
  await store.setJSON("push/" + pV.key.split("/")[2] + "/prueba", { endpoint: `http://127.0.0.1:${puerto}/push/abc` });
  const vcfg = Object.assign({}, cfg, { vapidPublic: pub, vapidPrivate: priv });
  const mand = await notificar(store, vcfg, pV);
  srv.close();
  const m = /^vapid t=([^,]+), k=(.+)$/.exec((recibido && recibido.authorization) || "");
  let firmaOk = false;
  if (m) {
    const [h, p, s] = m[1].split(".");
    firmaOk = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, llaves.publicKey, Buffer.from(s, "base64url"), new TextEncoder().encode(h + "." + p));
    const claims = JSON.parse(Buffer.from(p, "base64url").toString());
    prueba("el JWT dice para qué servicio es y vence en 12 h", claims.aud === `http://127.0.0.1:${puerto}` && claims.exp > Date.now() / 1000 && claims.exp <= Date.now() / 1000 + 12 * 3600 + 5);
  }
  prueba("aviso con firma VAPID válida (ES256) y sin contenido", mand === 1 && firmaOk && m && m[2] === pub && recibido.ttl === "86400", recibido);
}

console.log("Ubicación de entrega");
const dom = (c) => api("POST", "/api/pedidos", { items: [{ id: "sencilla", opt: 0, qty: 1 }], cliente: cliente(Object.assign({ mode: "domicilio", addr: "" }, c)) });
let r = await dom({ lat: 18.8536, lng: -99.2245 });
prueba("solo con la ubicación del GPS se acepta y se guarda", r.status === 200 && (await store.get(r.d.pedido)).cliente.ubicacion.lat === 18.8536, r.d);
r = await dom({ lat: 51.5, lng: -0.12, addr: "Calle 1" });
prueba("coordenadas fuera de México se descartan", r.status === 200 && (await store.get(r.d.pedido)).cliente.ubicacion === null);
r = await dom({ mapa: "https://maps.app.goo.gl/abc123" });
prueba("enlace de Google Maps se guarda (sin visitarlo)", r.status === 200 && (await store.get(r.d.pedido)).cliente.mapa === "https://maps.app.goo.gl/abc123");
r = await dom({ mapa: "https://evil.example/maps", addr: "Calle 2" });
prueba("enlace que no es de Google se descarta", r.status === 200 && (await store.get(r.d.pedido)).cliente.mapa === "");
r = await dom({ mapa: "javascript:alert(1)" });
prueba("sin dirección, GPS ni enlace válido se pide la dirección", r.status === 400);

console.log("Promos del día");
prueba("sin sesión no se crean ofertas", (await api("POST", "/api/promos", { promos: [] })).status === 401);
const promoMala = await api("POST", "/api/promos", { promos: [{ id: "p-alitas1", items: [{ id: "alitas", opt: 0, qty: 1 }], precio: 80, duracionMin: 60, dinamica: { tipo: "primeros", cupo: 3 } }] }, caja);
prueba("una oferta no puede llevar algo con sabor a elegir", promoMala.status === 400, promoMala.d);
const cortaMala = await api("POST", "/api/promos", { promos: [{ id: "p-corta1", items: [{ id: "sencilla", opt: 0, qty: 1 }], precio: 40, duracionMin: 1, dinamica: { tipo: "primeros", cupo: 3 } }] }, caja);
prueba("duración menor a 5 minutos se rechaza", cortaMala.status === 400);
const creada = await api("POST", "/api/promos", {
  promos: [
    { id: "p-flash01", nombre: "", items: [{ id: "sencilla", opt: 0, qty: 1 }, { id: "jarritos-uva", opt: 0, qty: 1 }], precio: 70, duracionMin: 90, dinamica: { tipo: "primeros", cupo: 2 } },
    { id: "p-catrin1", nombre: "Catrín del día", items: [{ id: "alicombo", opt: 0, qty: 1 }], precio: 150, duracionMin: 120, dinamica: { tipo: "reto", texto: "El primero que llegue disfrazado de catrín" } },
  ],
  dinamicas: [{ id: "d-catrin1", texto: "El primero que llegue disfrazado de catrín" }, { id: "d-rima001", texto: "El primero que cante una rima completa" }],
}, caja);
prueba("la caja crea ofertas y dinámicas", creada.status === 200 && creada.d.promos.length === 2 && creada.d.dinamicas.length === 2, creada.d);
const flash = creada.d.promos.find((p) => p.id === "p-flash01");
prueba("sin nombre se llama Oferta flash; dura lo que dijo la caja", flash.nombre === "Oferta flash" && Math.abs(flash.fin - flash.inicio - 90 * 60e3) < 1000 && flash.normal === 85, flash);
const pub = await api("GET", "/api/promos");
prueba("el menú ve las ofertas vigentes, sin las dinámicas guardadas", pub.d.promos.length === 2 && !pub.d.dinamicas && typeof pub.d.ahora === "number");
const conPromo = (q) => ({ items: [{ id: "p-flash01", qty: q }, { id: "papas", opt: 0, qty: 1 }], cliente: cliente() });
const dos = await api("POST", "/api/pedidos", conPromo(2));
prueba("la oferta es una por pedido", dos.status === 400, dos.d);
const pp1 = await api("POST", "/api/pedidos", conPromo(1));
const lineaP = pp1.d.pedido && (await store.get(pp1.d.pedido)).lines[0];
prueba("se cobra el precio de la oferta y la cocina ve qué lleva", pp1.status === 200 && pp1.d.total === 70 + 30 && lineaP.componentes.map((c) => c.label).join(" | ") === "1× Sencilla (Con papas) | 1× Jarritos Uva", pp1.d);
await api("POST", "/api/promos/usar", { id: "p-flash01", n: 1 }, caja);
const tercero = await api("POST", "/api/pedidos", conPromo(1));
prueba("con los 2 lugares ocupados (web + caja) ya no se puede", tercero.status === 400 && /ya no quedan/.test(tercero.d.error), tercero.d);
const reto = await api("POST", "/api/pedidos", { items: [{ id: "p-catrin1", qty: 1 }], cliente: cliente() });
prueba("un reto en el local no se pide en línea", reto.status === 400, reto.d);
const terminar = await api("POST", "/api/promos", { promos: [Object.assign({}, creada.d.promos.find((p) => p.id === "p-catrin1"), { terminada: true }), { id: "p-flash01", items: flash.items, precio: 70, dinamica: flash.dinamica }], dinamicas: creada.d.dinamicas }, caja);
prueba("terminar una oferta la quita del menú", terminar.status === 200 && (await api("GET", "/api/promos")).d.promos.every((p) => p.id !== "p-catrin1"));
prueba("una oferta que ya terminó no se cobra", (await api("POST", "/api/pedidos", { items: [{ id: "p-nadaaa1", qty: 1 }], cliente: cliente() })).d.error === "La oferta ya terminó.");

console.log("Varios clientes a la vez (20 pedidos simultáneos, IPs distintas)");
const t0 = Date.now();
const lote = await Promise.all(Array.from({ length: 20 }, (_, i) => api("POST", "/api/pedidos", pedidoSencilla({ cliente: cliente({ name: "Carga " + i }) }))));
const keys = new Set(lote.map((x) => x.d.pedido));
prueba(`20 pedidos guardados sin perder ninguno (${Date.now() - t0} ms en memoria)`, lote.every((x) => x.status === 200) && keys.size === 20);
prueba("folios distintos aunque lleguen al mismo tiempo", new Set(lote.map((x) => x.d.folio)).size === 20, lote.map((x) => x.d.folio));

console.log(`\n${ok} correctas, ${mal} con error`);
process.exitCode = mal ? 1 : 0;
