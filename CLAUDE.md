# El Carboncito: menú web y caja

Proyecto del negocio familiar El Carboncito (hamburguesas, hotdogs, salchipulpos y alitas) en Temixco, Morelos. Responde siempre en español.

## Qué hay en el repositorio

- `public/index.html`: menú web para clientes (celulares modernos). Constructor visual por capas con fotos WebP en `public/img/`, carrito y envío del pedido a `/api/pedidos`. Si el envío falla, ofrece WhatsApp (527771138935).
- `public/caja/`: punto de venta para el iPad Air 1 con iOS 12.5.8 (no se puede actualizar). Vender, cobrar con cambio, ventas del turno, corte de caja, ajustes de precios, y pestaña Pedidos que recibe los pedidos del menú (consulta cada 10 s con la sesión de la caja). Se entra con usuario y contraseña.
- `netlify/functions/pedidos.mjs` + `shared/core.mjs`: API de pedidos sobre Netlify Blobs. El servidor recalcula precios con el catálogo de `shared/core.mjs`; el precio que manda el cliente no se usa.
- `dev/server.mjs`: servidor local con la misma API y almacén en memoria (`CAJA_PASSWORD=prueba1234 AVISOS_TOKEN=... node dev/server.mjs`; usuario `caja`).

## Reglas que no se rompen

- **La caja debe funcionar en Safari de iOS 12.** Nada de: `?.`, `??`, campos de clase, WebP, `aspect-ratio`, `inset`, `gap` en flexbox (en grid usar `grid-gap` y `gap`), `clamp()`, `:is()`, `ResizeObserver`, `navigator.clipboard`, `AbortController`. JavaScript hasta ES2017. Verificar con acorn (`ecmaVersion: 2017`) y esbuild (`target: safari12`) antes de dar algo por terminado.
- Al cambiar la caja, subir `VERSION` en `public/caja/sw.js` para que el iPad tome la versión nueva.
- **Precios en tres lugares:** `shared/core.mjs` (manda), el menú `public/index.html` (objeto `MENU`) y la caja `public/caja/app.js` (`PRODUCTS`). Si cambian, cambiarlos en los tres.
- Los ids de producto, de opción y los nombres de ingredientes "sin" deben coincidir entre menú, servidor y caja: así la caja puede pasar un pedido web al ticket.
- Las ventas de la caja viven solo en el iPad (localStorage). Los pedidos web viven en Netlify Blobs. Los datos de clientes solo salen con la sesión de la caja (`CAJA_USUARIO` y `CAJA_PASSWORD`) o, para n8n, con `AVISOS_TOKEN` (variables de entorno en Netlify). `CAJA_PIN` ya no se usa.
- Netlify plan gratis: cada deploy gasta unos 15 de 300 créditos al mes. Juntar cambios antes de subir a `main`.
- **Solo código del propio sitio.** `netlify.toml` manda una CSP para todo el sitio (`script-src 'self' 'unsafe-inline'`, `connect-src 'self'`). No cargar scripts de CDNs: las librerías van en `public/js/` (qrcode-generator 1.4.4 y jsPDF 4.2.1, verificadas con el SRI de cdnjs). Google Fonts sí está permitido (solo CSS y fuentes).
- Dependencias con versión fija en `package.json` (nada de `latest`).

## Ramas: pruebas y producción

- **`pruebas`** es donde se trabaja. Netlify la publica como branch deploy en `https://pruebas--elcarboncito.netlify.app` (menú) y `/caja/` (caja de pruebas). Según la página de precios de Netlify, los 15 créditos por deploy son de los deploys de producción; confirmar en *Usage* después de los primeros deploys de `pruebas`.
- **`main`** es lo que ven los clientes (`https://elcarboncito.netlify.app`). Solo se pasa a `main` lo que ya se probó en `pruebas`, con un pull request de `pruebas` → `main`, y juntando cambios (cada deploy de producción gasta unos 15 créditos).
- Los pedidos de pruebas viven en el almacén `pedidos-pruebas`. `netlify/functions/pedidos.mjs` lo elige con el contexto del deploy, así que nunca se mezclan con los pedidos reales (`pedidos`).
- En pruebas, el menú y la caja muestran una franja roja "SITIO/CAJA DE PRUEBAS". Se activa en cualquier dirección con `--` (branch deploys y vistas previas) y en `localhost`.
- `CAJA_USUARIO`, `CAJA_PASSWORD` y `AVISOS_TOKEN` pueden tener otro valor en pruebas: en Netlify, *Environment variables → la variable → Different value for each deploy context*. Cambiar `CAJA_PASSWORD` cierra todas las sesiones de la caja (necesita redeploy).

## Pagos, ticket y datos del cliente

- Transferencias SPEI a la CLABE **1275 4001 3091 452136** (constante `CLABE` en el menú). Se muestra con botón Copiar en "Tu pedido" y en la pantalla de pedido enviado, con el botón "Mandar captura por WhatsApp" que lleva el folio. La caja recuerda revisar en el banco que llegó antes de preparar.
- Ticket de compra: el cliente elige No / Por correo / PDF. "Por correo" manda `cliente.email` (validado en `shared/core.mjs`) y la caja lo muestra para enviarlo a mano: el sitio no manda correos. "PDF" lo genera el menú con jsPDF después de que la caja acepta el pedido, con el folio y el total que regresó el servidor.
- Los datos del cliente se guardan en su teléfono con fecha (`savedAt`) y caducan a los 30 días. Botón "Borrar mis datos". El efectivo y las notas se limpian después de cada pedido.
- Un pedido por minuto: el servidor responde 429 si la misma IP ya mandó uno hace menos de 60 s (guarda un hash de la IP en `limite/…`, nunca la IP). El menú también lo revisa con `localStorage`. Personas distintas en la misma red (o la misma IP del operador celular) comparten la espera.

## Menú: datos del negocio

- Abierto viernes a domingo, 6:00 pm a 12:00 am. Jerusalén 8, Lázaro Cárdenas del Río, 62588 Temixco, Morelos. Tel. 777 113 8935.
- Hamburguesas en combo con papas (sin papas $10 menos): Sencilla $60, Hawaiana $70, BBQ $70, Loba $80, Monstruo $90. Todas llevan lechuga, jitomate, cebolla, chile en vinagre, catsup y mostaza; solo se pueden quitar ingredientes, no hay extras con costo.
- Hotdog sencillo $20 o 3 por $40; con tocino $25 o 3 por $50. Llevan jitomate, cebolla, catsup, mostaza y chiles (todo se puede quitar). Salchipulpos chico $40 (4 mitades) o grande $60 (6 mitades). Papas chica $30 o grande $50, con queso de nachos, catsup y Valentina (se pueden quitar).
- Alitas, orden de 10 a $110 o media orden de 5 a $60, por defecto "Receta secreta sin salsa"; salsas: piña habanero, mango habanero, tamarindo picante, BBQ picante, BBQ dulce; se permite mitad y mitad. Llevan ranch (se puede quitar). Las verduras no siempre van: no se anuncian ni aparecen para quitar.
- Combo mixto de alitas (`alitas-mixto`): 10 alitas, 2 de cada una de las 5 salsas, $110; medio combo, 1 de cada salsa, $60. No se eligen salsas.
- Lo que se puede quitar son exclusiones ("sin"), nunca extras. Un ingrediente sin foto (como los chiles del hotdog, `noLayer`) se puede quitar pero no se dibuja.
- Combos (categoría Combos): precio fijo y partes (`parts`). Cada parte toma de su producto (`pid`) las salsas y lo que se puede quitar; `unSabor` pide exactamente un sabor; `pend` marca algo por confirmar. Un combo queda en **borrador** (no aparece en el menú, la caja lo muestra como "Borrador" sin dejar venderlo y el servidor lo rechaza) mientras le falte el precio, tenga un `pend` o falte `repetidos` (si las partes de un solo sabor pueden repetir). Hoy los 4 son borrador:
  - CARBONCITO $100: hamburguesa sencilla, papas (falta la porción), 4 alitas, refresco de 600 ml incluido en el precio (falta marca y sabor).
  - Combo rico $200: hamburguesa hawaiana (¿lleva sus papas?), alitas (¿orden completa?, ¿cuántas piezas?), salchipulpos chicos, orden de hot dog (¿cuántos y de cuáles?).
  - Domi combo $300: 2 hamburguesas hawaianas (¿con papas?), alitas (igual que arriba), salchipulpos grandes, orden de hot dogs sencillos (¿cuántos?).
  - 1/2 Alicombo: 3 medias órdenes, un sabor cada una (falta precio y si se repiten sabores).
  Al confirmar, quitar el `pend` o poner el precio/`repetidos` en los tres catálogos (servidor, menú y caja). El pedido lleva `combo: [{ sauces, off }]` por parte y el servidor regresa `componentes: [{ label, sauces, sin }]`.
- Bebidas: el sistema está listo pero todavía no hay ninguna (no se venden sueltas hasta tener catálogo y precios). Para agregar una: `bebida(nombre, [[presentación, precio], ...])` en `CATALOG` de `shared/core.mjs`; en el menú `MENU.drinks` con `desc`, `prices`, `file` (foto WebP en `img/`; sin foto se ve un marcador) y `disponible`; en la caja `PRODUCTS` con `cat: "drinks"`, `desc`, `img` (PNG en `caja/img/`, iOS 12 no lee WebP) y `disponible`. Mismo id en los tres. La sección del menú solo aparece si hay alguna disponible con precio; en la caja también se puede marcar Agotado en Ajustes.

## Caja: domicilio y cuentas por cobrar

- Domicilio: al elegir "Domicilio" en el ticket aparece un campo para la dirección o un enlace de Google Maps. "Buscar en Maps" abre Google Maps en Safari; en Maps se toca el lugar → Compartir → Copiar y se pega en el campo. La dirección se guarda en la venta (`dir`).
- Ruta de entrega: como WhatsApp no corre en el iPad con iOS 12, la caja muestra un código QR con la ruta de Google Maps para que el repartidor lo escanee con su celular. Aparece al registrar una venta a domicilio, en el detalle de la venta, en los pedidos web a domicilio (botón "Ruta (QR)") y sola al marcar un pedido web como "Ya está listo". Usa `public/js/qrcode.min.js`.
- Cuentas por cobrar (`db.pendientes`, en el iPad): una por cliente, acumulables. "Por cobrar" guarda el ticket con el nombre del cliente o la mesa; si ya hay una cuenta con ese nombre (sin importar mayúsculas), se suma a ella y se juntan las líneas iguales. "Por cobrar (n)" muestra cada cuenta con lo que pidió, el total y a dónde llevarlo (con "Ruta (QR)"). Con un ticket abierto, la lista ofrece "Sumar ticket actual" a cualquier cuenta. Sirve para quien come en el local y para quien llega en coche y pide que se lo lleven a su casa. No cuentan en el corte hasta cobrarlas, y el corte avisa si hay alguna.

## Pendiente

- Probar la caja en el iPad real: el sitio de pruebas es privado y el inicio de sesión de Netlify no carga en iOS 12, así que el iPad solo puede abrir la caja de producción.
- Revisar `public/caja/app.js` con acorn (ES2017) y esbuild (`safari12`): la caja v7 (domicilio, cuentas por cobrar) se escribió en ES5 a mano, pero no se pudo correr Node en la computadora donde se hizo. Se probó en Chromium a tamaño de iPad, no en el iPad real.
- frakOs (sistema propio para equipos viejos) es investigación a largo plazo, fuera de este repositorio.

## Entrada a la caja

- La caja pide usuario y contraseña al abrir (`/api/caja/login`, contra `CAJA_USUARIO` —por defecto `caja`— y `CAJA_PASSWORD`). El servidor da una sesión firmada (`vence.firma`, HMAC con usuario y contraseña) que dura 30 días; la caja la guarda en `localStorage` (`carbon-caja-sesion`, fuera del respaldo) y la manda como `Authorization: Bearer`. Sin internet sigue vendiendo con la sesión guardada.
- 5 intentos fallidos desde la misma conexión bloquean 15 minutos (`intentos/…` con hash de la IP).

## Avisos por WhatsApp (n8n)

- n8n, Evolution API (WhatsApp vinculado como dispositivo, no la API oficial), PostgreSQL y Redis corren en Docker en la PC de la casa: `G:\Documentos\ChatGPT\RLoperena 2\carboncito-whatsapp` (proyecto `carboncito-whatsapp`, n8n en `http://localhost:5678`). Sus claves están en ese `.env` y en `bootstrap/` (no se suben a ningún lado).
- Netlify no puede llamar a la PC, así que n8n pregunta: al aceptar, marcar listo o rechazar un pedido web, el servidor deja un aviso en `aviso/…`; el flujo `Carboncito · Avisos de pedidos` (`n8n/carboncito-pedidos.json`) lee `GET /api/avisos` con la cabecera `x-avisos-token`, manda el texto por Evolution y borra el aviso con `POST /api/avisos/ok`. Corre cada 30 s de viernes a domingo, 5 pm a 1 am. Si falla se reintenta; pasada 1 hora se descarta.
- El sitio de pruebas es privado (Netlify pide iniciar sesión), así que n8n solo puede leer producción.
- La PC debe estar encendida y con internet para que salgan los mensajes; si no, los pedidos siguen llegando a la caja igual.
