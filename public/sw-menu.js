/* Service worker del menú: solo avisos de pedidos. No guarda páginas ni respuestas (no hay "fetch"),
   así nada privado queda en caché. El servidor manda un aviso vacío; aquí se pregunta el estado real y se muestra. */
var LISTA = "/__mis-pedidos";
var TEXTO = {
  aceptado: function (f) { return "¡Aceptamos tu pedido " + f + "!"; },
  preparando: function (f) { return "Tu pedido " + f + " se está preparando"; },
  listo: function (f, e) { return e === "domicilio" ? "Tu pedido " + f + " está listo y va en camino" : "Tu pedido " + f + " está listo para recoger"; },
  entregado: function (f) { return "Tu pedido " + f + " fue entregado"; },
  rechazado: function (f) { return "El negocio canceló tu pedido " + f; }
};
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

function leerLista() {
  return caches.open("carboncito-avisos").then(function (c) { return c.match(LISTA); })
    .then(function (r) { return r ? r.json() : []; }).catch(function () { return []; });
}
function guardarLista(l) {
  return caches.open("carboncito-avisos").then(function (c) { return c.put(LISTA, new Response(JSON.stringify(l))); }).catch(function () {});
}
self.addEventListener("push", function (e) {
  e.waitUntil(leerLista().then(function (lista) {
    /* se pregunta cada pedido reciente de este teléfono (con su cookie o su token) y se avisa del que cambió */
    return Promise.all(lista.map(function (x) {
      return fetch("/api/seguimiento?p=" + encodeURIComponent(x.key), { cache: "no-store", credentials: "same-origin", headers: x.t ? { "x-seguimiento": x.t } : {} })
        .then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { return d && d.pedido ? { x: x, p: d.pedido } : null; }).catch(function () { return null; });
    })).then(function (res) {
      var cambio = res.filter(function (r) { return r && r.p.estado !== r.x.visto && TEXTO[r.p.estado]; }).pop();
      if (!cambio) return self.registration.showNotification("El Carboncito", { body: "Tu pedido cambió de estado. Toca para verlo.", tag: "pedido", icon: "/caja/icon-180.png", data: { url: "/" } });
      cambio.x.visto = cambio.p.estado;
      var url = "/?pedido=" + encodeURIComponent(cambio.x.key) + (cambio.x.t ? "&t=" + encodeURIComponent(cambio.x.t) : "");
      return guardarLista(lista).then(function () {
        return self.registration.showNotification("El Carboncito", { body: TEXTO[cambio.p.estado]("#" + cambio.p.folio, cambio.p.entrega),
          tag: "pedido-" + cambio.x.key, icon: "/caja/icon-180.png", data: { url: url } });
      });
    });
  }));
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) if ("focus" in cs[i]) { cs[i].navigate(url).catch(function () {}); return cs[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
