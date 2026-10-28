import { getStore } from "@netlify/blobs";
import { handle } from "../../shared/core.mjs";

/* Pedidos del menú web hacia la caja, entrada de la caja y avisos para n8n.
   Variables en Netlify: CAJA_USUARIO, CAJA_PASSWORD (entrada de la caja) y AVISOS_TOKEN (llave de n8n).
   El sitio de pruebas (rama "pruebas" y vistas previas) guarda en otro almacén para no mezclarse con los pedidos reales. */
const env = (k) => (globalThis.Netlify && Netlify.env.get(k)) || process.env[k] || "";

export default async (req, context) => {
  const ctx = (context && context.deploy && context.deploy.context) || process.env.CONTEXT || "production";
  const store = getStore({ name: ctx === "production" ? "pedidos" : "pedidos-pruebas", consistency: "strong" });
  const cfg = { usuario: env("CAJA_USUARIO") || "caja", password: env("CAJA_PASSWORD"), avisos: env("AVISOS_TOKEN") };
  return handle(req, store, cfg, (context && context.ip) || "");
};

export const config = { path: ["/api/pedidos", "/api/pedidos/estado", "/api/caja/login", "/api/avisos", "/api/avisos/ok"] };
