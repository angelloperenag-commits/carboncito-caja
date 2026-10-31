/* Guarda la caja en el iPad para que abra sin internet. Cambia VERSION al publicar cambios. */
var VERSION = "caja-v22";
var FILES = ["./", "index.html", "app.js", "../js/qrcode.min.js", "manifest.webmanifest", "icon-180.png", "icon-512.png",
  "img/sencilla.png", "img/hawaiana.png", "img/bbq.png", "img/loba.png", "img/monstruo.png",
  "img/hotdog.png", "img/hotdog-tocino.png", "img/salchipulpos.png", "img/papas.png", "img/alitas.png",
  "img/combo-carboncito.png", "img/combo-rico.png", "img/domi-combo.png", "img/medio-alicombo.png",
  "img/jarritos-uva-600ml.png", "img/jarritos-pina-600ml.png", "img/jarritos-manzana-600ml.png", "img/jarritos-limon-600ml.png",
  "img/jarritos-tamarindo-600ml.png", "img/coca-cola-vidrio-500ml.png", "img/cerveza-tarro-espuma.png"].concat(
  ["receta-secreta", "pina-habanero", "mango-habanero", "tamarindo-picante", "bbq-picante", "bbq-dulce"].reduce(function (a, s) { return a.concat(["img/alitas-" + s + "-10.png", "img/alitas-" + s + "-5.png"]); }, []));
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* primero la red (para recibir cambios); si no hay internet, lo guardado.
   La API nunca se guarda (pedidos, sesión, catálogo): siempre va al servidor. Solo las fotos de productos nuevos se guardan. */
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var path = new URL(e.request.url).pathname;
  if (path.indexOf("/api/") === 0 && path.indexOf("/api/img/") !== 0) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); }); }));
});
