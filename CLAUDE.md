# El Carboncito: menú web y caja

Proyecto del negocio familiar El Carboncito (hamburguesas, hotdogs, salchipulpos y alitas) en Temixco, Morelos. Responde siempre en español.

## Qué hay en el repositorio

- `public/index.html`: menú web para clientes (celulares modernos). Constructor visual por capas con fotos WebP en `public/img/`, carrito y envío del pedido a `/api/pedidos`. Si el envío falla, ofrece WhatsApp (527771138935).
- `public/caja/`: punto de venta para el iPad Air 1 con iOS 12.5.8 (no se puede actualizar). Vender, cobrar con cambio, ventas del turno, corte de caja, ajustes de precios, y pestaña Pedidos que recibe los pedidos del menú (consulta cada 10 s con el PIN).
- `netlify/functions/pedidos.mjs` + `shared/core.mjs`: API de pedidos sobre Netlify Blobs. El servidor recalcula precios con el catálogo de `shared/core.mjs`; el precio que manda el cliente no se usa.
- `dev/server.mjs`: servidor local con la misma API y almacén en memoria (`CAJA_PIN=2468 node dev/server.mjs`).

## Reglas que no se rompen

- **La caja debe funcionar en Safari de iOS 12.** Nada de: `?.`, `??`, campos de clase, WebP, `aspect-ratio`, `inset`, `gap` en flexbox (en grid usar `grid-gap` y `gap`), `clamp()`, `:is()`, `ResizeObserver`, `navigator.clipboard`, `AbortController`. JavaScript hasta ES2017. Verificar con acorn (`ecmaVersion: 2017`) y esbuild (`target: safari12`) antes de dar algo por terminado.
- Al cambiar la caja, subir `VERSION` en `public/caja/sw.js` para que el iPad tome la versión nueva.
- **Precios en tres lugares:** `shared/core.mjs` (manda), el menú `public/index.html` (objeto `MENU`) y la caja `public/caja/app.js` (`PRODUCTS`). Si cambian, cambiarlos en los tres.
- Los ids de producto, de opción y los nombres de ingredientes "sin" deben coincidir entre menú, servidor y caja: así la caja puede pasar un pedido web al ticket.
- Las ventas de la caja viven solo en el iPad (localStorage). Los pedidos web viven en Netlify Blobs. Los datos de clientes solo salen con el PIN (`CAJA_PIN`, variable de entorno en Netlify).
- Netlify plan gratis: cada deploy gasta unos 15 de 300 créditos al mes. Juntar cambios antes de subir a `main`.

## Menú: datos del negocio

- Abierto viernes a domingo, 6:00 pm a 12:00 am. Jerusalén 8, Lázaro Cárdenas del Río, 62588 Temixco, Morelos. Tel. 777 113 8935.
- Hamburguesas en combo con papas (sin papas $10 menos): Sencilla $60, Hawaiana $70, BBQ $70, Loba $80, Monstruo $100. Todas llevan lechuga, jitomate, cebolla, chile en vinagre, catsup y mostaza; solo se pueden quitar ingredientes, no hay extras con costo.
- Hotdog sencillo $20 o 3 por $40; con tocino $25 o 3 por $50. Salchipulpos chico $40 (4 mitades) o grande $60 (6 mitades). Papas chica $30 o grande $50.
- Alitas, orden de 10 a $110, por defecto "Receta secreta sin salsa"; salsas: piña habanero, mango habanero, tamarindo picante, BBQ picante, BBQ dulce; se permite mitad y mitad. Llevan zanahoria, pepino, jícama en cama de lechuga y ranch (se pueden quitar).

## Pendiente

- Conectar el repositorio a Netlify, crear la variable `CAJA_PIN` y probar en el iPad real.
- frakOs (sistema propio para equipos viejos) es investigación a largo plazo, fuera de este repositorio.
