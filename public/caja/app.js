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
  function imgOf(p) { var f = p.img == null ? p.id : p.img; return f ? '<img src="img/' + f + '.png" alt="">' : ""; }
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
  function openRuta(title, dir, extra) { state.qr = { title: title, dir: dir, extra: extra || "", url: rutaURL(dir) }; renderLayer(); }
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
    if (state.view === "sell") v.innerHTML = sellHTML();
    else if (state.view === "sales") v.innerHTML = salesHTML();
    else if (state.view === "close") v.innerHTML = closeHTML();
    else if (state.view === "orders") v.innerHTML = ordersHTML();
    else v.innerHTML = settingsHTML();
  }

  /* tarjetas: solo foto grande y nombre. Los precios se ven en el ticket. */
  function sellHTML() {
    var tiles;
    if (state.cat === "wings") {
      /* alitas: un botón por sabor */
      var agotadas = db.settings.soldOut.alitas;
      tiles = SAUCES.map(function (n) {
        return '<button type="button" class="tile sabor' + (agotadas ? " out" : "") + '" data-sabor="' + esc(n) + '" style="border-bottom-color:' + TONO[n] + '">' +
          '<img src="img/alitas-' + SLUG[n] + '-10.png" alt=""><b>' + esc(n) + "</b></button>";
      }).join("") +
        /* para pedidos con varios sabores: se reparten las alitas con un contador */
        '<button type="button" class="tile sabor perso' + (agotadas ? " out" : "") + '" data-act="alas-perso"><img src="img/alitas.png" alt=""><b>Alitas personalizadas</b></button>';
    } else {
      tiles = PRODUCTS.filter(function (p) { return p.cat === state.cat && !p.hidden; }).map(function (p) {
        var out = db.settings.soldOut[p.id] || p.disponible === false, draft = !sellable(p) && p.disponible !== false;
        return '<button type="button" class="tile' + (draft ? " draft" : out ? " out" : "") + '" data-add="' + p.id + '">' + imgOf(p) +
          "<b>" + esc(p.tile || p.name) + "</b></button>";
      }).join("");
    }
    if (state.cat === "drinks") {
      /* espacios "Próximamente" hasta completar BEBIDA_ESPACIOS; las bebidas reales los van ocupando */
      var hay = PRODUCTS.filter(function (p) { return p.cat === "drinks" && !p.hidden; }).length;
      for (var b = hay; b < BEBIDA_ESPACIOS; b++) tiles += '<div class="tile slot"><span class="slot-pic"></span><b>Próximamente</b><small>Bebida por confirmar</small></div>';
    }
    if (!tiles) tiles = '<p class="empty">No hay productos en esta sección.</p>';
    var cats = CATS.map(function (c) { return '<button type="button" data-cat="' + c.id + '" class="' + (c.id === state.cat ? "on" : "") + '">' + esc(c.name) + "</button>"; }).join("") +
      (db.pendientes.length ? '<button type="button" class="pend" data-act="show-pend">Cuentas (' + db.pendientes.length + ")</button>" : "");
    var n = cartCount(), t = cartTotal();
    return '<div class="sell' + (state.showTicket ? " show-ticket" : "") + '">' +
      '<div class="catalog"><div class="cats">' + cats + '</div><div class="grid">' + tiles + "</div>" +
      '<div class="mini-bar"><button type="button" class="btn" data-act="show-ticket"' + (n ? "" : " disabled") + ">Ver ticket (" + n + ") · " + money(t) + "</button></div></div>" +
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

  function settingsHTML() {
    var rows = PRODUCTS.map(function (p) {
      if (!sellable(p) && p.disponible !== false) {
        return "<tr><td><b>" + esc(p.name) + '</b> <span class="tag">Borrador</span><br><span class="note">' + esc(pendientes(p).join(" · ")) + '</span></td><td class="r">' +
          (typeof p.opts[0][1] === "number" ? money(p.opts[0][1]) : "Sin precio") + "</td><td></td></tr>";
      }
      return p.opts.map(function (o, i) {
        return "<tr><td>" + (i === 0 ? "<b>" + esc(p.name) + "</b>" : "") + (p.opts.length > 1 ? " <span class='note'>" + esc(o[0]) + "</span>" : "") + "</td>" +
          '<td class="r"><input type="number" inputmode="decimal" data-price="' + p.id + '" data-opt="' + i + '" value="' + price(p, i) + '"></td>' +
          '<td class="r">' + (i === 0 ? '<button type="button" class="chk' + (db.settings.soldOut[p.id] ? " on" : "") + '" data-out="' + p.id + '">' + (db.settings.soldOut[p.id] ? "Agotado" : "Disponible") + "</button>" : "") + "</td></tr>";
      }).join("");
    }).join("");
    return '<div class="page"><div class="page-in"><h2>Ajustes</h2>' +
      "<h3>Precios y disponibilidad</h3>" +
      '<div class="card prices"><table><tr><th>Producto</th><th class="r">Precio</th><th class="r"></th></tr>' + rows + "</table>" +
      '<p class="note">Los cambios se guardan al salir de cada casilla. Si cambias un precio aquí, cámbialo también en el menú web.</p></div>' +
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
      else if (r && r.sauces) h += "<div class='chips'>" + SAUCES.map(function (n) {
        return '<button type="button" class="chip' + (ps.sauces.indexOf(n) >= 0 ? " on" : "") + '" data-part="' + i + '" data-psauce="' + esc(n) + '">' + esc(n) + "</button>";
      }).join("") + "</div>";
      if (r && r.quitar.length) h += "<div class='chips'>" + r.quitar.map(function (n) {
        return '<button type="button" class="chip' + (ps.quitar.indexOf(n) >= 0 ? " off" : "") + '" data-part="' + i + '" data-pquitar="' + esc(n) + '">Sin ' + esc(n.toLowerCase()) + "</button>";
      }).join("") + "</div>";
      /* opciones (el refresco del combo): las que se pueden vender y no están agotadas */
      if (c.opciones) h += "<div class='chips'>" + c.opciones.map(prod).filter(function (o) { return o && sellable(o) && !db.settings.soldOut[o.id]; }).map(function (o) {
        return '<button type="button" class="chip' + (ps.opcion === o.id ? " on" : "") + '" data-part="' + i + '" data-popcion="' + o.id + '">' + esc(o.name) + "</button>";
      }).join("") + "</div>";
      return '<div class="part">' + h + "</div>";
    }).join("");
  }
  function pickHTML() {
    var s = state.pick, p = prod(s.pid), venta = sellable(p);
    if (p.parts) {
      var foot = venta
        ? '<div class="m-foot"><div class="step"><button type="button" data-pq="-1">−</button><output>' + s.qty + '</output><button type="button" data-pq="1">+</button></div>' +
          '<button type="button" class="btn" data-act="add-line">Agregar</button></div>'
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
        '<button type="button" class="btn" data-act="add-line">Agregar</button></div>'
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
    s.done = sale;
    resetTicket();
  }

  function renderLayer() {
    var L = $("layer");
    if (state.qr) L.innerHTML = qrHTML();
    else if (state.pick) L.innerHTML = pickHTML();
    else if (state.pay) L.innerHTML = payHTML();
    else if (state.pend) L.innerHTML = pendHTML();
    else if (ped.open && findPed(ped.open)) L.innerHTML = comandaHTML(findPed(ped.open));
    else L.innerHTML = "";
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
      if (find(t, ".wa-cli") || find(t, ".cli a")) return;
      return;
    }
    if ((el = find(t, "[data-ptab]"))) { ped.tab = attr(el, "data-ptab"); return render(); }
    if (find(t, '[data-act="show-login"]')) return showLogin();
    if (find(t, '[data-act="logout"]')) return logout();
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
        if (!p.base && db.settings.soldOut[p.tocino]) { toast("El hotdog con tocino está marcado como agotado"); return; }
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
      if (db.settings.soldOut.alitas) { toast("Las alitas están marcadas como agotadas"); return; }
      return openPick(prod("alitas"), "", true);
    }
    if ((el = find(t, "[data-sabor]"))) {
      if (db.settings.soldOut.alitas) { toast("Las alitas están marcadas como agotadas"); return; }
      return openPick(prod("alitas"), attr(el, "data-sabor"));
    }
    if ((el = find(t, "[data-ranch]"))) { setRanch(attr(el, "data-ranch") === "1"); return render(); }
    if ((el = find(t, "[data-add]"))) {
      var pr = prod(attr(el, "data-add"));
      if (db.settings.soldOut[pr.id] || pr.disponible === false) { toast(pr.name + " no está disponible"); return; }
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
    if ((el = find(t, "[data-out]"))) { var id = attr(el, "data-out"); db.settings.soldOut[id] = !db.settings.soldOut[id]; save(); return render(); }
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
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
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
  var ESTADO_TXT = { nuevo: "Nuevo", aceptado: "Preparando", listo: "Listo", entregado: "Entregado", rechazado: "Rechazado" };
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
  function activos() { return ped.list.filter(function (p) { return p.estado === "nuevo" || p.estado === "aceptado" || p.estado === "listo"; }); }
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
    return withTimeout(fetch(API + path, opts), 12000).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401 && d.login) { setSes(null); showLogin(d.error); }
        if (!r.ok || !d.ok) throw new Error(d.error || ("Error " + r.status));
        return d;
      });
    });
  }

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
      if (fresh.length) { ped.banner = fresh[fresh.length - 1].key; beep(); }
      refreshPedidos();
    }).catch(function (e) {
      ped.busy = false; ped.ok = false; ped.error = e.message === "tiempo" || e.message === "Failed to fetch" || /network|load/i.test(e.message) ? "Sin conexión, reintentando…" : e.message;
      refreshPedidos();
    });
  }
  setInterval(poll, 10000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) poll(); });

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
      var y = $("view").firstChild ? $("view").firstChild.scrollTop : 0;
      render();
      if ($("view").firstChild) $("view").firstChild.scrollTop = y;
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
      "<p><b>Pago:</b> " + pago + "</p>" + ticket + (c.notas ? '<p class="nota">Nota: ' + esc(c.notas) + "</p>" : "") + "</div>";
  }
  function actionsHTML(p) {
    if (ped.ask === "rechazar-" + p.key) {
      return '<div class="confirm"><p>¿Rechazar el pedido #' + p.folio + "? Avísale al cliente por WhatsApp.</p>" +
        '<div class="row2"><button type="button" class="btn ghost" data-pact="no">No</button><button type="button" class="btn red" data-pact="rechazado" data-key="' + esc(p.key) + '">Sí, rechazar</button></div></div>';
    }
    var wa = "https://wa.me/52" + p.cliente.telefono.replace(/\D/g, "").slice(-10) + "?text=" + encodeURIComponent("Hola " + p.cliente.nombre + ", recibimos tu pedido #" + p.folio + " en El Carboncito. ");
    var b = [];
    if (p.estado === "nuevo") { b.push('<button type="button" class="btn ghost" data-pask="rechazar-' + esc(p.key) + '">Rechazar</button>'); b.push('<button type="button" class="btn" data-pact="aceptado" data-key="' + esc(p.key) + '">Aceptar pedido</button>'); }
    if (p.estado === "aceptado") b.push('<button type="button" class="btn" data-pact="listo" data-key="' + esc(p.key) + '">Ya está listo</button>');
    if (p.estado === "aceptado" || p.estado === "listo") b.push('<button type="button" class="btn green" data-pcobrar="' + esc(p.key) + '">Cobrar y entregar</button>');
    if (p.cliente.entrega === "domicilio" && p.estado !== "rechazado") b.push('<button type="button" class="btn dark" data-pruta="' + esc(p.key) + '">Ruta (QR)</button>');
    return '<div class="row2">' + b.join("") + '</div><a class="wa-cli" href="' + esc(wa) + '" target="_blank" rel="noopener">Escribirle por WhatsApp</a>';
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
      (c.referencias ? "Referencias: " + c.referencias + ". " : "") + "Tel. " + c.telefono + (c.pago === "efectivo" && c.pagaCon ? " · paga con " + money(c.pagaCon) : ""));
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
    state.dir = p.cliente.direccion || "";
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
  poll();

  render();
  if (!token()) showLogin(ses && ses.token ? "La sesión venció. Vuelve a entrar." : "");

  /* funciona sin internet una vez abierta */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
