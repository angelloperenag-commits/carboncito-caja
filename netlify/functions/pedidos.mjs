import { getStore } from "@netlify/blobs";
import { handle } from "../../shared/core.mjs";

/* Pedidos del menú web hacia la caja, catálogo compartido, seguimiento del cliente y notificaciones push.
   Variables en Netlify: CAJA_USUARIO, CAJA_PASSWORD (entrada de la caja) y VAPID_PUBLIC, VAPID_PRIVATE (notificaciones; opcionales).
   El sitio de pruebas (rama "pruebas" y vistas previas) guarda en otro almacén para no mezclarse con los pedidos reales. */
const env = (k) => (globalThis.Netlify && Netlify.env.get(k)) || process.env[k] || "";

export default async (req, context) => {
  const ctx = (context && context.deploy && context.deploy.context) || process.env.CONTEXT || "production";
  const store = getStore({ name: ctx === "production" ? "pedidos" : "pedidos-pruebas", consistency: "strong" });
  const cfg = { usuario: env("CAJA_USUARIO") || "caja", password: env("CAJA_PASSWORD"), vapidPublic: env("VAPID_PUBLIC"), vapidPrivate: env("VAPID_PRIVATE"), secure: true };
  return handle(req, store, cfg, (context && context.ip) || "");
};

export const config = {
  path: ["/api/pedidos", "/api/pedidos/estado", "/api/caja/login", "/api/catalogo", "/api/catalogo/img", "/api/img/*",
    "/api/push/clave", "/api/seguimiento", "/api/seguimiento/push"],
};
