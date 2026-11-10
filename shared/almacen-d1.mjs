/* Almacén sobre D1 (base de datos de Cloudflare) con las mismas cuatro operaciones que el servidor usaba en Netlify Blobs:
   get, setJSON, list (por prefijo) y delete. Todo vive en una sola tabla de clave y valor (JSON), que se crea sola la primera vez. */
export function almacenD1(db) {
  let lista = null;
  const tabla = () => lista || (lista = db.prepare("CREATE TABLE IF NOT EXISTS datos (k TEXT PRIMARY KEY, v TEXT NOT NULL)").run()
    .catch((e) => { lista = null; throw e; }));
  return {
    async get(k) {
      await tabla();
      const r = await db.prepare("SELECT v FROM datos WHERE k = ?1").bind(k).first();
      return r ? JSON.parse(r.v) : null;
    },
    async setJSON(k, v) {
      await tabla();
      await db.prepare("INSERT INTO datos (k, v) VALUES (?1, ?2) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(k, JSON.stringify(v)).run();
    },
    /* por prefijo exacto (sin LIKE, para que "_" y "%" no cuenten como comodines) */
    async list({ prefix }) {
      await tabla();
      const r = await db.prepare("SELECT k FROM datos WHERE substr(k, 1, ?1) = ?2 ORDER BY k").bind(prefix.length, prefix).all();
      return { blobs: r.results.map((x) => ({ key: x.k })) };
    },
    async delete(k) {
      await tabla();
      await db.prepare("DELETE FROM datos WHERE k = ?1").bind(k).run();
    },
  };
}
