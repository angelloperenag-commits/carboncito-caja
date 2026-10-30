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
- Alitas, orden de 10 a $110 o media orden de 5 a $60. Sabores: receta secreta sin salsa, piña habanero, mango habanero, tamarindo picante, BBQ picante y BBQ dulce. El cliente reparte las alitas por sabor con un contador (− / +) hasta completar 10 o 5 (4 en el CARBONCITO) y no puede agregarlas hasta que todas tengan sabor. El pedido manda `sabores: { sabor: cuántas }` (en combos, por parte) y el servidor exige que sumen exacto; responde `["6 × BBQ dulce", "4 × Mango habanero"]` o el nombre solo si son de un sabor. Pedidos de un menú viejo con `sauces` (mitad y mitad) se reparten a la mitad. Llevan ranch (se puede quitar). Las verduras no siempre van: no se anuncian ni aparecen para quitar.
- Combo mixto de alitas (`alitas-mixto`): 10 alitas, 2 de cada una de las 5 salsas, $110; medio combo, 1 de cada salsa, $60. No se eligen salsas.
- Lo que se puede quitar son exclusiones ("sin"), nunca extras. Un ingrediente sin foto (`noLayer`) se puede quitar pero no se dibuja.
- Combos (categoría Combos): precio fijo y partes (`parts`). Cada parte toma de su producto (`pid`) las salsas y lo que se puede quitar; `unSabor` pide exactamente un sabor; `opciones` pide elegir uno de una lista (el refresco); `pend` marca algo por confirmar. Un combo queda en **borrador** (no aparece en el menú, la caja no deja venderlo y el servidor lo rechaza) mientras le falte el precio, tenga un `pend` o falte `repetidos`. Hoy los 4 se venden:
  - CARBONCITO $100: hamburguesa sencilla con sus papas, 4 alitas (sabor a elegir) y un Jarritos de 600 ml a elegir (incluido en el precio).
  - Combo rico $200: hamburguesa hawaiana sin papas, alitas orden de 10, salchipulpos chicos y 3 hotdogs sencillos.
  - Domi combo $300: 2 hamburguesas hawaianas sin papas, alitas orden de 10, salchipulpos grandes y 3 hotdogs sencillos.
  - 1/2 Alicombo $150: 3 medias órdenes, un sabor cada una; se pueden repetir.
  El pedido lleva `combo: [{ sauces, off, opcion }]` por parte y el servidor regresa `componentes: [{ label, sauces, sin, opcion }]`.
- Bebidas: Jarritos Uva, Piña, Manzana, Limón y Tamarindo de 600 ml a $25 (menú, caja y servidor). Coca-Cola de vidrio 500 ml a $25 (menú, caja y servidor). Cerveza $35: **solo en la caja** (no está en el menú ni en el servidor). Para agregar otra: `bebida(...)` en `shared/core.mjs` y en el menú, y en `PRODUCTS` de la caja con `cat: "drinks"`. Si hay menos de 5 a la venta, la sección se rellena con espacios "Próximamente" (`BEBIDA_ESPACIOS`).
- Combos en el menú: se arman por capas con el constructor de cada parte (`COMPOSE.combo`): atrás lo alto (hamburguesas y refresco, que va más grande), adelante lo bajo (canastas y hotdogs). Cada parte usa su porción (`opt`, `piezas`). Al cambiar el refresco cae el nuevo. Las fotos de combos de la caja (`caja/img/combo-*.png`, `domi-combo.png`, `medio-alicombo.png`) se sacaron de esas mismas capas; si cambian los combos, hay que volver a generarlas.
- Fotos: el menú usa WebP en `public/img/` (una alita por sabor `alitas-<sabor>-1.webp`, bebidas, chiles del hotdog). La caja usa PNG en `public/caja/img/` (iOS 12 no lee WebP): alitas de 5 y 10 piezas por sabor, bebidas y combos. Para convertir WebP a PNG con transparencia se usó el navegador (canvas), porque el decodificador de Windows pierde el canal alfa.
- Contador de alitas (menú y caja): empieza con todas en receta secreta ya elegidas. Al sumar otro sabor con la orden llena, esa alita sale de las de receta secreta (en la canasta solo cambia una). Si baja la porción se quitan primero las de receta secreta; si sube, se completa con receta secreta. Animación: la canasta siempre está llena (10 la orden, 5 la media, 4 en el CARBONCITO; posiciones en `WING_SPOTS_10` y `WING_SPOTS_5`). El combo mixto deja caer 2 de cada salsa (1 en el medio combo).
- Salchipulpos y papas: las salsas (queso de nachos, catsup y Valentina) van en potes negros al fondo de la canasta (`queso-nachos-bote.webp`, `catsup-bote.webp`, `valentina-bote.webp`); al quitar una, desaparece su pote.
- El teléfono del encabezado va en blanco y con `format-detection: telephone=no`, para que ningún teléfono lo pinte de azul.

## Caja: pantalla de venta

- Las tarjetas y las ventanas de personalización no muestran precios: solo foto grande y nombre. El desglose de precios está en el ticket (y en Ajustes). El menú web sí muestra precios.
- Un solo botón "Hotdog": en su ventana, la pastilla "Con tocino" cambia la línea a `hotdog-tocino` (mismo id del menú y el servidor) y cobra su precio. `hotdog-tocino` tiene `hidden: true` en `PRODUCTS`.
- Alitas: la pestaña muestra un botón por sabor con su foto de 10 piezas (al tocarlo se elige la porción con las fotos de 10 y 5 piezas) y "Alitas personalizadas", que reparte las alitas por sabor con un contador. Las alitas de los combos también usan el contador. Para mezclar se agregan varios sabores. No hay mitad y mitad desde la caja (los pedidos web que lo traen se ven igual).
- Ranch: cuando el ticket tiene alitas aparece "Con ranch / Sin ranch" y aplica a todas las alitas y al combo mixto (`RANCH` en `app.js`).
- El combo mixto está en Combos. Bebidas siempre tiene pestaña, en la caja y en el menú web, con 5 espacios "Próximamente" (`BEBIDA_ESPACIOS` en `app.js` y en el menú) que no se pueden tocar; cada bebida real ocupa uno.
- Arriba del ticket: Vaciar (rojo, bote de basura) y Por cobrar (verde). Abajo solo Total y Cobrar. "Cuentas (n)" en la fila de categorías abre las cuentas por cobrar.

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

## Seguridad (revisión antes de pasar a producción)

- El servidor solo acepta claves propias de sus catálogos (`own()` en `shared/core.mjs`): "constructor" o "__proto__" no cuentan como producto, sabor, entrega, pago ni ticket. Las cantidades de alitas deben ser enteros.
- Todo lo que viene del cliente se pinta con `esc()` en la caja y en el menú. La CSP del sitio no cambió y no hay scripts externos.
- Los avisos para n8n de más de un día se borran solos al leer la cola, para no guardar teléfonos de más.
- Ninguna llave real está en el repositorio ni en su historial (las de n8n y Evolution viven solo en la PC de la casa).
