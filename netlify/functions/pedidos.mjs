import { getStore } from "@netlify/blobs";
import { handle } from "../../shared/core.mjs";

/* Pedidos del menú web hacia la caja. El PIN de la caja se configura en Netlify como variable CAJA_PIN.
   El sitio de pruebas (rama "pruebas" y vistas previas) guarda en otro almacén para no mezclarse con los pedidos reales. */
export default async (req, context) => {
  const ctx = (context && context.deploy && context.deploy.context) || process.env.CONTEXT || "production";
  const store = getStore({ name: ctx === "production" ? "pedidos" : "pedidos-pruebas", consistency: "strong" });
  const pin = (globalThis.Netlify && Netlify.env.get("CAJA_PIN")) || process.env.CAJA_PIN || "";
  return handle(req, store, pin);
};

export const config = { path: ["/api/pedidos", "/api/pedidos/estado"] };
