/* Caja El Carboncito
   Compatible con Safari de iOS 12: sin "?.", sin "??", sin campos de clase. */
(function () {
  "use strict";

  /* =========================================================
     PRODUCTOS (mismos precios que el menú web)
     opts: [nombre, precio]; quitar: lo que se puede pedir "sin"
     ========================================================= */
  var VEG = ["Lechuga", "Jitomate", "Cebolla", "Chile en vinagre", "Catsup", "Mostaza"];
  var HD = ["Jitomate", "Cebolla", "Catsup", "Mostaza"];
  var CATS = [
    { id: "burgers", name: "Hamburguesas" },
    { id: "snacks", name: "Hotdogs y botanas" },
    { id: "wings", name: "Alitas" }
  ];
  var PRODUCTS = [
    { id: "sencilla", cat: "burgers", name: "Sencilla", opts: [["Con papas", 60], ["Sin papas", 50]], quitar: ["Queso amarillo"].concat(VEG) },
    { id: "hawaiana", cat: "burgers", name: "Hawaiana", opts: [["Con papas", 70], ["Sin papas", 60]], quitar: ["Queso amarillo", "Jamón", "Piña asada"].concat(VEG) },
    { id: "bbq", cat: "burgers", name: "BBQ", opts: [["Con papas", 70], ["Sin papas", 60]], quitar: ["Queso amarillo", "Jamón", "Tocino"].concat(VEG) },
    { id: "loba", cat: "burgers", name: "Loba", opts: [["Con papas", 80], ["Sin papas", 70]], quitar: ["Queso amarillo", "Jamón", "Salchicha"].concat(VEG) },
    { id: "monstruo", cat: "burgers", name: "Monstruo", opts: [["Con papas", 100], ["Sin papas", 90]], quitar: ["Queso amarillo", "Jamón", "Salchicha", "Tocino", "Piña asada"].concat(VEG) },
    { id: "hotdog", cat: "snacks", name: "Hotdog sencillo", opts: [["1 hotdog", 20], ["3 hotdogs", 40]], quitar: HD },
    { id: "hotdog-tocino", cat: "snacks", name: "Hotdog con tocino", opts: [["1 hotdog", 25], ["3 hotdogs", 50]], quitar: HD },
    { id: "salchipulpos", cat: "snacks", name: "Salchipulpos", opts: [["Chico (4 pulpos)", 40], ["Grande (6 pulpos)", 60]], quitar: ["Queso de nachos", "Catsup", "Valentina"] },
    { id: "papas", cat: "snacks", name: "Orden de papas", opts: [["Chica", 30], ["Grande", 50]], quitar: [] },
    { id: "alitas", cat: "wings", name: "Alitas", opts: [["Orden de 10", 110]], sauces: true, quitar: ["Cama de lechuga", "Zanahoria", "Pepino", "Jícama", "Ranch"] }
  ];
  var SAUCES = ["Receta secreta sin salsa", "Piña habanero", "Mango habanero", "Tamarindo picante", "BBQ picante", "BBQ dulce"];
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
    cart: [], tipo: "aqui", nota: "",
    openSale: null, confirm: null,
    pick: null, pay: null
  };

  /* reloj */
  function tick() {
    var d = new Date(), h = d.getHours(), ap = h >= 12 ? "pm" : "am";
    $("clock").textContent = (h % 12 || 12) + ":" + pad(d.getMinutes()) + " " + ap;
  }
  tick(); setInterval(tick, 20000);

  /* =========================================================
     TICKET EN CURSO
     ========================================================= */
  function lineKey(l) { return [l.pid, l.opt, l.sauces.join("+"), l.quitar.slice().sort().join(",")].join("|"); }
  function lineDesc(l) {
    var p = prod(l.pid), parts = [];
    if (p.opts.length > 1) parts.push(p.opts[l.opt][0]);
    if (l.sauces.length === 2) parts.push("Mitad " + l.sauces[0] + " y mitad " + l.sauces[1]);
    else if (l.sauces.length === 1) parts.push(l.sauces[0] === SAUCES[0] ? SAUCES[0] : "Salsa " + l.sauces[0]);
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

  function sellHTML() {
    var tiles = PRODUCTS.filter(function (p) { return p.cat === state.cat; }).map(function (p) {
      var out = db.settings.soldOut[p.id];
      return '<button type="button" class="tile' + (out ? " out" : "") + '" data-add="' + p.id + '">' +
        '<img src="img/' + p.id + '.png" alt="">' +
        "<b>" + esc(p.name) + "</b><span>" + (p.cat === "burgers" ? money(price(p, 0)) : (p.opts.length > 1 ? "desde " : "") + money(minPrice(p))) + "</span></button>";
    }).join("");
    var cats = CATS.map(function (c) { return '<button type="button" data-cat="' + c.id + '" class="' + (c.id === state.cat ? "on" : "") + '">' + esc(c.name) + "</button>"; }).join("");
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
    var t = cartTotal();
    return '<div class="t-head"><button type="button" class="back-cat" data-act="hide-ticket">‹ Productos</button><h2>Ticket</h2><span class="folio">Venta #' + db.shift.next + "</span></div>" +
      '<div class="lines">' + lines + "</div>" +
      '<div class="t-meta"><div class="seg">' + tipos + '</div><input id="nota" type="text" placeholder="Nombre o nota (opcional)" value="' + esc(state.nota) + '" autocomplete="off"></div>' +
      '<div class="t-foot"><div class="total"><span>Total</span><b>' + money(t) + "</b></div>" +
      '<div class="row2"><button type="button" class="btn ghost" data-act="clear"' + (state.cart.length ? "" : " disabled") + '>Vaciar</button><button type="button" class="btn" data-act="pay"' + (state.cart.length ? "" : " disabled") + ">Cobrar " + money(t) + "</button></div></div>";
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
      '<div class="card"><label class="field"><span>PIN de la caja (el mismo de CAJA_PIN en Netlify)</span><input id="pin-set" type="password" inputmode="numeric" value="' + esc(db.settings.pin || "") + '"></label>' +
      '<p class="note">' + (ped.ok ? "Conectado." : ped.ok === false ? esc(ped.error) : "Sin conectar todavía.") + "</p>" +
      '<button type="button" class="chk' + (db.settings.mute ? " on" : "") + '" data-act="mute">' + (db.settings.mute ? "Sonido de aviso apagado" : "Sonido de aviso encendido") + "</button></div>" +
      "<h3>Envío del corte</h3>" +
      '<div class="card"><label class="field"><span>WhatsApp que recibe el corte (con 52 al inicio)</span><input id="wa" type="tel" value="' + esc(db.settings.wa) + '"></label></div>' +
      "<h3>Respaldo</h3>" +
      '<div class="card"><p class="note">Las ventas solo viven en este iPad. Envía el corte por WhatsApp cada noche y, de vez en cuando, copia este respaldo y guárdalo en un chat.</p>' +
      '<div class="row2"><button type="button" class="btn dark" data-act="copy-backup">Copiar respaldo</button><button type="button" class="btn ghost" data-act="show-import">Restaurar respaldo</button></div>' +
      (state.confirm === "import" ? '<label class="field" style="margin-top:10px"><span>Pega aquí el respaldo</span><textarea id="imp"></textarea></label><div class="row2"><button type="button" class="btn ghost" data-act="no">Cancelar</button><button type="button" class="btn red" data-act="do-import">Reemplazar datos con este respaldo</button></div>' : "") +
      "</div>" +
      '<p class="note" style="text-align:center;margin-top:20px">Caja El Carboncito · versión 2</p>' +
      "</div></div>";
  }

  /* =========================================================
     VENTANA: elegir opciones de un producto
     ========================================================= */
  function openPick(p) {
    state.pick = { pid: p.id, opt: 0, sauces: p.sauces ? [SAUCES[0]] : [], quitar: [], qty: 1 };
    renderLayer();
  }
  function pickHTML() {
    var s = state.pick, p = prod(s.pid);
    var opts = p.opts.length > 1 ? "<h4>Opción</h4>" + p.opts.map(function (o, i) {
      return '<button type="button" class="opt' + (s.opt === i ? " on" : "") + '" data-popt="' + i + '"><i class="dot"></i><span>' + esc(o[0]) + "</span><b>" + money(price(p, i)) + "</b></button>";
    }).join("") : "";
    var sauces = p.sauces ? "<h4>Salsa <small>· toca dos para mitad y mitad</small></h4><div class='chips'>" + SAUCES.map(function (n) {
      return '<button type="button" class="chip' + (s.sauces.indexOf(n) >= 0 ? " on" : "") + '" data-sauce="' + esc(n) + '">' + esc(n) + "</button>";
    }).join("") + "</div>" : "";
    var quitar = p.quitar.length ? "<h4>Quitar <small>· toca lo que no lleva</small></h4><div class='chips'>" + p.quitar.map(function (n) {
      return '<button type="button" class="chip' + (s.quitar.indexOf(n) >= 0 ? " off" : "") + '" data-quitar="' + esc(n) + '">' + esc(n) + "</button>";
    }).join("") + "</div>" : "";
    var total = price(p, s.opt) * s.qty;
    return '<div class="overlay"><div class="modal">' +
      '<div class="m-head"><img src="img/' + p.id + '.png" alt=""><h2>' + esc(p.name) + '</h2><button type="button" class="x" data-act="close-layer" aria-label="Cerrar">×</button></div>' +
      '<div class="m-body">' + opts + sauces + quitar + "</div>" +
      '<div class="m-foot"><div class="step"><button type="button" data-pq="-1">−</button><output>' + s.qty + '</output><button type="button" data-pq="1">+</button></div>' +
      '<button type="button" class="btn" data-act="add-line">Agregar · ' + money(total) + "</button></div></div></div>";
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
        '</div><div class="m-foot"><button type="button" class="btn" data-act="new-sale">Nueva venta</button></div></div></div>';
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
      tipo: state.tipo, nota: state.nota.trim(), cancelada: false,
      lines: state.cart.map(function (l) {
        var p = prod(l.pid);
        return { pid: l.pid, name: p.name, opt: p.opts.length > 1 ? p.opts[l.opt][0] : "", desc: lineDesc(l), qty: l.qty, price: l.price };
      })
    };
    if (state.fromPedido) { var wp = findPed(state.fromPedido); if (wp) sale.web = wp.folio; setEstado(state.fromPedido, "entregado", { ventaFolio: sale.folio }); state.fromPedido = null; }
    db.shift.sales.push(sale); db.shift.next++; save();
    s.done = sale;
    state.cart = []; state.nota = ""; state.tipo = "aqui"; state.showTicket = false;
  }

  function renderLayer() {
    var L = $("layer");
    if (state.pick) L.innerHTML = pickHTML();
    else if (state.pay) L.innerHTML = payHTML();
    else if (ped.open && findPed(ped.open)) L.innerHTML = comandaHTML(findPed(ped.open));
    else L.innerHTML = "";
  }
  function closeLayer() { state.pick = null; state.pay = null; ped.open = null; ped.ask = null; renderLayer(); }

  /* =========================================================
     EVENTOS
     ========================================================= */
  function attr(el, name) { return el.getAttribute(name); }
  function find(t, sel) { return t.closest ? t.closest(sel) : null; }

  document.addEventListener("click", function (e) {
    var t = e.target, el;

    /* aviso de pedido nuevo (funciona desde cualquier pantalla) */
    if (!state.pick && !state.pay && (el = find(t, "[data-openped]"))) {
      ped.open = attr(el, "data-openped"); ped.ask = null; ped.banner = null; $("banner").hidden = true; return renderLayer();
    }
    /* comanda en grande */
    if (ped.open && !state.pick && !state.pay) {
      if ((el = find(t, "[data-pact]"))) { if (attr(el, "data-pact") === "no") { ped.ask = null; return renderLayer(); } return setEstado(attr(el, "data-key"), attr(el, "data-pact")); }
      if ((el = find(t, "[data-pask]"))) { ped.ask = attr(el, "data-pask"); return renderLayer(); }
      if ((el = find(t, "[data-pcobrar]"))) return cobrarPedido(attr(el, "data-pcobrar"));
      if (find(t, '[data-act="close-ped"]') || t.className === "overlay big-ov") { ped.open = null; ped.ask = null; return renderLayer(); }
      if (find(t, ".wa-cli") || find(t, ".cli a")) return;
      return;
    }
    if ((el = find(t, "[data-ptab]"))) { ped.tab = attr(el, "data-ptab"); return render(); }
    if (find(t, '[data-act="save-pin"]')) { db.settings.pin = ($("pin").value || "").trim(); save(); ped.first = true; ped.ok = null; render(); poll(); return; }
    if (find(t, '[data-act="mute"]')) { db.settings.mute = !db.settings.mute; save(); if (!db.settings.mute) beep(); return render(); }

    /* ventana de opciones */
    if (state.pick) {
      var s = state.pick, p = prod(s.pid);
      if ((el = find(t, "[data-popt]"))) { s.opt = Number(attr(el, "data-popt")); return renderLayer(); }
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
      if ((el = find(t, "[data-pq]"))) { s.qty = Math.max(1, Math.min(50, s.qty + Number(attr(el, "data-pq")))); return renderLayer(); }
      if (find(t, '[data-act="add-line"]')) {
        addLine({ pid: s.pid, opt: s.opt, sauces: s.sauces.slice(), quitar: s.quitar.slice(), qty: s.qty, price: price(p, s.opt) });
        closeLayer(); return render();
      }
      if (find(t, '[data-act="close-layer"]') || (t.className === "overlay")) return closeLayer();
      return;
    }

    /* ventana de cobro */
    if (state.pay) {
      var py = state.pay;
      if (find(t, '[data-act="new-sale"]')) { closeLayer(); return render(); }
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
    if ((el = find(t, "[data-add]"))) {
      var pr = prod(attr(el, "data-add"));
      if (db.settings.soldOut[pr.id]) { toast(pr.name + " está marcado como agotado"); return; }
      return openPick(pr);
    }
    if ((el = find(t, "[data-line]"))) {
      var ln = state.cart[Number(attr(el, "data-line"))];
      ln.qty += Number(attr(el, "data-d"));
      if (ln.qty < 1) state.cart.splice(state.cart.indexOf(ln), 1);
      if (!state.cart.length) state.showTicket = false;
      return render();
    }
    if ((el = find(t, "[data-tipo]"))) { state.tipo = attr(el, "data-tipo"); return render(); }
    if (find(t, '[data-act="clear"]')) { state.cart = []; state.nota = ""; state.showTicket = false; state.fromPedido = null; return render(); }
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
        db = data; save(); state.confirm = null; toast("Respaldo restaurado"); return render();
      } catch (err) { toast("Ese texto no es un respaldo válido"); return; }
    }
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "nota") state.nota = t.value;
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
    if (t.id === "pin-set") { db.settings.pin = t.value.trim(); save(); ped.first = true; ped.ok = null; toast("PIN guardado"); poll(); }
  });

  /* =========================================================
     PEDIDOS DEL MENÚ WEB
     La caja pregunta al servidor cada 10 segundos si hay pedidos nuevos.
     ========================================================= */
  var API = "/api/pedidos";
  var ped = { list: [], known: {}, ok: null, error: "", tab: "activos", open: null, ask: null, busy: false, banner: null, first: true };
  var ESTADO_TXT = { nuevo: "Nuevo", aceptado: "Preparando", listo: "Listo", entregado: "Entregado", rechazado: "Rechazado" };
  function pin() { return db.settings.pin || ""; }
  function activos() { return ped.list.filter(function (p) { return p.estado === "nuevo" || p.estado === "aceptado" || p.estado === "listo"; }); }
  function nuevos() { return ped.list.filter(function (p) { return p.estado === "nuevo"; }).length; }
  function findPed(key) { for (var i = 0; i < ped.list.length; i++) if (ped.list[i].key === key) return ped.list[i]; return null; }
  function ago(iso) {
    var m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    return m < 1 ? "ahora" : m < 60 ? "hace " + m + " min" : "hace " + Math.floor(m / 60) + " h " + (m % 60) + " min";
  }
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("tiempo")); }, ms); })]); }
  function api(method, path, body) {
    var opts = { method: method, headers: { "x-caja-pin": pin() }, cache: "no-store" };
    if (body) { opts.headers["content-type"] = "application/json"; opts.body = JSON.stringify(body); }
    return withTimeout(fetch(API + path, opts), 12000).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
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
    if (!pin() || ped.busy || document.hidden) return;
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
        (l.sauces.length ? '<p class="salsa">' + (l.sauces.length === 2 ? "Mitad " + esc(l.sauces[0]) + " / mitad " + esc(l.sauces[1]) : esc(l.sauces[0])) + "</p>" : "") +
        (l.sin.length ? '<p class="sin">SIN: ' + esc(l.sin.join(", ")) + "</p>" : "") +
        (big ? '<p class="lleva">Lleva: ' + esc(l.lleva.join(", ")) + "</p>" : "") + "</div>";
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
    return '<div class="row2">' + b.join("") + '</div><a class="wa-cli" href="' + esc(wa) + '" target="_blank" rel="noopener">Escribirle por WhatsApp</a>';
  }
  function ordersHTML() {
    if (!pin()) {
      return '<div class="page"><div class="page-in"><h2>Pedidos del menú</h2><div class="card"><p>Para recibir los pedidos del menú web, escribe el PIN de la caja. Es el mismo que se configuró en Netlify como CAJA_PIN.</p>' +
        '<label class="field"><span>PIN de la caja</span><input id="pin" type="password" inputmode="numeric" autocomplete="off"></label><button type="button" class="btn" data-act="save-pin">Conectar</button></div></div></div>';
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
  /* pasa el pedido al ticket para cobrarlo y que cuente en el corte */
  function cobrarPedido(key) {
    var p = findPed(key); if (!p) return;
    state.cart = []; state.showTicket = false;
    p.lines.forEach(function (l) {
      if (!prod(l.pid)) return;
      addLine({ pid: l.pid, opt: l.opt, sauces: l.sauces.slice(), quitar: l.sin.slice(), qty: l.qty, price: l.price });
    });
    state.tipo = p.cliente.entrega === "domicilio" ? "domicilio" : "llevar";
    state.nota = "Pedido web #" + p.folio + " · " + p.cliente.nombre;
    state.fromPedido = key;
    ped.open = null; state.view = "sell";
    render();
    state.pay = { metodo: p.cliente.pago === "transferencia" ? "transferencia" : "efectivo", recv: p.cliente.pagaCon ? String(p.cliente.pagaCon) : "", done: null };
    renderLayer();
  }
  poll();

  render();

  /* funciona sin internet una vez abierta */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
