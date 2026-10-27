/* Guarda la caja en el iPad para que abra sin internet. Cambia VERSION al publicar cambios. */
var VERSION = "caja-v6";
var FILES = ["./", "index.html", "app.js", "manifest.webmanifest", "icon-180.png", "icon-512.png",
  "img/sencilla.png", "img/hawaiana.png", "img/bbq.png", "img/loba.png", "img/monstruo.png",
  "img/hotdog.png", "img/hotdog-tocino.png", "img/salchipulpos.png", "img/papas.png", "img/alitas.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* primero la red (para recibir cambios); si no hay internet, lo guardado */
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); }); }));
});
