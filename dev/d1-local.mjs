/* D1 de mentiras para probar en la computadora: el SQLite que trae Node (node:sqlite) con la forma de la API de D1
   (prepare → bind → first / all / run). Sirve para correr las pruebas y el servidor local con el almacén de Cloudflare. */
import { DatabaseSync } from "node:sqlite";

export function d1Local(archivo = ":memory:") {
  const db = new DatabaseSync(archivo);
  const consulta = (sql, args) => ({
    bind: (...a) => consulta(sql, a),
    async first() { return db.prepare(sql).get(...args) || null; },
    async all() { return { results: db.prepare(sql).all(...args) }; },
    async run() { db.prepare(sql).run(...args); return { success: true }; },
  });
  return { prepare: (sql) => consulta(sql, []) };
}
