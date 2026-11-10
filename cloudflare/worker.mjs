import { handle } from "../shared/core.mjs";
import { almacenD1 } from "../shared/almacen-d1.mjs";

/* Cloudflare: las páginas y fotos de public/ las sirve Cloudflare solo; aquí llega lo de /api/ (run_worker_first en wrangler.jsonc).
   Producción y la vista previa de la rama "pruebas" usan bases de datos distintas: DB arriba y en el bloque "previews" de wrangler.jsonc.
   Secretos en Cloudflare: CAJA_PASSWORD y VAPID_PRIVATE; texto: CAJA_USUARIO y VAPID_PUBLIC. */
export default {
  async fetch(req, env) {
    if (!new URL(req.url).pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    const cfg = { usuario: env.CAJA_USUARIO || "caja", password: env.CAJA_PASSWORD || "", vapidPublic: env.VAPID_PUBLIC || "", vapidPrivate: env.VAPID_PRIVATE || "", secure: true };
    return handle(req, almacenD1(env.DB), cfg, req.headers.get("cf-connecting-ip") || "");
  },
};
