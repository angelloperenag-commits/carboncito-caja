# El Carboncito: menú web y caja

- `/` es el **menú web** para los clientes: arman su pedido y lo mandan directo a la cocina.
- `/caja/` es la **caja** del negocio: recibe los pedidos del menú, cobra, lleva las ventas y hace el corte. Funciona en navegadores viejos (iPad con iOS 12).
- `/api/pedidos` es el servidor que guarda los pedidos (función de Netlify + Netlify Blobs).

## Publicar en Netlify (una sola vez)

1. En Netlify: **Add new project → Import an existing project → GitHub** y elegir este repositorio.
2. No hay que cambiar nada de la configuración de compilación: la toma de `netlify.toml`.
3. En **Project configuration → Environment variables**, crear `CAJA_PIN` con un número que solo sepa el negocio (por ejemplo 4 a 6 dígitos).
4. Hacer el deploy. Cada deploy gasta créditos del plan gratis (unos 15 de 300 al mes), así que conviene juntar cambios.

## Sitio de pruebas (rama `pruebas`)

Se trabaja en la rama `pruebas` y solo se pasa a `main` lo que ya funciona.

1. En GitHub, crea la rama `pruebas` desde `main`.
2. En Netlify: **Project configuration → Build & deploy → Continuous deployment → Branches and deploy contexts → Configure**. En *Branch deploys* elige **Let me add individual branches**, escribe `pruebas` y guarda.
3. Cada cambio que llega a `pruebas` se publica solo en `https://pruebas--elcarboncito.netlify.app` (y la caja de pruebas en `/caja/`). Tiene una franja roja de "PRUEBAS" y sus pedidos se guardan aparte de los reales.
4. Cuando esté bien, en GitHub abre un **Pull request** de `pruebas` → `main` y dale **Merge**. Eso publica la versión para los clientes.

## Usar la caja

1. En el iPad, abrir `https://<tu-sitio>.netlify.app/caja/` en Safari.
2. Compartir → **Agregar a pantalla de inicio**, y abrirla siempre desde ese icono.
3. En **Pedidos**, escribir el PIN. A partir de ahí revisa sola cada 10 segundos y suena cuando llega un pedido (hay que tocar la pantalla una vez para que Safari deje sonar).

## Probar en la computadora

```
CAJA_PIN=2468 node dev/server.mjs
```
Abre http://localhost:8787 (menú) y http://localhost:8787/caja/ (caja). Los pedidos de prueba se guardan en memoria.

## Notas

- El servidor recalcula los precios con `shared/core.mjs`; si cambian los precios, hay que cambiarlos ahí, en el menú (`public/index.html`) y en la caja (Ajustes).
- Las ventas de la caja viven en el iPad; los pedidos web viven en Netlify.
- Al cambiar la caja, subir la versión en `public/caja/sw.js` para que el iPad tome la nueva.
