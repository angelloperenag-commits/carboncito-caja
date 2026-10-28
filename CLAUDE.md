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
- **Solo código del propio sitio.** `netlify.toml` manda una CSP para todo el sitio (`script-src 'self' 'unsafe-inline'`, `connect-src 'self'`). No cargar scripts de CDNs: las librerías van en `public/js/` (qrcode-generator 1.4.4 y jsPDF 4.2.1, verificadas con el SRI de cdnjs). Google Fonts sí está permitido (solo CSS y fuentes).
- Dependencias con versión fija en `package.json` (nada de `latest`).

## Ramas: pruebas y producción

- **`pruebas`** es donde se trabaja. Netlify la publica como branch deploy en `https://pruebas--elcarboncito.netlify.app` (menú) y `/caja/` (caja de pruebas). Según la página de precios de Netlify, los 15 créditos por deploy son de los deploys de producción; confirmar en *Usage* después de los primeros deploys de `pruebas`.
- **`main`** es lo que ven los clientes (`https://elcarboncito.netlify.app`). Solo se pasa a `main` lo que ya se probó en `pruebas`, con un pull request de `pruebas` → `main`, y juntando cambios (cada deploy de producción gasta unos 15 créditos).
- Los pedidos de pruebas viven en el almacén `pedidos-pruebas`. `netlify/functions/pedidos.mjs` lo elige con el contexto del deploy, así que nunca se mezclan con los pedidos reales (`pedidos`).
- En pruebas, el menú y la caja muestran una franja roja "SITIO/CAJA DE PRUEBAS". Se activa en cualquier dirección con `--` (branch deploys y vistas previas) y en `localhost`.
- `CAJA_PIN` puede tener otro valor en pruebas: en Netlify, *Environment variables → CAJA_PIN → Different value for each deploy context*.

## Pagos, ticket y datos del cliente

- Transferencias SPEI a la CLABE **1275 4001 3091 452136** (constante `CLABE` en el menú). Se muestra con botón Copiar en "Tu pedido" y en la pantalla de pedido enviado, con el botón "Mandar captura por WhatsApp" que lleva el folio. La caja recuerda revisar en el banco que llegó antes de preparar.
- Ticket de compra: el cliente elige No / Por correo / PDF. "Por correo" manda `cliente.email` (validado en `shared/core.mjs`) y la caja lo muestra para enviarlo a mano: el sitio no manda correos. "PDF" lo genera el menú con jsPDF después de que la caja acepta el pedido, con el folio y el total que regresó el servidor.
- Los datos del cliente se guardan en su teléfono con fecha (`savedAt`) y caducan a los 30 días. Botón "Borrar mis datos". El efectivo y las notas se limpian después de cada pedido.
- Un pedido por minuto: el servidor responde 429 si la misma IP ya mandó uno hace menos de 60 s (guarda un hash de la IP en `limite/…`, nunca la IP). El menú también lo revisa con `localStorage`. Personas distintas en la misma red (o la misma IP del operador celular) comparten la espera.

## Menú: datos del negocio

- Abierto viernes a domingo, 6:00 pm a 12:00 am. Jerusalén 8, Lázaro Cárdenas del Río, 62588 Temixco, Morelos. Tel. 777 113 8935.
- Hamburguesas en combo con papas (sin papas $10 menos): Sencilla $60, Hawaiana $70, BBQ $70, Loba $80, Monstruo $90. Todas llevan lechuga, jitomate, cebolla, chile en vinagre, catsup y mostaza; solo se pueden quitar ingredientes, no hay extras con costo.
- Hotdog sencillo $20 o 3 por $40; con tocino $25 o 3 por $50. Salchipulpos chico $40 (4 mitades) o grande $60 (6 mitades). Papas chica $30 o grande $50.
- Alitas, orden de 10 a $110 o media orden de 5 a $60, por defecto "Receta secreta sin salsa"; salsas: piña habanero, mango habanero, tamarindo picante, BBQ picante, BBQ dulce; se permite mitad y mitad. Llevan zanahoria, pepino, jícama en cama de lechuga y ranch (se pueden quitar).
- Combo mixto de alitas (`alitas-mixto`): 10 alitas, 2 de cada una de las 5 salsas, $110; medio combo, 1 de cada salsa, $60. No se eligen salsas.
- Bebidas: el sistema está listo pero todavía no hay ninguna. Para agregar una: `bebida(...)` en `CATALOG` de `shared/core.mjs`, `MENU.drinks` en el menú (`builder: "drink"`, foto WebP opcional en `file`) y `PRODUCTS` con `cat: "drinks"` en la caja, con el mismo id. La sección y la pestaña aparecen solas.

## Caja: domicilio y cuentas por cobrar

- Domicilio: al elegir "Domicilio" en el ticket aparece un campo para la dirección o un enlace de Google Maps. "Buscar en Maps" abre Google Maps en Safari; en Maps se toca el lugar → Compartir → Copiar y se pega en el campo. La dirección se guarda en la venta (`dir`).
- Ruta de entrega: como WhatsApp no corre en el iPad con iOS 12, la caja muestra un código QR con la ruta de Google Maps para que el repartidor lo escanee con su celular. Aparece al registrar una venta a domicilio, en el detalle de la venta, en los pedidos web a domicilio (botón "Ruta (QR)") y sola al marcar un pedido web como "Ya está listo". Usa `public/js/qrcode.min.js`.
- Cuentas por cobrar (`db.pendientes`, en el iPad): "Por cobrar" guarda el ticket con un nombre o mesa para quien come en el local; "Por cobrar (n)" en Vender las muestra para abrir, agregar más y cobrar. No cuentan en el corte hasta cobrarlas, y el corte avisa si hay alguna.

## Pendiente

- Probar la caja en el iPad real: el sitio de pruebas es privado y el inicio de sesión de Netlify no carga en iOS 12, así que el iPad solo puede abrir la caja de producción.
- Revisar `public/caja/app.js` con acorn (ES2017) y esbuild (`safari12`): la caja v7 (domicilio, cuentas por cobrar) se escribió en ES5 a mano, pero no se pudo correr Node en la computadora donde se hizo. Se probó en Chromium a tamaño de iPad, no en el iPad real.
- Limitar intentos de PIN en `/api/pedidos` (hoy no hay límite y un PIN corto se puede adivinar). Mientras tanto, usar un `CAJA_PIN` de al menos 8 dígitos.
- frakOs (sistema propio para equipos viejos) es investigación a largo plazo, fuera de este repositorio.
