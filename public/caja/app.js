/* Caja El Carboncito
   Compatible con Safari de iOS 12: sin "?.", sin "??", sin campos de clase. */
(function () {
  "use strict";

  /* =========================================================
     PRODUCTOS (mismos precios que el menú web)
     opts: [nombre, precio]; quitar: lo que se puede pedir "sin" (no son extras)
     img: foto en img/ (PNG, sin .png); si falta se usa el id; "" = sin foto
     desc: descripción (se ve al abrir el producto)
     Bebidas: { id, cat: "drinks", name, desc, opts: [["600 ml", 25]], quitar: [], img: "", disponible: true }
     con el mismo id que en shared/core.mjs y en el menú. La pestaña aparece sola cuando hay alguna.
     ========================================================= */
  var VEG = ["Lechuga", "Jitomate", "Cebolla", "Chile en vinagre", "Catsup", "Mostaza"];
  var HD = ["Jitomate", "Cebolla", "Catsup", "Mostaza", "Chiles"];
  var SALSAS_PAPAS = ["Queso de nachos", "Catsup", "Valentina"];
  /* las verduras de las alitas no siempre van: solo se puede quitar el ranch */
  var WINGS = ["Ranch"];
  var CATS = [
    { id: "burgers", name: "Hamburguesas" },
    { id: "snacks", name: "Hotdogs y botanas" },
    { id: "wings", name: "Alitas" },
    { id: "combos", name: "Combos" },
    { id: "drinks", name: "Bebidas" }
  ];
  /* combo: precio fijo y partes; cada parte toma de su producto (pid) las salsas y lo que se puede quitar.
     unSabor: un solo sabor, a elegir. pend: algo por confirmar. repetidos: null = falta confirmar.
     Queda en borrador (no se vende) mientras falte el precio, haya un pend o falte decidir repetidos. */
  function part(pid, label, extra) { var c = { pid: pid, label: label }; for (var k in extra) c[k] = extra[k]; return c; }
  function combo(id, name, desc, price, parts, extra) {
    var c = { id: id, cat: "combos", name: name, desc: desc, img: "", opts: [["Combo", price]], parts: parts, quitar: [] };
    for (var k in extra) c[k] = extra[k];
    c.draft = price == null || parts.some(function (x) { return x.pend; }) || (parts.some(function (x) { return x.unSabor; }) && typeof c.repetidos !== "boolean");
    return c;
  }
  /* refrescos de 600 ml que se pueden elegir en un combo */
  var JARRITOS = ["jarritos-uva", "jarritos-pina", "jarritos-manzana", "jarritos-limon", "jarritos-tamarindo"];
  var PRODUCTS = [
    { id: "sencilla", cat: "burgers", name: "Sencilla", opts: [["Con papas", 60], ["Sin papas", 50]], quitar: ["Queso amarillo"].concat(VEG) },
    { id: "hawaiana", cat: "burgers", name: "Hawaiana", opts: [["Con papas", 70], ["Sin papas", 60]], quitar: ["Queso amarillo", "Jamón", "Piña asada"].concat(VEG) },
    { id: "bbq", cat: "burgers", name: "BBQ", opts: [["Con papas", 70], ["Sin papas", 60]], quitar: ["Queso amarillo", "Jamón", "Tocino"].concat(VEG) },
    { id: "loba", cat: "burgers", name: "Loba", opts: [["Con papas", 80], ["Sin papas", 70]], quitar: ["Queso amarillo", "Jamón", "Salchicha"].concat(VEG) },
    { id: "monstruo", cat: "burgers", name: "Monstruo", opts: [["Con papas", 90], ["Sin papas", 80]], quitar: ["Queso amarillo", "Jamón", "Salchicha", "Tocino", "Piña asada"].concat(VEG) },
    /* un solo botón "Hotdog": en su ventana, "Con tocino" cambia al producto hotdog-tocino (mismo id que el menú y el servidor) */
    { id: "hotdog", cat: "snacks", name: "Hotdog sencillo", tile: "Hotdog", tocino: "hotdog-tocino", opts: [["1 hotdog", 20], ["3 hotdogs", 40]], quitar: HD },
    { id: "hotdog-tocino", cat: "snacks", name: "Hotdog con tocino", hidden: true, base: "hotdog", img: "hotdog", opts: [["1 hotdog", 25], ["3 hotdogs", 50]], quitar: HD },
    { id: "salchipulpos", cat: "snacks", name: "Salchipulpos", opts: [["Chico (4 pulpos)", 40], ["Grande (6 pulpos)", 60]], quitar: SALSAS_PAPAS },
    { id: "papas", cat: "snacks", name: "Orden de papas", opts: [["Chica", 30], ["Grande", 50]], quitar: SALSAS_PAPAS },
    /* en Vender se muestran los sabores; cada uno abre las alitas con ese sabor para elegir la porción. El ranch se elige en el ticket. */
    { id: "alitas", cat: "wings", name: "Alitas", opts: [["Orden de 10", 110], ["Media orden (5)", 60]], piezas: [10, 5], porcion: ["Orden completa (10 piezas)", "Media orden (5 piezas)"], sauces: true, quitar: WINGS },
    { id: "alitas-mixto", cat: "combos", name: "Combo mixto de alitas", img: "alitas", opts: [["10 alitas (2 de cada sabor)", 110], ["Medio combo (1 de cada sabor)", 60]], quitar: WINGS },
    combo("combo-carboncito", "CARBONCITO", "Hamburguesa sencilla con papas, 4 alitas y refresco de 600 ml", 100, [
      part("sencilla", "Hamburguesa sencilla con papas"), part("alitas", "4 alitas", { piezas: 4 }),
      part(null, "Refresco de 600 ml", { opciones: JARRITOS })
    ], { img: "combo-carboncito" }),
    combo("combo-rico", "Combo rico", "Hamburguesa hawaiana, alitas (orden de 10), salchipulpos chicos y 3 hotdogs sencillos", 200, [
      part("hawaiana", "Hamburguesa hawaiana (sin papas)"), part("alitas", "Alitas (orden de 10)"),
      part("salchipulpos", "Salchipulpos chicos (4 pulpos)"), part("hotdog", "Hotdogs sencillos (orden de 3)")
    ], { img: "combo-rico" }),
    combo("combo-domi", "Domi combo", "2 hamburguesas hawaianas, alitas (orden de 10), salchipulpos grandes y 3 hotdogs sencillos", 300, [
      part("hawaiana", "Hamburguesa hawaiana 1 (sin papas)"), part("hawaiana", "Hamburguesa hawaiana 2 (sin papas)"),
      part("alitas", "Alitas (orden de 10)"), part("salchipulpos", "Salchipulpos grandes (6 pulpos)"),
      part("hotdog", "Hotdogs sencillos (orden de 3)")
    ], { img: "domi-combo" }),
    combo("medio-alicombo", "1/2 Alicombo", "Tres medias órdenes de alitas, un sabor en cada una", 150, [
      part("alitas", "Media orden 1", { unSabor: true }), part("alitas", "Media orden 2", { unSabor: true }), part("alitas", "Media orden 3", { unSabor: true })
    ], { repetidos: true, img: "medio-alicombo" }),
    /* Alicombo: 6 medias órdenes, una de cada sabor ya puesto (no se elige). Es otro producto que el 1/2 Alicombo. */
    combo("alicombo", "Alicombo", "1/2 natural, 1/2 mango habanero, 1/2 piña habanero, 1/2 tamarindo picante, 1/2 BBQ picante y 1/2 BBQ dulce", 300,
      [["Receta secreta sin salsa", "natural"], ["Mango habanero", "mango habanero"], ["Piña habanero", "piña habanero"], ["Tamarindo picante", "tamarindo picante"], ["BBQ picante", "BBQ picante"], ["BBQ dulce", "BBQ dulce"]].map(function (x) {
        return part("alitas", "1/2 " + x[1], { opt: 1, piezas: 5, sabor: x[0] });
      }), { img: "alicombo" }),
    /* bebidas: mismo id que el menú y el servidor. La cerveza es solo de la caja. */
    { id: "jarritos-uva", cat: "drinks", name: "Jarritos Uva", desc: "Refresco de 600 ml", img: "jarritos-uva-600ml", opts: [["600 ml", 25]], quitar: [] },
    { id: "jarritos-pina", cat: "drinks", name: "Jarritos Piña", desc: "Refresco de 600 ml", img: "jarritos-pina-600ml", opts: [["600 ml", 25]], quitar: [] },
    { id: "jarritos-manzana", cat: "drinks", name: "Jarritos Manzana", desc: "Refresco de 600 ml", img: "jarritos-manzana-600ml", opts: [["600 ml", 25]], quitar: [] },
    { id: "jarritos-limon", cat: "drinks", name: "Jarritos Limón", desc: "Refresco de 600 ml", img: "jarritos-limon-600ml", opts: [["600 ml", 25]], quitar: [] },
    { id: "jarritos-tamarindo", cat: "drinks", name: "Jarritos Tamarindo", desc: "Refresco de 600 ml", img: "jarritos-tamarindo-600ml", opts: [["600 ml", 25]], quitar: [] },
    { id: "coca-cola", cat: "drinks", name: "Coca-Cola de vidrio", desc: "Refresco de 500 ml", img: "coca-cola-vidrio-500ml", opts: [["500 ml", 25]], quitar: [] },
    { id: "cerveza", cat: "drinks", name: "Cerveza", desc: "Solo en el local", img: "cerveza-tarro-espuma", opts: [["Cerveza", 35]], quitar: [] }
  ];
  /* Bebidas se queda aunque esté vacía, para que se vea dónde van a ir */
  CATS = CATS.filter(function (c) { return c.id === "drinks" || PRODUCTS.some(function (p) { return p.cat === c.id; }); });
  function imgOf(p) { if (p.foto) return '<img src="' + esc(p.foto) + '" alt="">'; if (p.extra) return ""; var f = p.img == null ? p.id : p.img; return f ? '<img src="img/' + f + '.png" alt="">' : ""; }
  /* se puede vender: no es borrador, está disponible y todas sus opciones tienen precio */
  function sellable(p) { return !p.draft && p.disponible !== false && p.opts.every(function (o) { return typeof o[1] === "number"; }); }
  /* lo que falta para poder vender un borrador */
  function pendientes(p) {
    var L = [];
    if (p.opts.some(function (o) { return typeof o[1] !== "number"; })) L.push("Falta confirmar el precio");
    if (p.parts && p.parts.some(function (x) { return x.unSabor; }) && typeof p.repetidos !== "boolean") L.push("Falta confirmar si se pueden repetir sabores");
    (p.parts || []).forEach(function (x) { if (x.pend) L.push(x.label + ": " + x.pend.charAt(0).toLowerCase() + x.pend.slice(1)); });
    return L;
  }
  var SAUCES = ["Receta secreta sin salsa", "Piña habanero", "Mango habanero", "Tamarindo picante", "BBQ picante", "BBQ dulce"];
  /* color de cada sabor para su tarjeta (los mismos tonos del menú) */
  /* nombre de archivo de cada sabor (fotos de 5 y 10 piezas en img/) */
  var SLUG = { "Receta secreta sin salsa": "receta-secreta", "Piña habanero": "pina-habanero", "Mango habanero": "mango-habanero", "Tamarindo picante": "tamarindo-picante", "BBQ picante": "bbq-picante", "BBQ dulce": "bbq-dulce" };
  var TONO = { "Receta secreta sin salsa": "#c8803c", "Piña habanero": "#f2b33c", "Mango habanero": "#ff8f2a", "Tamarindo picante": "#8a2a1c", "BBQ picante": "#a8321a", "BBQ dulce": "#5a2414" };
  /* productos de alitas cuyo ranch se elige en el ticket (con o sin ranch) */
  var RANCH = { "alitas": 1, "alitas-mixto": 1 };
  /* lugares para bebidas en la pestaña Bebidas (se ven como "Próximamente" mientras no haya) */
  var BEBIDA_ESPACIOS = 5;
  var TRASH = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
  var METODOS = { efectivo: "Efectivo", transferencia: "Transferencia", tarjeta: "Tarjeta" };
  var TIPOS = { aqui: "Aquí", llevar: "Para llevar", domicilio: "Domicilio" };

  /* =========================================================
     DATOS (solo en este dispositivo)
     ========================================================= */
  var KEY = "carbon-caja-v1";
  var canSave = true;
  function blank() {
    return {
      shift: newShift(0),
      history: [],
      pendientes: [],
      settings: { prices: {}, soldOut: {}, wa: "527771138935", business: "El Carboncito" }
    };
  }
  function newShift(fondo) { return { id: Date.now(), openedAt: new Date().toISOString(), fondo: fondo || 0, next: 1, sales: [] }; }
  var db;
  try {
    var raw = window.localStorage.getItem(KEY);
    db = raw ? JSON.parse(raw) : blank();
    window.localStorage.setItem(KEY + "-test", "1");
    window.localStorage.removeItem(KEY + "-test");
  } catch (e) { canSave = false; db = db || blank(); }
  if (!db.settings) db.settings = blank().settings;
  if (!db.shift) db.shift = newShift(0);
  if (!db.history) db.history = [];
  if (!db.pendientes) db.pendientes = [];
  function save() {
    if (!canSave) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { canSave = false; document.getElementById("warn").hidden = false; }
  }
  if (!canSave) document.getElementById("warn").hidden = false;

  /* =========================================================
     CATÁLOGO COMPARTIDO con el menú web (/api/catalogo): precios, agotados y productos nuevos.
     El servidor manda; aquí queda una copia para seguir vendiendo sin internet.
     La cerveza es solo de la caja: su precio y si está agotada se quedan en este iPad.
     ========================================================= */
  var SOLO_CAJA = { cerveza: 1 };
  if (!db.catalogo) db.catalogo = { v: 0, precios: {}, agotado: {}, extra: [] };
  function aplicarCatalogo(c) {
    db.catalogo = { v: c.v || 0, precios: c.precios || {}, agotado: c.agotado || {}, extra: c.extra || [], tema: c.tema || "" };
    PRODUCTS = PRODUCTS.filter(function (p) { return !p.extra; });
    /* los productos nuevos desactivados se quedan (los pedidos viejos los nombran), pero no se venden */
    db.catalogo.extra.forEach(function (x) {
      PRODUCTS.push({ id: x.id, cat: x.cat, name: x.name, desc: x.desc, opts: [["", x.price]], quitar: [], foto: x.img, extra: true, disponible: x.disponible !== false });
    });
  }
  aplicarCatalogo(db.catalogo);
  function agotado(id) { return SOLO_CAJA[id] ? !!db.settings.soldOut[id] : !!db.catalogo.agotado[id]; }
  var catPidiendo = false;
  function cargarCatalogo() {
    if (catPidiendo) return;
    catPidiendo = true;
    withTimeout(fetch("/api/catalogo", { cache: "no-store" }), 12000).then(function (r) { return r.json(); }).then(function (d) {
      catPidiendo = false;
      if (!d || !d.ok || d.v === db.catalogo.v) return;
      aplicarCatalogo(d); save();
      /* sin interrumpir a quien está escribiendo en Ajustes */
      var a = document.activeElement;
      if (!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && state.view === "settings")) render();
    }).catch(function () { catPidiendo = false; });
  }
  /* guarda en el servidor; "Guardado" solo se avisa cuando el servidor lo confirma */
  function guardarCatalogo(cambiar, ok) {
    var c = JSON.parse(JSON.stringify(db.catalogo));
    cambiar(c);
    toast("Guardando…");
    return api("POST", "/api/catalogo", { precios: c.precios, agotado: c.agotado, extra: c.extra, tema: c.tema || "" }).then(function (d) {
      aplicarCatalogo(d); save(); toast(ok);
      var a = document.activeElement;
      if (!(a && a.getAttribute && a.getAttribute("data-price"))) render();
    }).catch(function (e) {
      render(); toast("No se guardó: " + (e.message === "tiempo" || /fetch|network|load/i.test(e.message) ? "sin conexión, vuelve a intentarlo" : e.message)); throw e;
    });
  }

  /* =========================================================
     UTILIDADES
     ========================================================= */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function money(n) {
    var v = Math.round(Number(n) || 0);
    var s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (v < 0 ? "-$" : "$") + s;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hora(iso) { var d = new Date(iso); var h = d.getHours(), m = d.getMinutes(); var ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + ":" + pad(m) + " " + ap; }
  function fecha(iso) {
    var d = new Date(iso);
    var dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    var meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return dias[d.getDay()] + " " + d.getDate() + " " + meses[d.getMonth()] + " " + d.getFullYear();
  }
  function prod(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function price(p, opt) {
    var c = db.catalogo.precios[p.id];
    if (!SOLO_CAJA[p.id]) return c && typeof c[opt] === "number" ? c[opt] : p.opts[opt][1];
    var o = db.settings.prices[p.id];
    if (o && o[opt] != null && o[opt] !== "") return Number(o[opt]);
    return p.opts[opt][1];
  }
  function minPrice(p) { var m = Infinity; for (var i = 0; i < p.opts.length; i++) m = Math.min(m, price(p, i)); return m; }
  function toast(msg) {
    var t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2200);
  }
  /* copiar texto (Safari viejo no tiene navigator.clipboard) */
  function copyText(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    var range = document.createRange(); range.selectNodeContents(ta);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    ta.setSelectionRange(0, text.length);
    var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  /* =========================================================
     ESTADO DE LA PANTALLA
     ========================================================= */
  var state = {
    view: "sell", cat: "burgers", showTicket: false,
    cart: [], tipo: "aqui", nota: "", dir: "", fromPend: null, ranch: true,
    openSale: null, confirm: null,
    pick: null, pay: null, pend: false, pendAsk: null, qr: null
  };

  /* =========================================================
     DOMICILIO: enlace de Google Maps y código QR de la ruta
     (WhatsApp no corre en el iPad con iOS 12: el repartidor escanea el QR con su celular)
     ========================================================= */
  function mapsLink(dir) { var m = String(dir || "").match(/https?:\/\/\S+/i); return m ? m[0] : ""; }
  function lugar(dir) {
    var q = String(dir || "").trim();
    if (q && !/temixco|cuernavaca|jiutepec|xochitepec|zapata|morelos/i.test(q)) q += ", Temixco, Morelos";
    return q || "Temixco, Morelos";
  }
  function buscarURL(dir) { return mapsLink(dir) || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(lugar(dir)); }
  function rutaURL(dir) { return mapsLink(dir) || "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(lugar(dir)); }
  function openRuta(title, dir, extra, url) { state.qr = { title: title, dir: dir, extra: extra || "", url: url || rutaURL(dir) }; renderLayer(); }
  /* destino de un pedido web: el punto que confirmó el cliente, su enlace de Maps o la dirección escrita */
  function puntoURL(c, ruta) {
    if (c.ubicacion) return "https://www.google.com/maps/" + (ruta ? "dir/?api=1&destination=" : "search/?api=1&query=") + encodeURIComponent(c.ubicacion.lat + "," + c.ubicacion.lng);
    return c.mapa || (ruta ? rutaURL(c.direccion) : buscarURL(c.direccion));
  }
  function qrSVG(text) {
    if (typeof window.qrcode !== "function") return "";
    try { var q = window.qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag(6, 4); } catch (e) { return ""; }
  }
  function qrHTML() {
    var r = state.qr, svg = qrSVG(r.url);
    return '<div class="overlay qr-ov"><div class="modal">' +
      '<div class="m-head"><h2>Ruta de entrega</h2><button type="button" class="x" data-act="close-qr" aria-label="Cerrar">×</button></div>' +
      '<div class="m-body"><p class="qr-t">' + esc(r.title) + "</p>" +
      (r.dir ? '<p class="qr-dir">' + esc(r.dir) + "</p>" : "") + (r.extra ? '<p class="note">' + esc(r.extra) + "</p>" : "") +
      (svg ? '<div class="qr">' + svg + '</div><p class="note" style="text-align:center">Escanéalo con la cámara del celular de quien reparte: abre la ruta en Google Maps.</p>'
        : '<p class="note">No se pudo dibujar el código. Copia el enlace y mándalo por WhatsApp desde el celular.</p>') + "</div>" +
      '<div class="m-foot"><div class="row2" style="width:100%"><a class="btn ghost" href="' + esc(r.url) + '" target="_blank" rel="noopener">Abrir mapa</a>' +
      '<button type="button" class="btn dark" data-act="copy-ruta">Copiar enlace</button><button type="button" class="btn" data-act="close-qr">Listo</button></div></div></div></div>';
  }

  /* =========================================================
     CUENTAS POR COBRAR, una por cliente y acumulables
     (comen en el local, o llegan en coche y se les lleva a su casa)
     ========================================================= */
  function pendTotal(p) { var t = 0; p.cart.forEach(function (l) { t += l.price * l.qty; }); return t; }
  function findPend(id) { for (var i = 0; i < db.pendientes.length; i++) if (String(db.pendientes[i].id) === String(id)) return db.pendientes[i]; return null; }
  function pendByName(nm) {
    var k = nm.trim().toLowerCase();
    for (var i = 0; i < db.pendientes.length; i++) if (db.pendientes[i].nota.trim().toLowerCase() === k) return db.pendientes[i];
    return null;
  }
  /* suma productos a una cuenta: lo igual se junta en la misma línea */
  function mergeLines(cart, lines) {
    lines.forEach(function (l) {
      for (var i = 0; i < cart.length; i++) if (cart[i].key === l.key) { cart[i].qty += l.qty; return; }
      cart.push(JSON.parse(JSON.stringify(l)));
    });
  }
  /* la dirección nueva manda; si no se escribió, se queda la que tenía la cuenta */
  function mergeDest(p) {
    if (state.tipo === "domicilio" && state.dir.trim()) { p.tipo = "domicilio"; p.dir = state.dir.trim(); }
    else if (state.tipo !== "aqui" || !p.tipo) p.tipo = state.tipo;
  }
  function resetTicket() { state.cart = []; state.ranch = true; state.nota = ""; state.tipo = "aqui"; state.dir = ""; state.fromPend = null; state.fromPedido = null; state.showTicket = false; }
  function holdTicket() {
    if (!state.cart.length) return;
    var nm = state.nota.trim();
    if (!nm) { toast("Escribe el nombre del cliente o la mesa para guardar la cuenta"); var ni = $("nota"); if (ni) ni.focus(); return; }
    var prev = state.fromPend ? findPend(state.fromPend) : null, msg;
    if (prev) {
      /* la cuenta abierta ya trae todo lo anterior: se reemplaza con lo que hay en el ticket */
      prev.nota = nm; prev.tipo = state.tipo; prev.dir = state.tipo === "domicilio" ? state.dir.trim() : "";
      prev.cart = JSON.parse(JSON.stringify(state.cart));
      msg = "Cuenta de " + nm + " guardada: " + money(pendTotal(prev));
    } else if ((prev = pendByName(nm))) {
      mergeLines(prev.cart, state.cart); mergeDest(prev);
      msg = "Se sumó a la cuenta de " + prev.nota + ": " + money(pendTotal(prev));
    } else {
      db.pendientes.push({ id: Date.now(), t: new Date().toISOString(), nota: nm, tipo: state.tipo, dir: state.tipo === "domicilio" ? state.dir.trim() : "",
        cart: JSON.parse(JSON.stringify(state.cart)) });
      msg = "Cuenta de " + nm + " guardada por cobrar";
    }
    save(); resetTicket(); toast(msg); render();
  }
  function loadPend(id) {
    var p = findPend(id); if (!p) return;
    if (state.cart.length && String(state.fromPend) !== String(p.id)) {
      /* hay un ticket abierto: se suma a esta cuenta y se abre todo junto */
      if (state.fromPend) { toast("Primero guarda o cobra la cuenta que está abierta"); return; }
      mergeLines(p.cart, state.cart); mergeDest(p); save();
      toast("Se sumó a la cuenta de " + p.nota);
    }
    state.cart = JSON.parse(JSON.stringify(p.cart)); state.ranch = conRanch(state.cart); state.nota = p.nota; state.tipo = p.tipo; state.dir = p.dir || "";
    state.fromPend = p.id; state.fromPedido = null; state.showTicket = true; state.view = "sell";
    closeLayer(); render();
  }
  function pendHTML() {
    var abierto = state.cart.length && !state.fromPend;
    var list = db.pendientes.slice().reverse().map(function (p) {
      var items = p.cart.map(function (l) {
        var d = lineDesc(l);
        return '<p><b>' + l.qty + " × " + esc(prod(l.pid).name) + "</b>" + (d ? ' <span class="note">' + esc(d) + "</span>" : "") + '<em>' + money(l.price * l.qty) + "</em></p>";
      }).join("");
      var dest = p.tipo === "domicilio"
        ? '<div class="p-dest"><span><b>Llevar a:</b> ' + (p.dir ? esc(p.dir) : "falta la dirección") + "</span>" +
          (p.dir ? '<button type="button" class="chk" data-pendruta="' + p.id + '">Ruta (QR)</button>' : "") + "</div>"
        : '<div class="p-dest"><span><b>Entrega:</b> ' + TIPOS[p.tipo] + "</span></div>";
      var ask = state.pendAsk === String(p.id);
      return '<div class="sale"><div class="h"><b>' + esc(p.nota) + "</b><span>desde las " + hora(p.t) + "</span><strong>" + money(pendTotal(p)) + "</strong></div>" +
        '<div class="p-items">' + items + "</div>" + dest +
        (ask ? '<div class="confirm"><p>¿Borrar la cuenta de ' + esc(p.nota) + "? No se cobra ni cuenta en el corte.</p>" +
          '<div class="row2"><button type="button" class="btn ghost" data-pendno="1">No</button><button type="button" class="btn red" data-penddel="' + p.id + '">Sí, borrar</button></div></div>'
          : '<div class="row2" style="margin-top:8px"><button type="button" class="btn ghost" data-pendask="' + p.id + '">Borrar</button><button type="button" class="btn" data-pendload="' + p.id + '">' +
            (abierto ? "Sumar ticket actual (" + money(cartTotal()) + ")" : "Abrir para cobrar o agregar") + "</button></div>") + "</div>";
    }).join("");
    return '<div class="overlay"><div class="modal">' +
      '<div class="m-head"><h2>Cuentas por cobrar</h2><button type="button" class="x" data-act="close-layer" aria-label="Cerrar">×</button></div>' +
      '<div class="m-body" style="padding-top:12px">' +
      (abierto && db.pendientes.length ? '<p class="note">Elige a qué cuenta sumar el ticket que tienes abierto.</p>' : "") +
      (list || '<p class="empty">No hay cuentas pendientes.</p>') + "</div></div></div>";
  }

  /* reloj */
  function tick() {
    var d = new Date(), h = d.getHours(), ap = h >= 12 ? "pm" : "am";
    $("clock").textContent = (h % 12 || 12) + ":" + pad(d.getMinutes()) + " " + ap;
  }
  tick(); setInterval(tick, 20000);

  /* =========================================================
     TICKET EN CURSO
     ========================================================= */
  function lineKey(l) {
    return [l.pid, l.opt, l.sauces.join("+"), l.quitar.slice().sort().join(","),
      (l.comps || []).map(function (c) { return c.sauces.join("+") + "/" + c.quitar.slice().sort().join(",") + "/" + (c.opcion || ""); }).join(";")].join("|");
  }
  /* salsas de una línea: "Salsa X", "Mitad X y mitad Y" (pedidos de antes) o "6 × X, 4 × Y" (contador de alitas) */
  function salsaTxt(s) {
    if (s.some(function (x) { return x.indexOf("×") >= 0; })) return s.join(", ");
    return s.length === 2 ? "Mitad " + s[0] + " y mitad " + s[1] : s.length === 1 ? (s[0] === SAUCES[0] ? SAUCES[0] : "Salsa " + s[0]) : "";
  }
  /* contador de alitas por sabor: { "BBQ dulce": 6, ... } */
  function alasTot(a) { var t = 0; for (var k in a) t += a[k]; return t; }
  function alasTxt(a) {
    var ks = SAUCES.filter(function (n) { return a[n]; });
    return ks.length === 1 ? [ks[0]] : ks.map(function (n) { return a[n] + " × " + n; });
  }
  function piezasParte(c) { return c.piezas || (c.opt === 1 ? 5 : 10); }
  /* todas con receta secreta de entrada */
  function alasBase(n) { var a = {}; if (n) a[SAUCES[0]] = n; return a; }
  /* filas con − y + por sabor; extra = atributos para saber a qué parte del combo pertenece */
  function contadorHTML(a, n, extra) {
    var t = alasTot(a);
    return "<p class=\"note\">Elige el sabor de cada alita. Llevas <b>" + t + " de " + n + "</b>" + (t === n ? " ✓" : "") + ".</p><div class=\"alas\">" + SAUCES.map(function (s) {
      return "<div class=\"ala-row\"><i style=\"background:" + TONO[s] + "\"></i><span>" + esc(s) + "</span><div class=\"step\">" +
        "<button type=\"button\"" + extra + " data-cala=\"" + esc(s) + "\" data-cd=\"-1\"" + (a[s] ? "" : " disabled") + ">−</button><output>" + (a[s] || 0) + "</output>" +
        "<button type=\"button\"" + extra + " data-cala=\"" + esc(s) + "\" data-cd=\"1\"" + (t < n || (s !== SAUCES[0] && a[SAUCES[0]]) ? "" : " disabled") + ">+</button></div></div>";
    }).join("") + "</div>";
  }
  /* opción elegida en un combo: en la caja se guarda el id; en un pedido web llega el nombre */
  function optName(x) { var o = x ? prod(x) : null; return o ? o.name : x || ""; }
  /* una parte de combo: "4 alitas: Salsa BBQ dulce, sin ranch" */
  function partTxt(label, sauces, quitar, opcion) {
    var b = [];
    if (sauces.length) b.push(salsaTxt(sauces));
    if (opcion) b.push(optName(opcion));
    if (quitar.length) b.push("sin " + quitar.join(", ").toLowerCase());
    return label + (b.length ? ": " + b.join(", ") : "");
  }
  function lineDesc(l) {
    var p = prod(l.pid), parts = [];
    if (p.parts) return p.parts.map(function (c, i) { return partTxt(c.label, l.comps[i].sauces, l.comps[i].quitar, l.comps[i].opcion); }).join(" · ");
    if (p.opts.length > 1) parts.push(p.opts[l.opt][0]);
    if (l.sauces.length) parts.push(salsaTxt(l.sauces));
    if (l.quitar.length) parts.push("Sin " + l.quitar.join(", ").toLowerCase());
    return parts.join(" · ");
  }
  function cartTotal() { var t = 0; state.cart.forEach(function (l) { t += l.price * l.qty; }); return t; }
  function cartCount() { var n = 0; state.cart.forEach(function (l) { n += l.qty; }); return n; }
  function addLine(l) {
    l.key = lineKey(l);
    for (var i = 0; i < state.cart.length; i++) if (state.cart[i].key === l.key) { state.cart[i].qty += l.qty; return; }
    state.cart.push(l);
  }
  /* ranch de las alitas: se elige una vez en el ticket y aplica a todas sus alitas */
  function hayAlitas() { return state.cart.some(function (l) { return RANCH[l.pid]; }); }
  function conRanch(cart) { return !cart.some(function (l) { return RANCH[l.pid] && l.quitar.indexOf("Ranch") >= 0; }); }
  function setRanch(con) {
    state.ranch = con;
    var lines = state.cart; state.cart = [];
    lines.forEach(function (l) {
      if (RANCH[l.pid]) {
        l.quitar = l.quitar.filter(function (q) { return q !== "Ranch"; });
        if (!con) l.quitar.push("Ranch");
      }
      addLine(l);   /* recalcula la clave y junta las líneas que quedaron iguales */
    });
  }

  /* =========================================================
     VISTAS
     ========================================================= */
  function render() {
    var nav = document.querySelectorAll("#nav button");
    for (var i = 0; i < nav.length; i++) nav[i].className = nav[i].getAttribute("data-view") === state.view ? "on" : "";
    var v = $("view");
    if (state.view === "sell") pintar(v, sellHTML(), "sell:" + state.cat);
    else if (state.view === "sales") pintar(v, salesHTML(), "sales");
    else if (state.view === "close") pintar(v, closeHTML(), "close");
    else if (state.view === "orders") pintar(v, ordersHTML(), "orders:" + ped.tab);
    else pintar(v, settingsHTML(), "settings");
  }
  /* Redibujar con innerHTML deja cada lista hasta arriba: si se vuelve a pintar lo mismo (misma pantalla o ventana),
     se guarda dónde iba cada parte que se desliza y se regresa ahí. Al cambiar de pantalla sí empieza arriba. */
  var DESLIZA = [".page", ".grid", ".lines", ".m-body", ".cm-body"];
  function pintar(el, html, clave) {
    var antes = {}, mismo = el.getAttribute("data-pinta") === clave;
    if (mismo) DESLIZA.forEach(function (s) { var x = el.querySelector(s); if (x) antes[s] = x.scrollTop; });
    el.innerHTML = html;
    el.setAttribute("data-pinta", clave);
    if (mismo) DESLIZA.forEach(function (s) { var x = el.querySelector(s); if (x && antes[s]) x.scrollTop = antes[s]; });
  }

  /* tarjetas: solo foto grande y nombre. Los precios se ven en el ticket. */
  function sellHTML() {
    var tiles;
    if (state.cat === "wings") {
      /* alitas: un botón por sabor */
      var agotadas = agotado("alitas");
      tiles = SAUCES.map(function (n) {
        return '<button type="button" class="tile sabor' + (agotadas ? " out" : "") + '" data-sabor="' + esc(n) + '" style="border-bottom-color:' + TONO[n] + '">' +
          '<img src="img/alitas-' + SLUG[n] + '-10.png" alt=""><b>' + esc(n) + "</b></button>";
      }).join("") +
        /* para pedidos con varios sabores: se reparten las alitas con un contador */
        '<button type="button" class="tile sabor perso' + (agotadas ? " out" : "") + '" data-act="alas-perso"><img src="img/alitas.png" alt=""><b>Alitas personalizadas</b></button>';
    } else {
      tiles = PRODUCTS.filter(function (p) { return p.cat === state.cat && !p.hidden && !(p.extra && p.disponible === false) && !(p.promo && !p.disponible); }).map(function (p) {
        var out = agotado(p.id) || p.disponible === false, draft = !sellable(p) && p.disponible !== false;
        return '<button type="button" class="tile' + (draft ? " draft" : out ? " out" : "") + '" data-add="' + p.id + '">' + imgOf(p) +
          "<b>" + esc(p.tile || p.name) + "</b>" + (p.promo ? '<small class="promo-t tile-t" data-fin="' + p.promo.fin + '">' + resto(p.promo.fin) + "</small>" : "") + "</button>";
      }).join("");
    }
    if (state.cat === "drinks") {
      /* espacios "Próximamente" hasta completar BEBIDA_ESPACIOS; las bebidas reales los van ocupando */
      var hay = PRODUCTS.filter(function (p) { return p.cat === "drinks" && !p.hidden && !(p.extra && p.disponible === false); }).length;
      for (var b = hay; b < BEBIDA_ESPACIOS; b++) tiles += '<div class="tile slot"><span class="slot-pic"></span><b>Próximamente</b><small>Bebida por confirmar</small></div>';
    }
    if (!tiles) tiles = '<p class="empty">No hay productos en esta sección.</p>';
    var cats = catsVenta().map(function (c) { return '<button type="button" data-cat="' + c.id + '" class="' + (c.id === state.cat ? "on" : "") + '">' + esc(c.name) + "</button>"; }).join("") +
      (db.pendientes.length ? '<button type="button" class="pend" data-act="show-pend">Cuentas (' + db.pendientes.length + ")</button>" : "");
    var n = cartCount(), t = cartTotal();
    return '<div class="sell' + (state.showTicket ? " show-ticket" : "") + '">' +
      '<div class="catalog"><div class="cats">' + cats + '</div><div class="grid">' + tiles + "</div>" +
      '<div class="mini-bar"><button type="button" class="btn' + (n ? "" : " ghost") + '" data-act="show-ticket">Ver ticket (' + n + ") · " + money(t) + "</button></div></div>" +
      '<aside class="ticket">' + ticketHTML() + "</aside></div>";
  }
  function ticketHTML() {
    var lines = state.cart.length ? state.cart.map(function (l, i) {
      var p = prod(l.pid), d = lineDesc(l);
      return '<div class="line"><div class="txt"><b>' + esc(p.name) + "</b>" + (d ? "<small>" + esc(d) + "</small>" : "") + "<em>" + money(l.price * l.qty) + "</em></div>" +
        '<div class="step"><button type="button" data-line="' + i + '" data-d="-1">−</button><output>' + l.qty + '</output><button type="button" data-line="' + i + '" data-d="1">+</button></div></div>';
    }).join("") : '<p class="empty">Toca un producto para agregarlo.</p>';
    var tipos = Object.keys(TIPOS).map(function (k) { return '<button type="button" data-tipo="' + k + '" class="' + (state.tipo === k ? "on" : "") + '">' + TIPOS[k] + "</button>"; }).join("");
    var t = cartTotal(), dis = state.cart.length ? "" : " disabled";
    var dir = state.tipo === "domicilio" ? '<div class="dir"><input id="dir" type="text" placeholder="Dirección o enlace de Google Maps" value="' + esc(state.dir) + '" autocomplete="off">' +
      '<button type="button" data-act="maps">Buscar en Maps</button></div>' : "";
    var ranch = hayAlitas() ? '<div class="seg ranch"><span>Alitas</span><button type="button" data-ranch="1" class="' + (state.ranch ? "on" : "") + '">Con ranch</button>' +
      '<button type="button" data-ranch="0" class="' + (state.ranch ? "" : "on") + '">Sin ranch</button></div>' : "";
    /* arriba: vaciar (rojo, con bote de basura) y por cobrar (verde), lejos del botón de cobrar */
    return '<div class="t-head"><button type="button" class="back-cat" data-act="hide-ticket">‹ Productos</button>' +
      '<div class="t-title"><h2>Ticket</h2><span class="folio">' + (state.fromPend ? "Cuenta por cobrar" : "Venta #" + db.shift.next) + "</span></div>" +
      '<button type="button" class="t-btn trash" data-act="clear" aria-label="Vaciar ticket"' + dis + ">" + TRASH + "Vaciar</button>" +
      '<button type="button" class="t-btn hold" data-act="hold"' + dis + ">Por cobrar</button></div>" +
      '<div class="lines">' + lines + "</div>" +
      '<div class="t-meta">' + ranch + '<div class="seg">' + tipos + "</div>" + dir + '<input id="nota" type="text" placeholder="Nombre del cliente o mesa" value="' + esc(state.nota) + '" autocomplete="off"></div>' +
      '<div class="t-foot"><div class="total"><span>Total</span><b>' + money(t) + "</b></div>" +
      '<button type="button" class="btn pay-btn" data-act="pay"' + dis + ">Cobrar " + money(t) + "</button></div>";
  }

  function liveSales() { return db.shift.sales.filter(function (s) { return !s.cancelada; }); }
  function salesHTML() {
    var list = db.shift.sales.slice().reverse().map(function (s) {
      var open = state.openSale === s.folio;
      var items = s.lines.map(function (l) { return l.qty + " " + l.name; }).join(", ");
      var detail = "";
      if (open) {
        detail = '<div class="detail">' + s.lines.map(function (l) {
          return "<p>" + l.qty + " × " + esc(l.name) + (l.desc ? " <span class='note'>(" + esc(l.desc) + ")</span>" : "") + " · " + money(l.price * l.qty) + "</p>";
        }).join("") +
          "<p><b>Pago:</b> " + METODOS[s.metodo] + (s.metodo === "efectivo" && s.recibido ? " · recibió " + money(s.recibido) + " · cambio " + money(s.cambio) : "") + "</p>" +
          "<p><b>Entrega:</b> " + TIPOS[s.tipo] + (s.nota ? " · " + esc(s.nota) : "") + "</p>" +
          (s.tipo === "domicilio" ? "<p><b>Dirección:</b> " + (s.dir ? esc(s.dir) : "sin dirección") + "</p>" +
            '<div class="row2" style="margin-top:6px"><button type="button" class="btn dark" data-ruta="' + s.folio + '">Ruta de entrega (QR)</button></div>' : "") +
          (s.cancelada ? "" : (state.confirm === "cancel-" + s.folio
            ? '<div class="confirm"><p>¿Cancelar la venta #' + s.folio + " por " + money(s.total) + '? No cuenta en el corte.</p><div class="row2"><button type="button" class="btn ghost" data-act="no">No</button><button type="button" class="btn red" data-cancel="' + s.folio + '">Sí, cancelar venta</button></div></div>'
            : '<div class="row2" style="margin-top:10px"><button type="button" class="btn ghost" data-ask="cancel-' + s.folio + '">Cancelar venta</button></div>')) + "</div>";
      }
      return '<div class="sale' + (s.cancelada ? " cancel" : "") + '" data-sale="' + s.folio + '"><div class="h"><b>#' + s.folio + "</b><span>" + hora(s.t) + " · " + METODOS[s.metodo] +
        (s.cancelada ? '<i class="tag red">Cancelada</i>' : "") + "</span><strong>" + money(s.total) + "</strong></div><small>" + esc(items) + "</small>" + detail + "</div>";
    }).join("");
    var live = liveSales(), tot = 0; live.forEach(function (s) { tot += s.total; });
    return '<div class="page"><div class="page-in"><h2>Ventas del turno</h2>' +
      '<div class="kpis"><div class="kpi main"><span>Vendido</span><b>' + money(tot) + '</b></div><div class="kpi"><span>Ventas</span><b>' + live.length + "</b></div></div>" +
      (list || '<p class="empty">Aún no hay ventas en este turno.</p>') + "</div></div>";
  }

  /* resumen del corte */
  function summary(shift) {
    var r = { ventas: 0, total: 0, metodo: { efectivo: 0, transferencia: 0, tarjeta: 0 }, canceladas: 0, montoCancel: 0, prods: {} };
    shift.sales.forEach(function (s) {
      if (s.cancelada) { r.canceladas++; r.montoCancel += s.total; return; }
      r.ventas++; r.total += s.total; r.metodo[s.metodo] += s.total;
      s.lines.forEach(function (l) {
        var k = l.name + (l.opt ? " · " + l.opt : "");
        if (!r.prods[k]) r.prods[k] = { qty: 0, total: 0 };
        r.prods[k].qty += l.qty; r.prods[k].total += l.price * l.qty;
      });
    });
    r.caja = (shift.fondo || 0) + r.metodo.efectivo;
    r.promedio = r.ventas ? r.total / r.ventas : 0;
    return r;
  }
  function summaryText(shift) {
    var r = summary(shift), L = [];
    L.push("*Corte de caja · " + db.settings.business + "*");
    L.push(fecha(shift.openedAt) + ", de " + hora(shift.openedAt) + " a " + hora(shift.closedAt || new Date().toISOString()));
    L.push("");
    L.push("Ventas: " + r.ventas + " · Total: " + money(r.total));
    L.push("Efectivo: " + money(r.metodo.efectivo));
    L.push("Transferencia: " + money(r.metodo.transferencia));
    L.push("Tarjeta: " + money(r.metodo.tarjeta));
    L.push("Fondo inicial: " + money(shift.fondo || 0));
    L.push("*Efectivo en caja: " + money(r.caja) + "*");
    if (r.canceladas) L.push("Canceladas: " + r.canceladas + " (" + money(r.montoCancel) + ")");
    L.push("");
    L.push("Productos:");
    Object.keys(r.prods).sort(function (a, b) { return r.prods[b].qty - r.prods[a].qty; }).forEach(function (k) {
      L.push("• " + r.prods[k].qty + " " + k + " · " + money(r.prods[k].total));
    });
    return L.join("\n");
  }
  function closeHTML() {
    var sh = db.shift, r = summary(sh);
    var rows = Object.keys(r.prods).sort(function (a, b) { return r.prods[b].qty - r.prods[a].qty; }).map(function (k) {
      return "<tr><td>" + esc(k) + '</td><td class="r">' + r.prods[k].qty + '</td><td class="r">' + money(r.prods[k].total) + "</td></tr>";
    }).join("");
    var hist = db.history.slice().reverse().map(function (h, i) {
      var hr = summary(h), idx = db.history.length - 1 - i, open = state.openSale === "h" + idx;
      return '<div class="sale" data-hist="' + idx + '"><div class="h"><b>' + esc(fecha(h.openedAt)) + "</b><span>" + hr.ventas + " ventas</span><strong>" + money(hr.total) + "</strong></div>" +
        (open ? '<pre class="summary">' + esc(summaryText(h)) + "</pre>" : "") + "</div>";
    }).join("");
    var wa = "https://wa.me/" + db.settings.wa + "?text=" + encodeURIComponent(summaryText(sh));
    return '<div class="page"><div class="page-in"><h2>Corte de caja</h2>' +
      '<p class="note">Turno abierto el ' + esc(fecha(sh.openedAt)) + " a las " + hora(sh.openedAt) + ".</p>" +
      '<div class="kpis">' +
      '<div class="kpi main"><span>Total vendido</span><b>' + money(r.total) + "</b></div>" +
      '<div class="kpi"><span>Efectivo en caja</span><b>' + money(r.caja) + "</b></div>" +
      '<div class="kpi"><span>Ventas</span><b>' + r.ventas + "</b></div>" +
      '<div class="kpi"><span>Ticket promedio</span><b>' + money(r.promedio) + "</b></div></div>" +
      '<div class="card"><table><tr><th>Forma de pago</th><th class="r">Monto</th></tr>' +
      "<tr><td>Efectivo</td><td class='r'>" + money(r.metodo.efectivo) + "</td></tr>" +
      "<tr><td>Transferencia</td><td class='r'>" + money(r.metodo.transferencia) + "</td></tr>" +
      "<tr><td>Tarjeta</td><td class='r'>" + money(r.metodo.tarjeta) + "</td></tr>" +
      '<tr><td>Fondo inicial <button type="button" class="chk" data-act="edit-fondo">Cambiar</button></td><td class="r">' + money(sh.fondo || 0) + "</td></tr>" +
      (r.canceladas ? "<tr><td>Canceladas (" + r.canceladas + ")</td><td class='r'>" + money(r.montoCancel) + "</td></tr>" : "") +
      "</table>" +
      (state.confirm === "fondo" ? '<div class="field" style="margin-top:10px"><span>Fondo inicial (con cuánto efectivo empezó la caja)</span><input id="fondo" type="number" inputmode="decimal" value="' + (sh.fondo || "") + '"></div><div class="row2"><button type="button" class="btn ghost" data-act="no">Cancelar</button><button type="button" class="btn" data-act="save-fondo">Guardar fondo</button></div>' : "") +
      "</div>" +
      "<h3>Productos vendidos</h3>" +
      '<div class="card">' + (rows ? '<table><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Importe</th></tr>' + rows + "</table>" : '<p class="note">Todavía no hay ventas.</p>') + "</div>" +
      (db.pendientes.length ? '<div class="confirm"><p>Hay ' + db.pendientes.length + " cuenta" + (db.pendientes.length > 1 ? "s" : "") + " por cobrar (" +
        money(db.pendientes.reduce(function (a, p) { return a + pendTotal(p); }, 0)) + "). No cuentan en el corte hasta cobrarlas.</p>" +
        '<div class="row2"><button type="button" class="btn dark" data-act="show-pend">Ver cuentas por cobrar</button></div></div>' : "") +
      "<h3>Enviar y cerrar</h3>" +
      '<div class="row2"><a class="btn green" href="' + esc(wa) + '" target="_blank" rel="noopener">Enviar por WhatsApp</a><button type="button" class="btn dark" data-act="copy-sum">Copiar resumen</button></div>' +
      (state.confirm === "close"
        ? '<div class="confirm"><p>¿Cerrar el turno? Las ventas se guardan en el historial y la caja empieza en cero.</p><div class="row2"><button type="button" class="btn ghost" data-act="no">No</button><button type="button" class="btn red" data-act="close-shift">Sí, cerrar turno</button></div></div>'
        : '<div class="row2" style="margin-top:10px"><button type="button" class="btn" data-ask="close">Cerrar turno</button></div>') +
      (hist ? "<h3>Turnos anteriores</h3>" + hist : "") +
      "</div></div>";
  }

  /* productos nuevos (se crean aquí y salen también en el menú web) */
  function catNombre(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].name; return id; }
  function productosHTML() {
    var f = state.prodForm;
    var lista = db.catalogo.extra.map(function (x) {
      return '<div class="px' + (x.disponible === false ? " off" : "") + '">' + (x.img ? '<img src="' + esc(x.img) + '" alt="">' : '<span class="px-sin"></span>') +
        "<div><b>" + esc(x.name) + "</b><small>" + esc(catNombre(x.cat)) + " · " + money(x.price) + (x.disponible === false ? " · Desactivado" : "") + "</small></div>" +
        '<button type="button" class="btn ghost" data-pedit="' + esc(x.id) + '">Editar</button></div>';
    }).join("");
    var form = !f ? '<button type="button" class="btn dark" data-act="prod-new">Agregar producto</button>' :
      '<div class="pform"><h4>' + (f.id ? "Editar producto" : "Producto nuevo") + "</h4>" +
      '<label class="field"><span>Nombre</span><input id="pf-name" type="text" maxlength="40" value="' + esc(f.name) + '"></label>' +
      '<label class="field"><span>Descripción</span><input id="pf-desc" type="text" maxlength="140" value="' + esc(f.desc) + '"></label>' +
      '<div class="row2"><label class="field"><span>Precio</span><input id="pf-price" type="number" inputmode="numeric" min="1" max="5000" value="' + esc(f.price) + '"></label>' +
      '<label class="field"><span>Categoría</span><select id="pf-cat">' + CATS.map(function (c) { return '<option value="' + c.id + '"' + (f.cat === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("") + "</select></label></div>" +
      '<div class="pf-foto">' + (f.foto || f.img ? '<img src="' + esc(f.foto || f.img) + '" alt="">' : '<span class="px-sin"></span>') +
      '<label class="btn ghost pf-pick">' + (f.foto || f.img ? "Cambiar foto" : "Elegir foto") + '<input id="pf-file" class="pf-file" type="file" accept="image/*"></label></div>' +
      '<p class="note">JPG o PNG. Se achica sola a 800 px antes de subirla (máximo 400 KB). Sin foto se muestra solo el nombre.</p>' +
      '<button type="button" class="chk' + (f.disponible ? "" : " on") + '" data-act="prod-toggle">' + (f.disponible ? "Disponible" : "Desactivado: no se vende") + "</button>" +
      '<p class="l-err"' + (f.err ? "" : " hidden") + ">" + esc(f.err || "") + "</p>" +
      '<div class="row2"><button type="button" class="btn ghost" data-act="prod-cancel">Cancelar</button><button type="button" class="btn" data-act="prod-save"' + (f.busy ? " disabled" : "") + ">" + (f.busy ? "Guardando…" : "Guardar") + "</button></div></div>";
    return '<div class="card prods">' + (lista || '<p class="note">Todavía no hay productos nuevos.</p>') + form +
      '<p class="note">Salen en la caja y en el menú web. No se borran: se desactivan, para que los pedidos anteriores los sigan nombrando.</p></div>';
  }
  function slug(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20) || "producto"; }
  /* la foto se achica en el iPad (canvas) y se sube como PNG (si tiene transparencia y cabe) o JPG */
  var FOTO_MAX = 390 * 1024;
  function achicarFoto(file) {
    var f = state.prodForm;
    if (!/^image\//.test(file.type || "image/")) { f.err = "Ese archivo no es una foto."; return render(); }
    var rd = new FileReader();
    rd.onload = function () {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, 800 / Math.max(im.width, im.height)), w = Math.max(1, Math.round(im.width * k)), h = Math.max(1, Math.round(im.height * k));
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        var cx = cv.getContext("2d"), url = "";
        cx.drawImage(im, 0, 0, w, h);
        if (file.type === "image/png") url = cv.toDataURL("image/png");
        if (!url || url.length * 0.75 > FOTO_MAX) {
          cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h); cx.drawImage(im, 0, 0, w, h);
          for (var q = 0.85; q > 0.35; q -= 0.1) { url = cv.toDataURL("image/jpeg", q); if (url.length * 0.75 <= FOTO_MAX) break; }
        }
        if (url.length * 0.75 > FOTO_MAX) { f.err = "No se pudo achicar la foto."; return render(); }
        f.foto = url; f.err = ""; render();
      };
      im.onerror = function () { f.err = "No se pudo leer la foto."; render(); };
      im.src = rd.result;
    };
    rd.onerror = function () { f.err = "No se pudo leer la foto."; render(); };
    rd.readAsDataURL(file);
  }
  function guardarProducto() {
    var f = state.prodForm; if (!f || f.busy) return;
    var precio = Number(f.price);
    if (!String(f.name).trim()) { f.err = "Falta el nombre."; return render(); }
    if (!(precio >= 1 && precio <= 5000 && Math.round(precio) === precio)) { f.err = "El precio debe ser un número entero de 1 a 5000."; return render(); }
    var id = f.id || ("x-" + slug(f.name) + "-" + Date.now().toString(36).slice(-5));
    f.busy = true; f.err = ""; render();
    var subir = f.foto ? api("POST", "/api/catalogo/img", { id: id, foto: f.foto }).then(function (d) { return d.img; }) : Promise.resolve(f.img);
    subir.then(function (img) {
      var x = { id: id, name: String(f.name).trim(), desc: String(f.desc).trim(), price: precio, cat: f.cat, img: img || "", disponible: f.disponible };
      f.img = img || ""; f.foto = "";
      return guardarCatalogo(function (c) {
        var i = -1; c.extra.forEach(function (e, k) { if (e.id === id) i = k; });
        if (i >= 0) c.extra[i] = x; else c.extra.push(x);
      }, x.disponible ? "Producto guardado: ya sale en el menú web" : "Producto guardado y desactivado: no se vende");
    }).then(function () { state.prodForm = null; render(); }).catch(function (e) { f.busy = false; f.err = e.message; render(); });
  }
  /* =========================================================
     PROMOS DEL DÍA: se crean en Ajustes y salen en el menú web con su contador.
     El servidor pone la hora, cuenta los lugares y cobra el precio de la oferta.
     En la caja se venden desde la pestaña "Promos"; cada venta ocupa un lugar.
     ========================================================= */
  var promos = { list: [], dinamicas: [], desfase: 0, pidiendo: false, ok: null, vueltas: 0 };
  var DIN_TXT = { primeros: "Los primeros clientes", primero: "El primero que la pida se la lleva", reto: "Reto en el local" };
  function ahoraSrv() { return Date.now() + promos.desfase; }
  function resto(fin) {
    var s = Math.max(0, Math.round((fin - ahoraSrv()) / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h ? h + " h " + m + " min" : m + ":" + pad(s % 60);
  }
  function dinTxt(d) {
    if (d.tipo === "primeros") return "Los primeros " + d.cupo + " clientes · quedan " + d.quedan;
    if (d.tipo === "primero") return d.quedan ? "El primero que la pida se la lleva" : "Ya se la llevaron";
    return "Reto en el local: " + d.texto + (d.cupo > 1 ? " (" + d.cupo + " lugares, quedan " + d.quedan + ")" : d.quedan ? "" : " · ya hubo ganador");
  }
  function itemsTxt(pr) { return pr.items.map(function (it) { return it.qty + "× " + it.name + (it.optLabel ? " (" + it.optLabel + ")" : ""); }).join(" + "); }
  function aplicarPromos(d) {
    promos.list = d.promos || []; if (d.dinamicas) promos.dinamicas = d.dinamicas;
    if (typeof d.ahora === "number") promos.desfase = d.ahora - Date.now();
    PRODUCTS = PRODUCTS.filter(function (p) { return !p.promo; });
    promos.list.forEach(function (pr) {
      var primero = pr.items.length ? prod(pr.items[0].id) : null;
      PRODUCTS.push({ id: pr.id, cat: "promos", name: pr.nombre, desc: itemsTxt(pr) + " · " + dinTxt(pr.dinamica), opts: [["", pr.precio]], quitar: [], promo: pr,
        img: primero ? (primero.img == null ? primero.id : primero.img) : "", foto: primero && primero.foto, disponible: pr.vigente });
    });
    if (state.cat === "promos" && !hayPromos()) state.cat = "burgers";
  }
  function hayPromos() { return promos.list.some(function (pr) { return pr.vigente; }); }
  function catsVenta() { return (hayPromos() ? [{ id: "promos", name: "Promos" }] : []).concat(CATS); }
  function cargarPromos() {
    if (!token() || promos.pidiendo) return;
    promos.pidiendo = true;
    api("GET", "/api/promos").then(function (d) {
      promos.pidiendo = false; promos.ok = true; aplicarPromos(d);
      var a = document.activeElement;
      if (!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) { if (state.view === "sell" || state.view === "settings") render(); }
    }).catch(function () { promos.pidiendo = false; promos.ok = false; });
  }
  function guardarPromos(cambiar, ok) {
    var c = {
      promos: promos.list.map(function (pr) { return { id: pr.id, nombre: pr.nombre === "Oferta flash" ? "" : pr.nombre, items: pr.items.map(function (it) { return { id: it.id, opt: it.opt, qty: it.qty }; }), precio: pr.precio, dinamica: pr.dinamica, terminada: pr.terminada }; }),
      dinamicas: promos.dinamicas.slice()
    };
    cambiar(c);
    toast("Guardando…");
    return api("POST", "/api/promos", c).then(function (d) { aplicarPromos(d); render(); toast(ok); })
      .catch(function (e) { render(); toast("No se guardó: " + (e.message === "tiempo" || /fetch|network|load/i.test(e.message) ? "sin conexión, vuelve a intentarlo" : e.message)); throw e; });
  }
  /* un producto entra a una oferta si se sirve como viene: sin sabores ni refresco por elegir */
  function comoViene(p) {
    if (!p || p.sauces) return false;
    return !p.parts || p.parts.every(function (c) { var r = c.pid ? prod(c.pid) : null; return !c.opciones && !c.unSabor && (c.sabor || !(r && r.sauces)); });
  }
  function paraOferta() {
    var L = [];
    PRODUCTS.forEach(function (p) {
      if (SOLO_CAJA[p.id] || p.promo || !sellable(p) || !comoViene(p) || (p.extra && p.disponible === false)) return;
      p.opts.forEach(function (o, i) { L.push({ v: p.id + "|" + i, t: p.name + (p.opts.length > 1 ? " · " + o[0] : ""), p: p, opt: i }); });
    });
    return L;
  }
  function nuevaPromo() {
    var L = paraOferta();
    state.promoForm = { nombre: "", items: [], sel: L.length ? L[0].v : "", qty: "1", precio: "", horas: "1", minutos: "0", din: "primeros", cupo: "5", texto: "", guardarReto: true, err: "", busy: false };
  }
  function normalForm(f) { var t = 0; f.items.forEach(function (it) { var p = prod(it.id); if (p) t += price(p, it.opt) * it.qty; }); return t; }
  function promosHTML() {
    var f = state.promoForm;
    var lista = promos.list.map(function (pr) {
      var viva = pr.vigente, txt = pr.terminada ? "Terminada" : ahoraSrv() >= pr.fin ? "Se acabó el tiempo" : !viva ? "Sin lugares" : "Termina en " + resto(pr.fin);
      return '<div class="px promo' + (viva ? "" : " off") + '"><div><b>' + esc(pr.nombre) + " · " + money(pr.precio) + " <s>" + money(pr.normal) + "</s></b>" +
        "<small>" + esc(itemsTxt(pr)) + "</small><small>" + esc(dinTxt(pr.dinamica)) + " · " + pr.usados + " vendidas</small>" +
        '<small class="promo-t" data-fin="' + pr.fin + '">' + esc(txt) + "</small></div>" +
        (viva ? '<button type="button" class="btn ghost" data-pterm="' + esc(pr.id) + '">Terminar</button>' : "") + "</div>";
    }).join("");
    var form = "";
    if (f) {
      var L = paraOferta(), din = '<option value="primeros"' + (f.din === "primeros" ? " selected" : "") + ">Los primeros N clientes</option>" +
        '<option value="primero"' + (f.din === "primero" ? " selected" : "") + ">El primero que la pida se la lleva</option>" +
        promos.dinamicas.map(function (d) { return '<option value="' + esc(d.id) + '"' + (f.din === d.id ? " selected" : "") + ">Reto: " + esc(d.texto) + "</option>"; }).join("") +
        '<option value="nuevo"' + (f.din === "nuevo" ? " selected" : "") + ">Nuevo reto (instrucciones)…</option>";
      var horas = ""; for (var h = 0; h <= 12; h++) horas += '<option value="' + h + '"' + (String(h) === f.horas ? " selected" : "") + ">" + h + " h</option>";
      var mins = ""; [0, 5, 10, 15, 20, 30, 45].forEach(function (m) { mins += '<option value="' + m + '"' + (String(m) === f.minutos ? " selected" : "") + ">" + m + " min</option>"; });
      form = '<div class="pform"><h4>Nueva oferta</h4>' +
        '<label class="field"><span>Nombre (opcional)</span><input id="pr-nombre" type="text" maxlength="40" placeholder="Oferta flash" value="' + esc(f.nombre) + '"></label>' +
        '<div class="field"><span>Productos</span>' + (f.items.length ? f.items.map(function (it, i) {
          var p = prod(it.id); return '<div class="pr-item"><b>' + it.qty + "×</b> " + esc(p ? p.name : it.id) + (p && p.opts.length > 1 ? " · " + esc(p.opts[it.opt][0]) : "") + ' <button type="button" class="chk" data-pritem="' + i + '">Quitar</button></div>';
        }).join("") : '<p class="note">Agrega uno o más productos. Solo entran los que se sirven como vienen (sin sabor ni refresco por elegir).</p>') +
        '<div class="pr-add"><select id="pr-sel">' + L.map(function (o) { return '<option value="' + o.v + '"' + (o.v === f.sel ? " selected" : "") + ">" + esc(o.t) + "</option>"; }).join("") + "</select>" +
        '<input id="pr-qty" type="number" inputmode="numeric" min="1" max="10" value="' + esc(f.qty) + '"><button type="button" class="btn dark" data-act="pr-add">Agregar</button></div></div>' +
        '<div class="row2"><label class="field"><span>Precio de la oferta' + (f.items.length ? " (normal " + money(normalForm(f)) + ")" : "") + '</span><input id="pr-precio" type="number" inputmode="numeric" min="1" max="5000" value="' + esc(f.precio) + '"></label>' +
        '<div class="field"><span>Dura</span><div class="pr-dur"><select id="pr-horas">' + horas + '</select><select id="pr-min">' + mins + "</select></div></div></div>" +
        '<label class="field"><span>Dinámica</span><select id="pr-din">' + din + "</select></label>" +
        (f.din === "primeros" ? '<label class="field"><span>¿Cuántos clientes pueden entrar?</span><input id="pr-cupo" type="number" inputmode="numeric" min="1" max="500" value="' + esc(f.cupo) + '"></label>' : "") +
        (f.din === "nuevo" ? '<label class="field"><span>Instrucciones del reto</span><input id="pr-texto" type="text" maxlength="140" placeholder="Ej. El primero que cante una rima completa" value="' + esc(f.texto) + '"></label>' +
          '<button type="button" class="chk' + (f.guardarReto ? "" : " on") + '" data-act="pr-guardar-reto">' + (f.guardarReto ? "✓ Guardar este reto para otras veces" : "Solo para esta oferta") + "</button>" : "") +
        (f.din !== "primeros" && f.din !== "primero" ? '<p class="note">Los retos se juegan en el local: el menú muestra las instrucciones y la oferta se cobra aquí en la caja, en la pestaña Promos.</p>' : "") +
        '<p class="l-err"' + (f.err ? "" : " hidden") + ">" + esc(f.err || "") + "</p>" +
        '<div class="row2"><button type="button" class="btn ghost" data-act="pr-cancel">Cancelar</button><button type="button" class="btn" data-act="pr-save"' + (f.busy ? " disabled" : "") + ">" + (f.busy ? "Guardando…" : "Publicar oferta") + "</button></div></div>";
    }
    var retos = promos.dinamicas.length ? '<h4 style="margin-top:14px">Retos guardados</h4>' + promos.dinamicas.map(function (d) {
      return '<div class="pr-item">' + esc(d.texto) + ' <button type="button" class="chk" data-prdin="' + esc(d.id) + '">Borrar</button></div>';
    }).join("") : "";
    return '<div class="card prods">' + (!token() ? '<p class="note">Entra con la sesión de la caja para crear ofertas.</p>' :
      (lista || '<p class="note">No hay ofertas. Las que publiques salen en el menú web con su contador.</p>') +
      (f ? form : '<button type="button" class="btn dark" data-act="pr-new">Nueva oferta</button>') + retos) + "</div>";
  }
  function guardarPromo() {
    var f = state.promoForm; if (!f || f.busy) return;
    var precio = Number(f.precio), min = Number(f.horas) * 60 + Number(f.minutos), cupo = Number(f.cupo);
    if (!f.items.length) { f.err = "Agrega al menos un producto."; return render(); }
    if (!(precio >= 1 && precio <= 5000 && Math.round(precio) === precio)) { f.err = "El precio debe ser un número entero de 1 a 5000."; return render(); }
    if (min < 5) { f.err = "La oferta dura por lo menos 5 minutos."; return render(); }
    var dinamica, nuevoReto = null;
    if (f.din === "primeros") {
      if (!(cupo >= 1 && cupo <= 500 && Math.round(cupo) === cupo)) { f.err = "¿Cuántos clientes? De 1 a 500."; return render(); }
      dinamica = { tipo: "primeros", cupo: cupo };
    } else if (f.din === "primero") dinamica = { tipo: "primero", cupo: 1 };
    else if (f.din === "nuevo") {
      if (!String(f.texto).trim()) { f.err = "Escribe las instrucciones del reto."; return render(); }
      dinamica = { tipo: "reto", cupo: 1, texto: String(f.texto).trim() };
      if (f.guardarReto) nuevoReto = { id: "d-" + Date.now().toString(36), texto: dinamica.texto };
    } else {
      var d = null; promos.dinamicas.forEach(function (x) { if (x.id === f.din) d = x; });
      if (!d) { f.err = "Elige una dinámica."; return render(); }
      dinamica = { tipo: "reto", cupo: 1, texto: d.texto };
    }
    f.busy = true; f.err = ""; render();
    guardarPromos(function (c) {
      c.promos.push({ id: "p-" + Date.now().toString(36), nombre: String(f.nombre).trim(), items: f.items, precio: precio, duracionMin: min, dinamica: dinamica });
      if (nuevoReto) c.dinamicas.push(nuevoReto);
    }, "Oferta publicada: ya sale en el menú web").then(function () { state.promoForm = null; render(); })
      .catch(function (e) { f.busy = false; f.err = e.message; render(); });
  }
  /* contadores de Ajustes y de las tarjetas, sin volver a dibujar la pantalla */
  setInterval(function () {
    var els = document.querySelectorAll(".promo-t[data-fin]");
    for (var i = 0; i < els.length; i++) { var fin = Number(els[i].getAttribute("data-fin")); if (fin > ahoraSrv()) els[i].textContent = (els[i].className.indexOf("tile-t") >= 0 ? "" : "Termina en ") + resto(fin); }
  }, 1000);

  function settingsHTML() {
    var rows = PRODUCTS.filter(function (p) { return !p.extra; }).map(function (p) {
      if (!sellable(p) && p.disponible !== false) {
        return "<tr><td><b>" + esc(p.name) + '</b> <span class="tag">Borrador</span><br><span class="note">' + esc(pendientes(p).join(" · ")) + '</span></td><td class="r">' +
          (typeof p.opts[0][1] === "number" ? money(p.opts[0][1]) : "Sin precio") + "</td><td></td></tr>";
      }
      return p.opts.map(function (o, i) {
        return "<tr><td>" + (i === 0 ? "<b>" + esc(p.name) + "</b>" : "") + (p.opts.length > 1 ? " <span class='note'>" + esc(o[0]) + "</span>" : "") + "</td>" +
          '<td class="r"><input type="number" inputmode="decimal" data-price="' + p.id + '" data-opt="' + i + '" value="' + price(p, i) + '"></td>' +
          '<td class="r">' + (i === 0 ? '<button type="button" class="chk' + (agotado(p.id) ? " on" : "") + '" data-out="' + p.id + '">' + (agotado(p.id) ? "Agotado" : "Disponible") + "</button>" : "") + "</td></tr>";
      }).join("");
    }).join("");
    return '<div class="page"><div class="page-in"><h2>Ajustes</h2>' +
      "<h3>Precios y disponibilidad</h3>" +
      '<div class="card prices"><table><tr><th>Producto</th><th class="r">Precio</th><th class="r"></th></tr>' + rows + "</table>" +
      '<p class="note">Se guarda al salir de cada casilla y cambia también en el menú web (hace falta internet). La cerveza es solo de la caja: se guarda en este iPad.</p></div>' +
      "<h3>Tema del menú web</h3>" +
      '<div class="card"><button type="button" class="chk' + (db.catalogo.tema === "muertos" ? " on" : "") + '" data-act="tema">' + (db.catalogo.tema === "muertos" ? "Día de Muertos activado" : "Día de Muertos desactivado") + "</button>" +
      '<p class="note">Cambia cómo se ve el menú para los clientes (hace falta internet). La caja se ve igual.</p></div>' +
      "<h3>Promos del día</h3>" + promosHTML() +
      "<h3>Productos nuevos</h3>" + productosHTML() +
      "<h3>Pedidos del menú web</h3>" +
      '<div class="card"><p>' + (token() ? "Sesión de <b>" + esc(ses.usuario || "caja") + "</b>, vence el " + esc(fecha(new Date(sesExp()).toISOString())) + "." : "Sin sesión.") + "</p>" +
      '<p class="note">' + (ped.ok ? "Conectado." : ped.ok === false ? esc(ped.error) : "Sin conectar todavía.") + "</p>" +
      '<div class="row2" style="margin-bottom:10px"><button type="button" class="btn ghost" data-act="logout">Cerrar sesión</button></div>' +
      '<button type="button" class="chk' + (db.settings.mute ? " on" : "") + '" data-act="mute">' + (db.settings.mute ? "Sonido de aviso apagado" : "Sonido de aviso encendido") + "</button></div>" +
      "<h3>Envío del corte</h3>" +
      '<div class="card"><label class="field"><span>WhatsApp que recibe el corte (con 52 al inicio)</span><input id="wa" type="tel" value="' + esc(db.settings.wa) + '"></label></div>' +
      "<h3>Respaldo</h3>" +
      '<div class="card"><p class="note">Las ventas solo viven en este iPad. Envía el corte por WhatsApp cada noche y, de vez en cuando, copia este respaldo y guárdalo en un chat.</p>' +
      '<div class="row2"><button type="button" class="btn dark" data-act="copy-backup">Copiar respaldo</button><button type="button" class="btn ghost" data-act="show-import">Restaurar respaldo</button></div>' +
      (state.confirm === "import" ? '<label class="field" style="margin-top:10px"><span>Pega aquí el respaldo</span><textarea id="imp"></textarea></label><div class="row2"><button type="button" class="btn ghost" data-act="no">Cancelar</button><button type="button" class="btn red" data-act="do-import">Reemplazar datos con este respaldo</button></div>' : "") +
      "</div>" +
      '<p class="note" style="text-align:center;margin-top:20px">Caja El Carboncito · versión 3</p>' +
      "</div></div>";
  }

  /* =========================================================
     VENTANA: elegir opciones de un producto
     ========================================================= */
  /* lo elegido en cada parte de un combo; una parte de un solo sabor empieza sin elegir */
  /* las alitas de un combo se reparten por sabor con el contador (alas); las partes de un solo sabor, con un botón */
  /* las alitas de un combo se reparten por sabor con el contador (alas), todas con receta secreta de entrada; las partes de un solo sabor, con un botón */
  function basePart(c) {
    var r = c.pid ? prod(c.pid) : null, alas = null;
    if (c.sabor) return { sauces: [c.sabor], quitar: [], opcion: "", alas: null };   /* sabor fijo (Alicombo) */
    if (r && r.sauces && !c.unSabor) { alas = {}; alas[SAUCES[0]] = piezasParte(c); }
    return { sauces: [], quitar: [], opcion: "", alas: alas };
  }
  /* sabor: alitas abiertas desde la tarjeta de un sabor (solo se elige la porción) */
  /* perso: "Alitas personalizadas" (porción y contador de sabores) */
  function openPick(p, sabor, perso) {
    state.pick = { pid: p.id, opt: 0, sauces: sabor ? [sabor] : [], sabor: sabor || "", perso: !!perso, alas: alasBase(perso ? p.piezas[0] : 0), quitar: [], qty: 1, comps: p.parts ? p.parts.map(basePart) : [] };
    renderLayer();
  }
  /* combo: cada parte con sus salsas y lo que se le puede quitar */
  function partsHTML(p, s) {
    return p.parts.map(function (c, i) {
      var r = c.pid ? prod(c.pid) : null, ps = s.comps[i], h = "<h4>" + esc(c.label) + (c.pend ? ' <small class="pend">· ' + esc(c.pend) + "</small>" : "") + "</h4>";
      if (r && r.sauces && ps.alas) h += contadorHTML(ps.alas, piezasParte(c), ' data-cparte="' + i + '"');
      else if (r && r.sauces && c.sabor) h += "<p class='note'>Sabor: " + esc(c.sabor) + "</p>";
      else if (r && r.sauces) h += "<div class='chips'>" + SAUCES.map(function (n) {
        return '<button type="button" class="chip' + (ps.sauces.indexOf(n) >= 0 ? " on" : "") + '" data-part="' + i + '" data-psauce="' + esc(n) + '">' + esc(n) + "</button>";
      }).join("") + "</div>";
      if (r && r.quitar.length) h += "<div class='chips'>" + r.quitar.map(function (n) {
        return '<button type="button" class="chip' + (ps.quitar.indexOf(n) >= 0 ? " off" : "") + '" data-part="' + i + '" data-pquitar="' + esc(n) + '">Sin ' + esc(n.toLowerCase()) + "</button>";
      }).join("") + "</div>";
      /* opciones (el refresco del combo): las que se pueden vender y no están agotadas */
      if (c.opciones) h += "<div class='chips'>" + c.opciones.map(prod).filter(function (o) { return o && sellable(o) && !agotado(o.id); }).map(function (o) {
        return '<button type="button" class="chip' + (ps.opcion === o.id ? " on" : "") + '" data-part="' + i + '" data-popcion="' + o.id + '">' + esc(o.name) + "</button>";
      }).join("") + "</div>";
      return '<div class="part">' + h + "</div>";
    }).join("");
  }
  /* lo que falta elegir antes de poder agregar ("" si ya está todo) */
  function faltaCaja(p, s) {
    if (s.perso && alasTot(s.alas) !== p.piezas[s.opt]) return "Falta elegir el sabor de " + (p.piezas[s.opt] - alasTot(s.alas)) + " alitas";
    for (var i = 0; p.parts && i < p.parts.length; i++) {
      var c = p.parts[i], ps = s.comps[i];
      if (c.opciones && !ps.opcion) return "Falta elegir: " + c.label.toLowerCase();
      if (c.unSabor && !ps.sauces.length) return "Falta elegir el sabor de: " + c.label.toLowerCase();
      if (ps.alas && alasTot(ps.alas) !== piezasParte(c)) return "Falta elegir el sabor de las alitas de: " + c.label.toLowerCase();
    }
    return "";
  }
  function pickHTML() {
    var s = state.pick, p = prod(s.pid), venta = sellable(p), falta = faltaCaja(p, s);
    if (p.parts) {
      var foot = venta
        ? '<div class="m-foot"><div class="step"><button type="button" data-pq="-1">−</button><output>' + s.qty + '</output><button type="button" data-pq="1">+</button></div>' +
          '<button type="button" class="btn" data-act="add-line"' + (falta ? ' disabled' : '') + '>Agregar</button></div>' + (falta ? '<p class="add-hint">' + esc(falta) + '</p>' : '')
        : '<div class="m-foot"><button type="button" class="btn" disabled>Borrador: todavía no se vende</button></div>';
      return '<div class="overlay"><div class="modal">' +
        '<div class="m-head">' + imgOf(p) + "<h2>" + esc(p.name) + '</h2><button type="button" class="x" data-act="close-layer" aria-label="Cerrar">×</button></div>' +
        '<div class="m-body"><p class="note">' + esc(p.desc) + "</p>" +
        (venta ? "" : '<div class="confirm"><p><b>Falta para venderlo:</b></p><p>' + pendientes(p).map(esc).join("<br>") + "</p></div>") +
        partsHTML(p, s) + "</div>" + foot + "</div></div>";
    }
    /* sin precios: el desglose se ve en el ticket */
    var labels = (s.sabor || s.perso) && p.porcion ? p.porcion : p.opts.map(function (o) { return o[0]; });
    /* alitas: la porción con su foto (10 piezas la orden completa, 5 la media) */
    var opts = p.opts.length > 1 ? "<h4>" + (s.sabor || s.perso ? "Porción" : "Opción") + "</h4>" + (s.sabor ? '<div class="porciones">' : "") + labels.map(function (o, i) {
      var foto = s.sabor ? '<img src="img/alitas-' + SLUG[s.sabor] + "-" + (i === 0 ? 10 : 5) + '.png" alt="">' : "";
      return '<button type="button" class="opt' + (s.sabor ? " foto" : "") + (s.opt === i ? " on" : "") + '" data-popt="' + i + '">' + foto + '<i class="dot"></i><span>' + esc(o) + "</span></button>";
    }).join("") + (s.sabor ? "</div>" : "") : "";
    var base = p.base ? prod(p.base) : p, tocino = base.tocino
      ? "<h4>Tocino</h4><div class='chips'><button type='button' class='chip toggle" + (p.base ? " on" : "") + "' data-act='tocino'>" + (p.base ? "✓ " : "") + "Con tocino</button></div>" : "";
    /* alitas personalizadas: contador por sabor hasta completar la porción */
    var sauces = s.perso ? "<h4>Sabores</h4>" + contadorHTML(s.alas, p.piezas[s.opt], "") : p.sauces && !s.sabor ? "<h4>Salsa <small>· toca dos para mitad y mitad</small></h4><div class='chips'>" + SAUCES.map(function (n) {
      return '<button type="button" class="chip' + (s.sauces.indexOf(n) >= 0 ? " on" : "") + '" data-sauce="' + esc(n) + '">' + esc(n) + "</button>";
    }).join("") + "</div>" : "";
    /* el ranch de las alitas se elige en el ticket */
    var lista = RANCH[p.id] ? [] : p.quitar;
    var quitar = lista.length ? "<h4>Quitar <small>· toca lo que no lleva</small></h4><div class='chips'>" + lista.map(function (n) {
      return '<button type="button" class="chip' + (s.quitar.indexOf(n) >= 0 ? " off" : "") + '" data-quitar="' + esc(n) + '">' + esc(n) + "</button>";
    }).join("") + "</div>" : "";
    return '<div class="overlay"><div class="modal">' +
      '<div class="m-head">' + (s.sabor ? '<img src="img/alitas-' + SLUG[s.sabor] + '-10.png" alt="">' : imgOf(base)) + "<h2>" + esc(s.perso ? "Alitas personalizadas" : s.sabor ? "Alitas · " + s.sabor : (base.tile || p.name)) + '</h2><button type="button" class="x" data-act="close-layer" aria-label="Cerrar">×</button></div>' +
      '<div class="m-body">' + (p.desc ? '<p class="note">' + esc(p.desc) + "</p>" : "") +
      (venta ? "" : '<div class="confirm"><p><b>Todavía no se vende:</b> ' + pendientes(p).map(esc).join(", ") + "</p></div>") + opts + tocino + sauces + quitar + "</div>" +
      (venta ? '<div class="m-foot"><div class="step"><button type="button" data-pq="-1">−</button><output>' + s.qty + '</output><button type="button" data-pq="1">+</button></div>' +
        '<button type="button" class="btn" data-act="add-line"' + (falta ? ' disabled' : '') + '>Agregar</button></div>' + (falta ? '<p class="add-hint">' + esc(falta) + '</p>' : '')
        : '<div class="m-foot"><button type="button" class="btn" disabled>Todavía no se vende</button></div>') + "</div></div>";
  }

  /* =========================================================
     VENTANA: cobrar
     ========================================================= */
  function openPay() { state.pay = { metodo: "efectivo", recv: "", done: null }; renderLayer(); }
  function payHTML() {
    var s = state.pay, t = cartTotal();
    if (s.done) {
      return '<div class="overlay"><div class="modal"><div class="done">' +
        '<div class="big">Venta #' + s.done.folio + " registrada</div>" +
        (s.done.metodo === "efectivo" && s.done.recibido ? "<p class='note'>Cambio</p><div class='chg'>" + money(s.done.cambio) + "</div>" : "<div class='chg'>" + money(s.done.total) + "</div><p class='note'>" + METODOS[s.done.metodo] + "</p>") +
        '</div><div class="m-foot"><div class="row2" style="width:100%">' +
        (s.done.tipo === "domicilio" ? '<button type="button" class="btn dark" data-act="ruta-done">Ruta de entrega (QR)</button>' : "") +
        '<button type="button" class="btn" data-act="new-sale">Nueva venta</button></div></div></div></div>';
    }
    var recv = Number(s.recv) || 0, falta = recv && recv < t, cambio = recv - t;
    var metodos = Object.keys(METODOS).map(function (k) { return '<button type="button" data-metodo="' + k + '" class="' + (s.metodo === k ? "on" : "") + '">' + METODOS[k] + "</button>"; }).join("");
    var cash = "";
    if (s.metodo === "efectivo") {
      var quick = [t, 50, 100, 200, 500].filter(function (v, i, a) { return v >= t && a.indexOf(v) === i; }).slice(0, 5);
      var keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(function (k) { return '<button type="button" data-key="' + k + '">' + k + "</button>"; }).join("");
      cash = '<div class="cash"><div class="cash-l">' +
        '<div class="recv"><small>Recibí</small>' + (s.recv ? money(recv) : "—") + "</div>" +
        '<div class="change' + (falta ? " short" : "") + '"><small>' + (falta ? "Faltan" : "Cambio") + "</small>" + (s.recv ? money(Math.abs(cambio)) : "—") + "</div>" +
        '<div class="quick">' + quick.map(function (v, i) { return '<button type="button" data-quick="' + v + '">' + (i === 0 && v === t ? "Exacto" : money(v)) + "</button>"; }).join("") + "</div>" +
        '</div><div class="keys">' + keys + "</div></div>";
    }
    var can = s.metodo !== "efectivo" || !s.recv || recv >= t;
    return '<div class="overlay"><div class="modal">' +
      '<div class="m-head"><h2>Cobrar</h2><button type="button" class="x" data-act="close-layer" aria-label="Cerrar">×</button></div>' +
      '<div class="m-body"><div class="pay-total"><span>Total a cobrar</span><b>' + money(t) + "</b></div>" +
      '<div class="seg">' + metodos + "</div>" + cash + "</div>" +
      '<div class="m-foot"><button type="button" class="btn green" data-act="confirm-pay"' + (can ? "" : " disabled") + ">Registrar venta</button></div></div></div>";
  }
  function registerSale() {
    var s = state.pay, t = cartTotal(), recv = Number(s.recv) || 0;
    var sale = {
      folio: db.shift.next, t: new Date().toISOString(), total: t, metodo: s.metodo,
      recibido: s.metodo === "efectivo" && recv ? recv : 0, cambio: s.metodo === "efectivo" && recv ? recv - t : 0,
      tipo: state.tipo, nota: state.nota.trim(), dir: state.tipo === "domicilio" ? state.dir.trim() : "", cancelada: false,
      lines: state.cart.map(function (l) {
        var p = prod(l.pid);
        return { pid: l.pid, name: p.name, opt: p.opts.length > 1 ? p.opts[l.opt][0] : "", desc: lineDesc(l), qty: l.qty, price: l.price };
      })
    };
    if (state.fromPedido) { var wp = findPed(state.fromPedido); if (wp) sale.web = wp.folio; setEstado(state.fromPedido, "entregado", { ventaFolio: sale.folio }); state.fromPedido = null; }
    if (state.fromPend) { var pp = findPend(state.fromPend); if (pp) db.pendientes.splice(db.pendientes.indexOf(pp), 1); }
    db.shift.sales.push(sale); db.shift.next++; save();
    /* ofertas vendidas aquí: ocupan su lugar en el servidor (los pedidos web ya lo ocuparon) */
    if (!sale.web) sale.lines.forEach(function (l) { var p = prod(l.pid); if (p && p.promo) api("POST", "/api/promos/usar", { id: p.id, n: l.qty }).then(cargarPromos).catch(function () { toast("No se pudo apartar el lugar de la oferta (sin internet)"); }); });
    s.done = sale;
    resetTicket();
  }

  function renderLayer() {
    var L = $("layer");
    if (state.qr) pintar(L, qrHTML(), "qr");
    else if (state.pick) pintar(L, pickHTML(), "pick:" + state.pick.pid);
    else if (state.pay) pintar(L, payHTML(), "pay");
    else if (state.pend) pintar(L, pendHTML(), "pend");
    else if (ped.open && findPed(ped.open)) pintar(L, comandaHTML(findPed(ped.open)), "ped:" + ped.open);
    else pintar(L, "", "");
  }
  function closeLayer() { state.pick = null; state.pay = null; state.pend = false; state.pendAsk = null; state.qr = null; ped.open = null; ped.ask = null; renderLayer(); }

  /* =========================================================
     EVENTOS
     ========================================================= */
  function attr(el, name) { return el.getAttribute(name); }
  function find(t, sel) { return t.closest ? t.closest(sel) : null; }

  document.addEventListener("click", function (e) {
    var t = e.target, el;

    /* pantalla de entrada: tapa todo hasta que se entra */
    if (!$("login").hidden) { if (find(t, '[data-act="login"]')) doLogin(); return; }

    /* ruta de entrega (va encima de cualquier otra ventana) */
    if (state.qr) {
      if (find(t, '[data-act="copy-ruta"]')) { toast(copyText(state.qr.url) ? "Enlace copiado" : "No se pudo copiar"); return; }
      if (find(t, '[data-act="close-qr"]') || t.className === "overlay qr-ov") { state.qr = null; return renderLayer(); }
      return;
    }
    /* cuentas por cobrar */
    if (state.pend) {
      if ((el = find(t, "[data-pendload]"))) return loadPend(attr(el, "data-pendload"));
      if ((el = find(t, "[data-pendruta]"))) { var rp = findPend(attr(el, "data-pendruta")); if (rp) openRuta("Cuenta de " + rp.nota + " · " + money(pendTotal(rp)), rp.dir); return; }
      if ((el = find(t, "[data-pendask]"))) { state.pendAsk = attr(el, "data-pendask"); return renderLayer(); }
      if (find(t, "[data-pendno]")) { state.pendAsk = null; return renderLayer(); }
      if ((el = find(t, "[data-penddel]"))) {
        var dp = findPend(attr(el, "data-penddel"));
        if (dp) { db.pendientes.splice(db.pendientes.indexOf(dp), 1); save(); toast("Cuenta borrada"); }
        if (dp && String(state.fromPend) === String(dp.id)) state.fromPend = null;
        state.pendAsk = null; renderLayer(); return render();
      }
      if (find(t, '[data-act="close-layer"]') || t.className === "overlay") return closeLayer();
      return;
    }
    if (find(t, '[data-act="show-pend"]')) { state.pend = true; state.pendAsk = null; return renderLayer(); }

    /* aviso de pedido nuevo (funciona desde cualquier pantalla) */
    if (!state.pick && !state.pay && (el = find(t, "[data-openped]"))) {
      ped.open = attr(el, "data-openped"); ped.ask = null; ped.banner = null; $("banner").hidden = true; return renderLayer();
    }
    /* comanda en grande */
    if (ped.open && !state.pick && !state.pay) {
      if ((el = find(t, "[data-pact]"))) {
        var pa = attr(el, "data-pact"), pk = attr(el, "data-key");
        if (pa === "no") { ped.ask = null; return renderLayer(); }
        setEstado(pk, pa);
        /* listo para llevar a domicilio: se muestra la ruta para el repartidor */
        if (pa === "listo" && findPed(pk) && findPed(pk).cliente.entrega === "domicilio") rutaPedido(pk);
        return;
      }
      if ((el = find(t, "[data-pask]"))) { ped.ask = attr(el, "data-pask"); return renderLayer(); }
      if ((el = find(t, "[data-pcobrar]"))) return cobrarPedido(attr(el, "data-pcobrar"));
      if ((el = find(t, "[data-pruta]"))) return rutaPedido(attr(el, "data-pruta"));
      if (find(t, '[data-act="close-ped"]') || t.className === "overlay big-ov") { ped.open = null; ped.ask = null; return renderLayer(); }
      if (find(t, ".cli a")) return;
      return;
    }
    if ((el = find(t, "[data-ptab]"))) { ped.tab = attr(el, "data-ptab"); return render(); }
    if (find(t, '[data-act="show-login"]')) return showLogin();
    if (find(t, '[data-act="logout"]')) return logout();
    if (find(t, '[data-act="tema"]')) { var tema = db.catalogo.tema === "muertos" ? "" : "muertos"; return guardarCatalogo(function (c) { c.tema = tema; }, tema ? "Tema de Día de Muertos activado" : "Tema de Día de Muertos desactivado").catch(function () {}); }
    if (find(t, '[data-act="mute"]')) { db.settings.mute = !db.settings.mute; save(); if (!db.settings.mute) beep(); return render(); }

    /* ventana de opciones */
    if (state.pick) {
      var s = state.pick, p = prod(s.pid);
      if ((el = find(t, "[data-popt]"))) {
        s.opt = Number(attr(el, "data-popt"));
        /* alitas personalizadas: si baja la porción, se quitan las últimas que sobran */
        /* primero se quitan las de receta secreta (son las de relleno), luego las últimas */
        var orden = [SAUCES[0]].concat(SAUCES.slice(1).reverse());
        if (s.perso) for (var ri = 0; ri < orden.length && alasTot(s.alas) > p.piezas[s.opt]; ri++) {
          var rs = orden[ri]; if (!s.alas[rs]) continue;
          s.alas[rs] -= Math.min(s.alas[rs], alasTot(s.alas) - p.piezas[s.opt]); if (!s.alas[rs]) delete s.alas[rs];
        }
        /* si sube la porción (de 5 a 10), las que faltan se completan con receta secreta */
        if (s.perso && alasTot(s.alas) < p.piezas[s.opt]) s.alas[SAUCES[0]] = (s.alas[SAUCES[0]] || 0) + p.piezas[s.opt] - alasTot(s.alas);
        return renderLayer();
      }
      /* contador de alitas: personalizadas o una parte de combo (data-cparte) */
      if ((el = find(t, "[data-cala]"))) {
        var cp = attr(el, "data-cparte"), ca = cp === null ? s.alas : s.comps[Number(cp)].alas;
        var cn = cp === null ? p.piezas[s.opt] : piezasParte(p.parts[Number(cp)]), cs = attr(el, "data-cala"), cd = Number(attr(el, "data-cd"));
        /* llena: la nueva sale de las de receta secreta; si ya no hay de esas, no se puede sumar */
        if (cd > 0 && alasTot(ca) >= cn) {
          if (cs === SAUCES[0] || !ca[SAUCES[0]]) return;
          ca[SAUCES[0]]--; if (!ca[SAUCES[0]]) delete ca[SAUCES[0]];
        }
        ca[cs] = Math.max(0, (ca[cs] || 0) + cd); if (!ca[cs]) delete ca[cs];
        return renderLayer();
      }
      if ((el = find(t, "[data-sauce]"))) {
        var n = attr(el, "data-sauce"), i = s.sauces.indexOf(n);
        if (i >= 0) s.sauces.splice(i, 1);
        else if (s.sauces.length === 1 && s.sauces[0] === SAUCES[0]) s.sauces = [n];
        else { s.sauces.push(n); if (s.sauces.length > 2) s.sauces.shift(); }
        if (!s.sauces.length) s.sauces = [SAUCES[0]];
        return renderLayer();
      }
      if ((el = find(t, "[data-quitar]"))) {
        var q = attr(el, "data-quitar"), k = s.quitar.indexOf(q);
        if (k >= 0) s.quitar.splice(k, 1); else s.quitar.push(q);
        return renderLayer();
      }
      /* hotdog: "Con tocino" cambia entre el sencillo y el de tocino (se conservan cantidad y lo que se quitó) */
      if (find(t, '[data-act="tocino"]')) {
        if (!p.base && agotado(p.tocino)) { toast("El hotdog con tocino está marcado como agotado"); return; }
        s.pid = p.base ? p.base : p.tocino; return renderLayer();
      }
      /* combo: salsa o ingrediente de una parte */
      if ((el = find(t, "[data-part]"))) {
        var pi = Number(attr(el, "data-part")), pc = p.parts[pi], ps = s.comps[pi], pv;
        if ((pv = attr(el, "data-psauce"))) {
          var si = ps.sauces.indexOf(pv);
          if (pc.unSabor) ps.sauces = [pv];
          else if (si >= 0) ps.sauces.splice(si, 1);
          else if (ps.sauces.length === 1 && ps.sauces[0] === SAUCES[0]) ps.sauces = [pv];
          else { ps.sauces.push(pv); if (ps.sauces.length > 2) ps.sauces.shift(); }
          if (!pc.unSabor && !ps.sauces.length) ps.sauces = [SAUCES[0]];
        } else if ((pv = attr(el, "data-popcion"))) {
          ps.opcion = pv;
        } else {
          pv = attr(el, "data-pquitar"); var qi = ps.quitar.indexOf(pv);
          if (qi >= 0) ps.quitar.splice(qi, 1); else ps.quitar.push(pv);
        }
        return renderLayer();
      }
      if ((el = find(t, "[data-pq]"))) { s.qty = Math.max(1, Math.min(50, s.qty + Number(attr(el, "data-pq")))); return renderLayer(); }
      if (find(t, '[data-act="add-line"]')) {
        if (!sellable(p)) return;
        if (p.parts) {
          var falta = null, unos = [];
          p.parts.forEach(function (c, ix) {
            var ps = s.comps[ix];
            if (c.opciones && !ps.opcion && !falta) falta = c.label;
            if (ps.alas && alasTot(ps.alas) !== piezasParte(c) && !falta) falta = "sabor de las " + piezasParte(c) + " alitas (" + c.label + ")";
            if (c.unSabor) { if (!ps.sauces.length && !falta) falta = c.label; else unos.push(ps.sauces[0]); }
          });
          if (falta) { toast("Falta elegir: " + falta); return; }
          if (p.repetidos === false && unos.some(function (x, ix) { return unos.indexOf(x) !== ix; })) { toast("En este combo los sabores no se repiten"); return; }
        }
        if (s.perso && alasTot(s.alas) !== p.piezas[s.opt]) { toast("Falta elegir el sabor de " + (p.piezas[s.opt] - alasTot(s.alas)) + " alitas"); return; }
        var quita = s.quitar.slice();
        if (RANCH[p.id] && !state.ranch) quita.push("Ranch");   /* toma lo elegido en el ticket */
        addLine({ pid: s.pid, opt: s.opt, sauces: s.perso ? alasTxt(s.alas) : s.sauces.slice(), quitar: quita, qty: s.qty, price: price(p, s.opt),
          comps: s.comps.map(function (c) { return { sauces: c.alas ? alasTxt(c.alas) : c.sauces.slice(), quitar: c.quitar.slice(), opcion: c.opcion || "" }; }) });
        closeLayer(); return render();
      }
      if (find(t, '[data-act="close-layer"]') || (t.className === "overlay")) return closeLayer();
      return;
    }

    /* ventana de cobro */
    if (state.pay) {
      var py = state.pay;
      if (find(t, '[data-act="new-sale"]')) { closeLayer(); return render(); }
      if (py.done && find(t, '[data-act="ruta-done"]')) return openRuta("Venta #" + py.done.folio + (py.done.nota ? " · " + py.done.nota : ""), py.done.dir);
      if (py.done) return;
      if ((el = find(t, "[data-metodo]"))) { py.metodo = attr(el, "data-metodo"); return renderLayer(); }
      if ((el = find(t, "[data-key]"))) {
        var key = attr(el, "data-key");
        if (key === "C") py.recv = "";
        else if (key === "⌫") py.recv = py.recv.slice(0, -1);
        else if (py.recv.length < 6) py.recv = (py.recv + key).replace(/^0+/, "");
        return renderLayer();
      }
      if ((el = find(t, "[data-quick]"))) { py.recv = attr(el, "data-quick"); return renderLayer(); }
      if (find(t, '[data-act="confirm-pay"]')) { registerSale(); renderLayer(); return render(); }
      if (find(t, '[data-act="close-layer"]') || (t.className === "overlay")) return closeLayer();
      return;
    }

    /* navegación */
    if ((el = find(t, "[data-view]"))) { state.view = attr(el, "data-view"); state.confirm = null; state.openSale = null; return render(); }

    /* vender */
    if ((el = find(t, "[data-cat]"))) { state.cat = attr(el, "data-cat"); return render(); }
    if (find(t, '[data-act="alas-perso"]')) {
      if (agotado("alitas")) { toast("Las alitas están marcadas como agotadas"); return; }
      return openPick(prod("alitas"), "", true);
    }
    if ((el = find(t, "[data-sabor]"))) {
      if (agotado("alitas")) { toast("Las alitas están marcadas como agotadas"); return; }
      return openPick(prod("alitas"), attr(el, "data-sabor"));
    }
    if ((el = find(t, "[data-ranch]"))) { setRanch(attr(el, "data-ranch") === "1"); return render(); }
    if ((el = find(t, "[data-add]"))) {
      var pr = prod(attr(el, "data-add"));
      if (agotado(pr.id) || pr.disponible === false) { toast(pr.name + " no está disponible"); return; }
      return openPick(pr);
    }
    if ((el = find(t, "[data-line]"))) {
      var ln = state.cart[Number(attr(el, "data-line"))];
      ln.qty += Number(attr(el, "data-d"));
      if (ln.qty < 1) state.cart.splice(state.cart.indexOf(ln), 1);
      if (!state.cart.length) state.showTicket = false;
      return render();
    }
    if ((el = find(t, "[data-tipo]"))) { state.tipo = attr(el, "data-tipo"); render(); var di = $("dir"); if (di && state.tipo === "domicilio" && !state.dir) di.focus(); return; }
    if (find(t, '[data-act="maps"]')) {
      window.open(buscarURL(state.dir), "_blank");
      toast("En Maps toca el lugar → Compartir → Copiar, y pégalo aquí");
      return;
    }
    if (find(t, '[data-act="clear"]')) { resetTicket(); return render(); }
    if (find(t, '[data-act="hold"]')) return holdTicket();
    if (find(t, '[data-act="pay"]')) { if (state.cart.length) openPay(); return; }
    if (find(t, '[data-act="show-ticket"]')) { state.showTicket = true; return render(); }
    if (find(t, '[data-act="hide-ticket"]')) { state.showTicket = false; return render(); }

    /* ventas */
    if ((el = find(t, "[data-ask]"))) { state.confirm = attr(el, "data-ask"); return render(); }
    if (find(t, '[data-act="no"]')) { state.confirm = null; return render(); }
    if ((el = find(t, "[data-cancel]"))) {
      var f = Number(attr(el, "data-cancel"));
      db.shift.sales.forEach(function (x) { if (x.folio === f) x.cancelada = true; });
      save(); state.confirm = null; toast("Venta #" + f + " cancelada"); return render();
    }
    if ((el = find(t, "[data-ruta]"))) {
      var rf = Number(attr(el, "data-ruta"));
      db.shift.sales.forEach(function (x) { if (x.folio === rf) openRuta("Venta #" + x.folio + (x.nota ? " · " + x.nota : ""), x.dir); });
      return;
    }
    if ((el = find(t, "[data-sale]")) && !find(t, "button")) {
      var fo = Number(attr(el, "data-sale")); state.openSale = state.openSale === fo ? null : fo; state.confirm = null; return render();
    }

    /* corte */
    if (find(t, '[data-act="edit-fondo"]')) { state.confirm = "fondo"; render(); var fi = $("fondo"); if (fi) fi.focus(); return; }
    if (find(t, '[data-act="save-fondo"]')) { db.shift.fondo = Math.max(0, Number($("fondo").value) || 0); save(); state.confirm = null; return render(); }
    if (find(t, '[data-act="copy-sum"]')) { toast(copyText(summaryText(db.shift)) ? "Resumen copiado" : "No se pudo copiar"); return; }
    if (find(t, '[data-act="close-shift"]')) {
      db.shift.closedAt = new Date().toISOString();
      db.history.push(db.shift);
      if (db.history.length > 90) db.history.shift();
      db.shift = newShift(0); save(); state.confirm = null; toast("Turno cerrado"); return render();
    }
    if ((el = find(t, "[data-hist]"))) { var hk = "h" + attr(el, "data-hist"); state.openSale = state.openSale === hk ? null : hk; return render(); }

    /* ajustes */
    if ((el = find(t, "[data-out]"))) {
      var id = attr(el, "data-out");
      if (SOLO_CAJA[id]) { db.settings.soldOut[id] = !db.settings.soldOut[id]; save(); return render(); }
      var poner = !agotado(id);
      guardarCatalogo(function (c) { if (poner) c.agotado[id] = true; else delete c.agotado[id]; }, poner ? "Marcado como agotado, también en el menú web" : "Disponible otra vez, también en el menú web").catch(function () {});
      return;
    }
    if (find(t, '[data-act="prod-new"]')) { state.prodForm = { id: "", name: "", desc: "", price: "", cat: "combos", img: "", foto: "", disponible: true, err: "" }; return render(); }
    if ((el = find(t, "[data-pedit]"))) {
      db.catalogo.extra.forEach(function (x) { if (x.id === attr(el, "data-pedit")) state.prodForm = { id: x.id, name: x.name, desc: x.desc, price: String(x.price), cat: x.cat, img: x.img, foto: "", disponible: x.disponible !== false, err: "" }; });
      return render();
    }
    if (state.prodForm && find(t, '[data-act="prod-toggle"]')) { state.prodForm.disponible = !state.prodForm.disponible; return render(); }
    if (find(t, '[data-act="prod-cancel"]')) { state.prodForm = null; return render(); }
    if (find(t, '[data-act="prod-save"]')) return guardarProducto();
    /* promos del día */
    if (find(t, '[data-act="pr-new"]')) { nuevaPromo(); return render(); }
    if (find(t, '[data-act="pr-cancel"]')) { state.promoForm = null; return render(); }
    if (state.promoForm && find(t, '[data-act="pr-add"]')) {
      var pf = state.promoForm, sv = String(pf.sel).split("|"), pq = Math.max(1, Math.min(10, Math.floor(Number(pf.qty) || 1)));
      if (sv[0] && pf.items.length < 6) pf.items.push({ id: sv[0], opt: Number(sv[1]) || 0, qty: pq });
      pf.err = ""; return render();
    }
    if (state.promoForm && (el = find(t, "[data-pritem]"))) { state.promoForm.items.splice(Number(attr(el, "data-pritem")), 1); return render(); }
    if (state.promoForm && find(t, '[data-act="pr-guardar-reto"]')) { state.promoForm.guardarReto = !state.promoForm.guardarReto; return render(); }
    if (find(t, '[data-act="pr-save"]')) return guardarPromo();
    if ((el = find(t, "[data-pterm]"))) {
      var tid = attr(el, "data-pterm");
      guardarPromos(function (c) { c.promos.forEach(function (x) { if (x.id === tid) x.terminada = true; }); }, "Oferta terminada: ya no sale en el menú").catch(function () {});
      return;
    }
    if ((el = find(t, "[data-prdin]"))) {
      var did = attr(el, "data-prdin");
      guardarPromos(function (c) { c.dinamicas = c.dinamicas.filter(function (x) { return x.id !== did; }); }, "Reto borrado").catch(function () {});
      return;
    }
    if (find(t, '[data-act="copy-backup"]')) { toast(copyText(JSON.stringify(db)) ? "Respaldo copiado: pégalo en un chat" : "No se pudo copiar"); return; }
    if (find(t, '[data-act="show-import"]')) { state.confirm = "import"; return render(); }
    if (find(t, '[data-act="do-import"]')) {
      try {
        var data = JSON.parse($("imp").value);
        if (!data || !data.shift || !data.settings) throw new Error("x");
        db = data; if (!db.pendientes) db.pendientes = []; if (!db.history) db.history = [];
        save(); state.confirm = null; toast("Respaldo restaurado"); return render();
      } catch (err) { toast("Ese texto no es un respaldo válido"); return; }
    }
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "nota") state.nota = t.value;
    if (t.id === "dir") state.dir = t.value;
    if (state.prodForm && t.id === "pf-name") state.prodForm.name = t.value;
    if (state.prodForm && t.id === "pf-desc") state.prodForm.desc = t.value;
    if (state.prodForm && t.id === "pf-price") state.prodForm.price = t.value;
    var pfi = state.promoForm, PRI = { "pr-nombre": "nombre", "pr-qty": "qty", "pr-precio": "precio", "pr-cupo": "cupo", "pr-texto": "texto" };
    if (pfi && PRI[t.id]) pfi[PRI[t.id]] = t.value;
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (state.prodForm && t.id === "pf-cat") state.prodForm.cat = t.value;
    var pfc = state.promoForm, PRC = { "pr-sel": "sel", "pr-horas": "horas", "pr-min": "minutos", "pr-din": "din" };
    if (pfc && PRC[t.id]) { pfc[PRC[t.id]] = t.value; if (t.id === "pr-din") render(); }
    if (state.prodForm && t.id === "pf-file" && t.files && t.files[0]) achicarFoto(t.files[0]);
    if (t.getAttribute("data-price") && !SOLO_CAJA[t.getAttribute("data-price")]) {
      var cp = prod(t.getAttribute("data-price")), co = Number(t.getAttribute("data-opt")), cv = Number(t.value);
      if (t.value === "" || !(cv >= 1 && cv <= 5000)) { t.value = price(cp, co); toast("Precio no válido (de 1 a 5000)"); return; }
      var arr = cp.opts.map(function (x, i) { return price(cp, i); }); arr[co] = Math.round(cv);
      if (arr[co] === price(cp, co)) return;
      guardarCatalogo(function (c) { c.precios[cp.id] = arr; }, "Precio guardado: también cambió en el menú web").catch(function () {});
      return;
    }
    if (t.getAttribute("data-price")) {
      var pid = t.getAttribute("data-price"), o = Number(t.getAttribute("data-opt"));
      if (!db.settings.prices[pid]) db.settings.prices[pid] = {};
      var v = Number(t.value);
      if (t.value === "" || isNaN(v) || v < 0) { delete db.settings.prices[pid][o]; t.value = price(prod(pid), o); }
      else db.settings.prices[pid][o] = Math.round(v);
      save(); toast("Precio guardado");
    }
    if (t.id === "wa") { db.settings.wa = t.value.replace(/\D/g, ""); save(); toast("Número guardado"); }
  });

  /* =========================================================
     PEDIDOS DEL MENÚ WEB
     La caja pregunta al servidor cada 10 segundos si hay pedidos nuevos.
     ========================================================= */
  var API = "/api/pedidos";
  var ped = { list: [], known: {}, ok: null, error: "", tab: "activos", open: null, ask: null, busy: false, banner: null, first: true };
  var ESTADO_TXT = { nuevo: "Nuevo", aceptado: "Aceptado", preparando: "En preparación", listo: "Listo", entregado: "Entregado", rechazado: "Cancelado" };
  /* =========================================================
     ENTRADA A LA CAJA: usuario y contraseña (CAJA_USUARIO y CAJA_PASSWORD en Netlify).
     El servidor da una sesión firmada que dura 30 días en este iPad; sin ella no se ven los pedidos.
     ========================================================= */
  var SES_KEY = "carbon-caja-sesion";
  var ses = null, entrando = false;
  try { ses = JSON.parse(window.localStorage.getItem(SES_KEY) || "null"); } catch (e) { ses = null; }
  delete db.settings.pin;
  function sesExp() { return ses && ses.token ? Number(String(ses.token).split(".")[0]) || 0 : 0; }
  function token() { return sesExp() > Date.now() ? ses.token : ""; }
  function setSes(s) {
    ses = s;
    try { if (s) window.localStorage.setItem(SES_KEY, JSON.stringify(s)); else window.localStorage.removeItem(SES_KEY); } catch (e) {}
  }
  function showLogin(msg) {
    var el = $("login"), last = "";
    try { last = window.localStorage.getItem(SES_KEY + "-usuario") || ""; } catch (e) {}
    el.innerHTML = '<div class="l-box"><div class="l-brand">El Carboncito<small>Caja</small></div>' +
      '<label class="field"><span>Usuario</span><input id="l-user" type="text" autocapitalize="off" autocorrect="off" autocomplete="username" value="' + esc(last) + '"></label>' +
      '<label class="field"><span>Contraseña</span><input id="l-pass" type="password" autocomplete="current-password"></label>' +
      '<p class="l-err" id="l-err"' + (msg ? "" : " hidden") + ">" + esc(msg || "") + "</p>" +
      '<button type="button" class="btn" data-act="login">Entrar</button>' +
      '<p class="note">La sesión dura 30 días en este iPad. Para entrar se necesita internet.</p></div>';
    el.hidden = false;
    var f = $(last ? "l-pass" : "l-user"); if (f) f.focus();
  }
  function doLogin() {
    if (entrando) return;
    var u = ($("l-user").value || "").trim(), pw = $("l-pass").value || "", er = $("l-err");
    if (!u || !pw) { er.textContent = "Escribe usuario y contraseña."; er.hidden = false; return; }
    entrando = true; er.textContent = "Entrando…"; er.hidden = false;
    withTimeout(fetch("/api/caja/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ usuario: u, password: pw }), cache: "no-store" }), 12000)
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok || !d.ok) throw new Error(d.error || ("Error " + r.status)); return d; }); })
      .then(function (d) {
        entrando = false;
        setSes({ token: d.token, usuario: d.usuario });
        try { window.localStorage.setItem(SES_KEY + "-usuario", u); } catch (e) {}
        $("login").hidden = true; $("login").innerHTML = "";
        ped.first = true; ped.ok = null; render(); poll();
      })
      .catch(function (e) {
        entrando = false;
        er.textContent = e.message === "tiempo" || /fetch|network|load/i.test(e.message) ? "Sin conexión. Revisa el internet y vuelve a probar." : e.message;
        er.hidden = false; $("l-pass").value = "";
      });
  }
  function logout() { setSes(null); ped.list = []; ped.known = {}; ped.ok = null; refreshPedidos(); showLogin(); }
  function activos() { return ped.list.filter(function (p) { return p.estado === "nuevo" || p.estado === "aceptado" || p.estado === "preparando" || p.estado === "listo"; }); }
  function nuevos() { return ped.list.filter(function (p) { return p.estado === "nuevo"; }).length; }
  function findPed(key) { for (var i = 0; i < ped.list.length; i++) if (ped.list[i].key === key) return ped.list[i]; return null; }
  function ago(iso) {
    var m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    return m < 1 ? "ahora" : m < 60 ? "hace " + m + " min" : "hace " + Math.floor(m / 60) + " h " + (m % 60) + " min";
  }
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("tiempo")); }, ms); })]); }
  function api(method, path, body) {
    var opts = { method: method, headers: { "authorization": "Bearer " + token() }, cache: "no-store" };
    if (body) { opts.headers["content-type"] = "application/json"; opts.body = JSON.stringify(body); }
    return withTimeout(fetch(path.indexOf("/api/") === 0 ? path : API + path, opts), 12000).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401 && d.login) { setSes(null); showLogin(d.error); }
        if (!r.ok || !d.ok) throw new Error(d.error || ("Error " + r.status));
        return d;
      });
    });
  }

  /* sin zoom con dos dedos en Safari de iOS (no respeta user-scalable=no ni touch-action) */
  ["gesturestart", "gesturechange"].forEach(function (ev) { document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false }); });

  /* sonido de aviso (Safari pide un toque antes de poder sonar) */
  var audio = null;
  function unlockAudio() {
    if (audio) { if (audio.state === "suspended") audio.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { audio = new AC(); var b = audio.createBuffer(1, 1, 22050), s = audio.createBufferSource(); s.buffer = b; s.connect(audio.destination); s.start(0); } catch (e) { audio = null; }
  }
  function beep() {
    if (!audio || db.settings.mute) return;
    try {
      [0, 0.28, 0.56].forEach(function (d, i) {
        var o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + d;
        o.type = "sine"; o.frequency.value = i === 2 ? 1175 : 880;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + 0.26);
      });
    } catch (e) {}
  }
  document.addEventListener("touchend", unlockAudio, true);
  document.addEventListener("click", unlockAudio, true);

  function poll() {
    if (!token() || ped.busy || document.hidden) return;
    ped.busy = true;
    api("GET", "").then(function (d) {
      ped.busy = false; ped.ok = true; ped.error = "";
      var fresh = [];
      d.pedidos.forEach(function (p) {
        if (!ped.known[p.key] && p.estado === "nuevo" && !ped.first) fresh.push(p);
        ped.known[p.key] = true;
      });
      ped.first = false;
      ped.list = d.pedidos;
      if (d.catalogoV != null && d.catalogoV !== db.catalogo.v) cargarCatalogo();
      if (++promos.vueltas % 6 === 1) cargarPromos();   /* cada minuto */
      if (fresh.length) { ped.banner = fresh[fresh.length - 1].key; beep(); }
      refreshPedidos();
    }).catch(function (e) {
      ped.busy = false; ped.ok = false; ped.error = e.message === "tiempo" || e.message === "Failed to fetch" || /network|load/i.test(e.message) ? "Sin conexión, reintentando…" : e.message;
      refreshPedidos();
    });
  }
  setInterval(poll, 10000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { poll(); cargarCatalogo(); } });

  /* actualiza solo lo que cambia, para no interrumpir una venta */
  function refreshPedidos() {
    var n = nuevos(), badge = $("badge");
    if (badge) { badge.textContent = n; badge.hidden = !n; }
    var b = $("banner");
    if (ped.banner && findPed(ped.banner) && findPed(ped.banner).estado === "nuevo" && !(state.view === "orders" && ped.open)) {
      var p = findPed(ped.banner);
      b.innerHTML = '<button type="button" data-openped="' + esc(p.key) + '">Pedido nuevo #' + p.folio + " · " + esc(p.cliente.nombre) + " · " + money(p.total) + " — toca para verlo</button>";
      b.hidden = false;
    } else { b.hidden = true; }
    if (state.view === "orders" && !state.pick && !state.pay) {
      render();   /* pintar() conserva dónde iba la lista */
    }
  }

  function itemsHTML(p, big) {
    return p.lines.map(function (l) {
      return '<div class="it"><div class="it-h"><b class="q">' + l.qty + "×</b><b>" + esc(l.name) + "</b>" + (l.optLabel ? "<span>" + esc(l.optLabel) + "</span>" : "") + "</div>" +
        (l.sauces.length ? '<p class="salsa">' + esc(salsaTxt(l.sauces)) + "</p>" : "") +
        (l.sin.length ? '<p class="sin">SIN: ' + esc(l.sin.join(", ")) + "</p>" : "") +
        (big && l.lleva.length ? '<p class="lleva">Lleva: ' + esc(l.lleva.join(", ")) + "</p>" : "") +
        (l.componentes && l.componentes.length ? '<div class="comps">' + l.componentes.map(function (c) {
          return "<p><b>" + esc(c.label) + "</b>" + (c.sauces.length ? ' <span class="salsa">' + esc(salsaTxt(c.sauces)) + "</span>" : "") + (c.opcion ? " " + esc(c.opcion) : "") + (c.sin.length ? ' <span class="sin">SIN: ' + esc(c.sin.join(", ")) + "</span>" : "") + "</p>";
        }).join("") + "</div>" : "") + "</div>";
    }).join("");
  }
  function clienteHTML(p) {
    var c = p.cliente;
    var pago = c.pago === "efectivo" ? "Efectivo" + (c.pagaCon ? " · paga con " + money(c.pagaCon) + " · cambio " + money(c.pagaCon - p.total) : "") : "Transferencia · <b>revisa en el banco que llegó antes de prepararlo</b>";
    var ticket = c.ticket === "correo" ? "<p><b>Ticket:</b> mandarlo a " + esc(c.email) + "</p>" : c.ticket === "pdf" ? "<p><b>Ticket:</b> el cliente descargó su PDF</p>" : "";
    return '<div class="cli"><p><b>' + esc(c.nombre) + '</b> · <a href="tel:' + esc(c.telefono.replace(/\s/g, "")) + '">' + esc(c.telefono) + "</a></p>" +
      "<p><b>" + esc(c.entregaLabel) + "</b>" + (c.direccion ? ": " + esc(c.direccion) : "") + (c.referencias ? " <span class='note'>(" + esc(c.referencias) + ")</span>" : "") + "</p>" +
      (c.ubicacion ? '<p>Ubicación confirmada por el cliente (GPS): <a href="' + esc(puntoURL(c)) + '" target="_blank" rel="noopener">ver en Maps</a></p>' : "") +
      (c.mapa && !c.ubicacion ? '<p>Enlace de Maps del cliente: <a href="' + esc(c.mapa) + '" target="_blank" rel="noopener">abrir</a></p>' : "") +
      "<p><b>Pago:</b> " + pago + "</p>" + ticket + (c.notas ? '<p class="nota">Nota: ' + esc(c.notas) + "</p>" : "") + "</div>";
  }
  function actionsHTML(p) {
    if (ped.ask === "rechazar-" + p.key) {
      return '<div class="confirm"><p>¿Cancelar el pedido #' + p.folio + "? El cliente lo verá en su página de seguimiento" + (p.estado === "nuevo" ? "." : ". Si ya pagó por transferencia, llámale para regresarle su dinero.") + "</p>" +
        '<div class="row2"><button type="button" class="btn ghost" data-pact="no">No</button><button type="button" class="btn red" data-pact="rechazado" data-key="' + esc(p.key) + '">Sí, cancelar</button></div></div>';
    }
    var b = [];
    if (p.estado === "nuevo") { b.push('<button type="button" class="btn ghost" data-pask="rechazar-' + esc(p.key) + '">Rechazar</button>'); b.push('<button type="button" class="btn" data-pact="aceptado" data-key="' + esc(p.key) + '">Aceptar pedido</button>'); }
    if (p.estado === "aceptado") b.push('<button type="button" class="btn dark" data-pact="preparando" data-key="' + esc(p.key) + '">Empezar a preparar</button>');
    if (p.estado === "aceptado" || p.estado === "preparando") b.push('<button type="button" class="btn" data-pact="listo" data-key="' + esc(p.key) + '">Ya está listo</button>');
    if (p.estado === "aceptado" || p.estado === "preparando" || p.estado === "listo") b.push('<button type="button" class="btn green" data-pcobrar="' + esc(p.key) + '">Cobrar y entregar</button>');
    if (p.cliente.entrega === "domicilio" && p.estado !== "rechazado") b.push('<button type="button" class="btn dark" data-pruta="' + esc(p.key) + '">Ruta (QR)</button>');
    if (p.estado === "aceptado" || p.estado === "preparando" || p.estado === "listo") b.push('<button type="button" class="btn ghost" data-pask="rechazar-' + esc(p.key) + '">Cancelar pedido</button>');
    return '<div class="row2">' + b.join("") + "</div>";
  }
  function ordersHTML() {
    if (!token()) {
      return '<div class="page"><div class="page-in"><h2>Pedidos del menú</h2><div class="card"><p>Entra con el usuario y la contraseña de la caja para ver los pedidos.</p>' +
        '<button type="button" class="btn" data-act="show-login">Entrar</button></div></div></div>';
    }
    var list = ped.tab === "activos" ? activos().slice().reverse() : ped.list.filter(function (p) { return p.estado === "entregado" || p.estado === "rechazado"; }).reverse();
    var status = ped.ok === false ? '<p class="conn bad">' + esc(ped.error) + "</p>" : ped.ok ? '<p class="conn">Conectado · se actualiza solo</p>' : '<p class="conn">Conectando…</p>';
    var cards = list.map(function (p) {
      return '<button type="button" class="ord st-' + p.estado + '" data-openped="' + esc(p.key) + '"><div class="ord-h"><b>#' + p.folio + "</b><span>" + hora(p.creado) + " · " + ago(p.creado) + '</span><i class="pill">' + ESTADO_TXT[p.estado] + "</i></div>" +
        '<p class="who">' + esc(p.cliente.nombre) + " · " + esc(p.cliente.entregaLabel) + "</p>" + itemsHTML(p, false) +
        '<div class="ord-f"><span>' + (p.cliente.pago === "efectivo" ? "Efectivo" : "Transferencia") + "</span><b>" + money(p.total) + "</b></div></button>";
    }).join("");
    var n = activos().length;
    return '<div class="page"><div class="page-in wide"><div class="ord-top"><h2>Pedidos del menú</h2>' + status + "</div>" +
      '<div class="seg" style="margin-bottom:12px"><button type="button" data-ptab="activos" class="' + (ped.tab === "activos" ? "on" : "") + '">Por atender (' + n + ')</button><button type="button" data-ptab="hechos" class="' + (ped.tab === "hechos" ? "on" : "") + '">Terminados</button></div>' +
      (cards ? '<div class="ords">' + cards + "</div>" : '<p class="empty">' + (ped.tab === "activos" ? "No hay pedidos por atender. Los nuevos aparecen aquí solos." : "Todavía no hay pedidos terminados.") + "</p>") +
      "</div></div>";
  }
  /* comanda en grande para leerla desde lejos */
  function comandaHTML(p) {
    return '<div class="overlay big-ov"><div class="comanda st-' + p.estado + '">' +
      '<div class="cm-head"><div><b>Pedido #' + p.folio + "</b><span>" + hora(p.creado) + " · " + ago(p.creado) + '</span></div><i class="pill">' + ESTADO_TXT[p.estado] + '</i><button type="button" class="x" data-act="close-ped" aria-label="Cerrar">×</button></div>' +
      '<div class="cm-body"><div class="cm-items">' + itemsHTML(p, true) + '</div><div class="cm-side">' + clienteHTML(p) +
      '<div class="cm-total"><span>Total</span><b>' + money(p.total) + "</b></div></div></div>" +
      '<div class="cm-foot">' + actionsHTML(p) + "</div></div></div>";
  }
  function setEstado(key, estado, extra) {
    var p = findPed(key); if (!p) return;
    var prev = p.estado; p.estado = estado; ped.ask = null;
    renderLayer(); refreshPedidos();
    var body = { key: key, estado: estado }; if (extra) for (var k in extra) body[k] = extra[k];
    api("POST", "/estado", body).then(function (d) {
      var i = ped.list.indexOf(p); if (i >= 0) ped.list[i] = d.pedido;
      renderLayer(); refreshPedidos();
    }).catch(function (e) { p.estado = prev; toast("No se pudo guardar: " + e.message); renderLayer(); refreshPedidos(); });
  }
  function rutaPedido(key) {
    var p = findPed(key); if (!p) return;
    var c = p.cliente;
    openRuta("Pedido web #" + p.folio + " · " + c.nombre + " · " + money(p.total), c.direccion,
      (c.referencias ? "Referencias: " + c.referencias + ". " : "") + "Tel. " + c.telefono + (c.pago === "efectivo" && c.pagaCon ? " · paga con " + money(c.pagaCon) : ""), puntoURL(c, true));
  }
  /* pasa el pedido al ticket para cobrarlo y que cuente en el corte */
  function cobrarPedido(key) {
    var p = findPed(key); if (!p) return;
    state.cart = []; state.showTicket = false;
    p.lines.forEach(function (l) {
      if (!prod(l.pid)) return;
      addLine({ pid: l.pid, opt: l.opt, sauces: l.sauces.slice(), quitar: l.sin.slice(), qty: l.qty, price: l.price,
        comps: (l.componentes || []).map(function (c) { return { sauces: c.sauces.slice(), quitar: c.sin.slice(), opcion: c.opcion || "" }; }) });
    });
    state.ranch = conRanch(state.cart);
    state.tipo = p.cliente.entrega === "domicilio" ? "domicilio" : "llevar";
    state.dir = ((p.cliente.direccion || "") + (p.cliente.ubicacion || p.cliente.mapa ? " " + puntoURL(p.cliente) : "")).trim();
    state.nota = "Pedido web #" + p.folio + " · " + p.cliente.nombre;
    state.fromPedido = key; state.fromPend = null;
    ped.open = null; state.view = "sell";
    render();
    state.pay = { metodo: p.cliente.pago === "transferencia" ? "transferencia" : "efectivo", recv: p.cliente.pagaCon ? String(p.cliente.pagaCon) : "", done: null };
    renderLayer();
  }
  document.addEventListener("keydown", function (e) {
    if ((e.keyCode === 13 || e.key === "Enter") && (e.target.id === "l-pass" || e.target.id === "l-user")) { e.preventDefault(); doLogin(); }
  });
  cargarCatalogo();
  poll();

  render();
  if (!token()) showLogin(ses && ses.token ? "La sesión venció. Vuelve a entrar." : "");

  /* funciona sin internet una vez abierta */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
