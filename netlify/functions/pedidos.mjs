import { getStore } from "@netlify/blobs";
import { handle } from "../../shared/core.mjs";

/* Pedidos del menú web hacia la caja. El PIN de la caja se configura en Netlify como variable CAJA_PIN. */
export default async (req) => {
  const store = getStore({ name: "pedidos", consistency: "strong" });
  const pin = (globalThis.Netlify && Netlify.env.get("CAJA_PIN")) || process.env.CAJA_PIN || "";
  return handle(req, store, pin);
};

export const config = { path: ["/api/pedidos", "/api/pedidos/estado"] };
