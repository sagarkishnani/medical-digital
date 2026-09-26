# SPEC 01 — Catálogo de productos desde WooCommerce

> **Status:** Aprobado
> **Depends on:** — (proyecto base: Astro 5 + TinaCMS)
> **Date:** 2026-09-26
> **Objective:** Generar en build un catálogo estático de productos (listado filtrable por categoría y ficha con "Solicitar cotización" por WhatsApp) leyendo la Store API pública de WooCommerce, sin claves ni endpoints nuevos expuestos.

## Por qué existe esta spec

El starter `astro-tina-starter` trae para Woo un patrón de tres capas: build con REST v3 firmada, un proxy `woo-api.php` y un refresco de precio y stock en el navegador.

Medical Digital no vende online. Sus 45 productos no tienen precio y ninguno es comprable (`is_purchasable: false`): todo se cotiza. Sin datos volátiles, el proxy y el refresco solo añaden superficie de ataque y un secreto que custodiar.

Esta spec usa solo la capa de build y la alimenta con la Store API (`/wp-json/wc/store/v1/`), que ya es pública hoy. El navegador nunca habla con WordPress.

Estado del WordPress al 2026-09-26 (para contrastar después):

- 45 productos `simple`, sin precio, sin atributos.
- 7 categorías planas: Cardiología (13), Diagnóstico Respiratorio (7), Emergencia (7), Sala de Operaciones (5), Consultorio Clínico (5), Sistemas Clínicos (4), Hospitalización (4).
- `/wp-json/wc/v3/*` responde 401 (correcto).
- `/wp-json/wp/v2/users` está abierto y expone el slug del admin. Se corrige en SPEC 02 (hardening), no aquí.
- El botón "Cotizar producto" de las fichas actuales apunta a `href="#"`.
- WhatsApp comercial: `51983511262` (resuelto desde `wa.link/czs0j4`).

## Scope

**In:**

- Lectura de productos y categorías desde la Store API en build, paginada.
- Proyección campo por campo: solo sale de `src/lib/woo/` lo declarado en `types.ts`.
- Sanitizado del HTML de las descripciones en build, con allowlist.
- Página `/productos` con todos los productos y navegación por categoría.
- Páginas estáticas `/productos/categoria/[slug]` (el "filtro" es una página por categoría, sin JS).
- Ficha `/productos/[slug]` con galería, descripciones, SKU, marca y categoría.
- Botón "Solicitar cotización" que abre WhatsApp con el nombre del producto y su URL.
- Campo `whatsapp` en la colección `global` de Tina, editable desde `/admin`.
- Imágenes de producto optimizadas por `astro:assets` en build y servidas desde `dist/`.
- Variable `WOO_STORE_URL` en `.env.example` y en Amplify (staging).
- Build que falla si WordPress no responde; estado vacío solo cuando `WOO_STORE_URL` está vacía.
- Enlace "Productos" en la navegación del header.

**Out of scope (para futuras specs):**

- Hardening de WordPress: 2FA en wp-admin, XML-RPC, `/wp/v2/users`, login (SPEC 02, responsable Sagar).
- Campos nuevos en el producto de Woo (ficha técnica PDF, registro sanitario, fabricante).
- Rebuild automático cuando cambia un producto (webhook de Woo → Amplify / deploy).
- Deploy de `main` por FTP.
- Formulario de cotización con backend (SMTP, Turnstile).
- Precios, stock, carrito o checkout (`wooMode: shop` del starter).
- Proxy `woo-api.php` y cualquier fetch a WordPress desde el navegador.
- Buscador de productos y filtros combinados (categoría + marca).
- Redirecciones 301 de `/producto/<slug>/` (WP) a `/productos/<slug>` (Astro) para cuando Astro reemplace el dominio.
- Colección de Tina para los textos de cabecera y SEO de `/productos`.

## Modelo de datos

Tipos proyectados. Es lo único que el resto del sitio conoce de Woo:

```ts
// src/lib/woo/types.ts
export interface WooImage {
  src: string;      // URL absoluta en WOO_STORE_URL, validada
  alt: string;      // alt de WP o, si viene vacío, el nombre del producto
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;     // validado contra /^[a-z0-9-]+$/
  count: number;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;              // validado contra /^[a-z0-9-]+$/
  sku: string;               // '' si no tiene
  brand: string | null;      // primer elemento de `brands`
  shortDescription: string;  // HTML sanitizado
  description: string;       // HTML sanitizado
  images: WooImage[];
  categories: Pick<WooCategory, 'id' | 'name' | 'slug'>[];
}
```

Variables de entorno:

```bash
# .env / Amplify — sin prefijo PUBLIC_: Vite no la inyecta al bundle.
# Vacía = el catálogo se genera vacío (desarrollo sin red).
WOO_STORE_URL=https://medicaldigitalperu.com
```

Campo nuevo en `tina/collections/global.ts` (raíz de la colección):

```ts
{ name: 'whatsapp', label: 'WhatsApp comercial (solo dígitos, con código de país)', type: 'string' }
// src/content/global/index.json → "whatsapp": "51983511262"
```

Mensaje de WhatsApp (URL construida en build por `src/utils/whatsapp.ts`):

```
https://wa.me/51983511262?text=Hola, quiero cotizar: {name} — {site}/productos/{slug}
```

Allowlist del sanitizado (`sanitize-html`, solo en build):

- Etiquetas: `p br strong em b i u ul ol li h3 h4 h5 table thead tbody tr th td a`.
- Atributos: `href` en `a`, solo esquemas `https` y `mailto`; se fuerza `rel="noopener noreferrer"` y `target="_blank"`.
- Se eliminan `img`, `iframe`, `script`, `style`, atributos `style`/`class`/`on*` y shortcodes `[...]` sobrantes.

Endpoints consumidos (solo en build, solo GET):

- `GET {WOO_STORE_URL}/wp-json/wc/store/v1/products?per_page=100&page=N`
- `GET {WOO_STORE_URL}/wp-json/wc/store/v1/products/categories`

## Plan de implementación

1. Crear `src/lib/woo/types.ts` con los tipos de arriba. Añadir `WOO_STORE_URL=` a `.env.example` con su comentario y tiparla en `src/env.d.ts`.
2. Crear `src/lib/woo/store.ts` con `getProducts()` y `getCategories()`. Deben:
   - hacer `fetch` con timeout de 15 s y un reintento;
   - paginar con la cabecera `X-WP-TotalPages`;
   - proyectar al tipo y descartar (con `console.warn`) los productos con slug o imágenes inválidos;
   - memoizar el resultado para que todas las páginas del build compartan una sola descarga;
   - lanzar un error si `import.meta.env.SSR` es falso (red de seguridad contra imports desde islas);
   - lanzar un error con un mensaje claro si la respuesta no es 200 o no es JSON;
   - devolver `[]` sin llamar a la red si `WOO_STORE_URL` está vacía.
   Prueba manual: un script temporal con `astro build` que haga log del conteo muestra 45 productos y 7 categorías.
3. Añadir `sanitize-html` (y `@types/sanitize-html`) como dependencia y aplicarlo dentro de la proyección de `store.ts` con la allowlist del modelo de datos.
4. Configurar `image.domains` en `astro.config.mjs` con el hostname de `WOO_STORE_URL` (ninguno si está vacía).
5. Crear `src/components/productos/ProductCard.astro` (Astro puro, sin React) con imagen vía `<Image>`, nombre, marca y categoría, enlazando a la ficha.
6. Crear `src/components/productos/CategoryNav.astro` con "Todas" + las 7 categorías con productos, marcando la activa con `aria-current="page"`.
7. Crear `src/pages/productos/index.astro`: título, `CategoryNav` y grid de `ProductCard`. Con 0 productos, mostrar un estado vacío con texto que explique que el catálogo no está configurado.
8. Crear `src/pages/productos/categoria/[slug].astro` con `getStaticPaths()` desde `getCategories()` (solo `count > 0`), reutilizando el layout del listado.
9. Añadir el campo `whatsapp` a `tina/collections/global.ts` y el valor `51983511262` a `src/content/global/index.json`. Crear `src/utils/whatsapp.ts` con `buildQuoteUrl(number, product, siteUrl)`.
10. Crear `src/pages/productos/[slug].astro` con `getStaticPaths()` desde `getProducts()`: galería, SKU, marca, categorías enlazadas, descripciones con `set:html` (ya sanitizadas) y botón "Solicitar cotización" (`btn-primary`, `target="_blank"`, `rel="noopener noreferrer"`). `title` y `description` del `BaseLayout` salen del producto.
11. Añadir "Productos" → `/productos` a la navegación en `src/content/global/index.json`. Usar `import.meta.env.BASE_URL` en todos los enlaces internos.
12. Documentar en `CLAUDE.md` la sección "Catálogo de WooCommerce": la regla de que `src/lib/woo/store.ts` no se importa desde `.tsx`, la variable `WOO_STORE_URL` y que un cambio en Woo requiere redeploy. Configurar `WOO_STORE_URL` en Amplify (entorno de staging).

## Criterios de aceptación

- [ ] `npm run build` con `WOO_STORE_URL=https://medicaldigitalperu.com` genera `/productos`, 7 páginas `/productos/categoria/*` y 45 páginas `/productos/*` (o el número vigente en Woo ese día).
- [ ] `npm run build` con `WOO_STORE_URL` vacía termina sin errores y `/productos` muestra el estado vacío.
- [ ] `npm run build` con `WOO_STORE_URL=https://medicaldigitalperu.invalid` falla con un mensaje que nombra la URL y el endpoint.
- [ ] `grep -rE "wp-json|consumer_key|WOO_STORE_URL" dist/` no devuelve resultados.
- [ ] Ningún archivo `.js` de `dist/_astro/` contiene la cadena `wc/store`.
- [ ] En DevTools → Network, navegar `/productos`, una categoría y una ficha no genera ninguna petición a `medicaldigitalperu.com` (las imágenes salen de `/_astro/`).
- [ ] `/productos/categoria/cardiologia` lista exactamente los productos de esa categoría en Woo.
- [ ] Ninguna descripción renderizada contiene `<script`, `<iframe`, `<img`, `style=` ni `on*=` (verificable con `grep` sobre `dist/productos/`).
- [ ] El botón "Solicitar cotización" abre `https://wa.me/51983511262` con el nombre y la URL del producto en el texto.
- [ ] Cambiar `whatsapp` en `/admin` y recompilar cambia el número del botón en todas las fichas.
- [ ] Un `import` de `src/lib/woo/store.ts` desde un componente hidratado lanza un error en desarrollo.
- [ ] `npm run typecheck` y `npm run check:standard` pasan.
- [ ] "Productos" aparece en el header y lleva a `/productos`.

## Decisiones

- **Sí:** Store API pública en build. Los datos ya son públicos; no hay secreto que filtrar ni endpoint nuevo que atacar.
- **No:** REST v3 con clave de solo lectura. Da más campos, pero obliga a custodiar un secreto en Amplify y en el futuro FTP sin ganar nada hoy.
- **No:** proxy `woo-api.php` ni `StockRefresher` del starter. Sin precio ni stock no hay nada que refrescar en runtime. Si algún día se vende online, se reevalúa en su propia spec.
- **Sí:** producto nativo de WooCommerce como modelo. **No:** CPT propio. Duplicaría la fuente de verdad que ya existe con 45 productos cargados.
- **Sí:** filtro por categoría como páginas estáticas. Cero JS, URLs indexables y compartibles.
- **No:** filtro en cliente con React. Una isla para 45 tarjetas cuesta más KB que el catálogo.
- **Sí:** tarjetas y ficha en Astro puro. **No:** componente doble. El producto no se edita desde Tina.
- **Sí:** `astro:assets` con `image.domains`. Imágenes optimizadas y servidas desde `dist/`, sin que el visitante toque WordPress.
- **No:** enlazar directo a `wp-content/uploads`. Pesa más y acopla el sitio a la disponibilidad de WP.
- **Sí:** sanitizar el HTML en build con allowlist. Si el WordPress se compromete, el HTML inyectado no llega al sitio estático.
- **Sí:** eliminar `<img>` de las descripciones. Serían hotlinks a WP que no pasan por `astro:assets`.
- **Sí:** el build falla si WP no responde. Amplify conserva el deploy anterior; nunca sale un catálogo vacío a producción.
- **Sí:** WhatsApp como CTA, con el número en `global` de Tina. Marketing lo cambia sin tocar código.
- **No:** formulario de cotización. Trae SMTP, Turnstile y validación; va en otra spec.
- **Sí:** ruta `/productos` (en español, coherente con el sitio). **No:** `/tienda` del starter, porque no hay tienda.
- **Sí:** secciones 2–6 redactadas de corrido, sin confirmación sección por sección, a pedido del usuario ("sigue y asume el resto"). Revisión consolidada al final.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El hardening de SPEC 02 bloquea `/wp-json/` completo y rompe el build. | SPEC 02 debe dejar abiertos `GET /wp-json/wc/store/v1/products*` y `.../products/categories`. Se anota como dependencia inversa. |
| Un WAF o plugin de seguridad en Plesk bloquea las IPs de Amplify. | El build falla con un mensaje claro (criterio de aceptación). Se permite el user-agent o las IPs en el WAF. |
| Cuando Astro reemplace `medicaldigitalperu.com`, WordPress tendrá que moverse a un subdominio. | Solo cambia `WOO_STORE_URL`, y `image.domains` se deriva de ella. Las redirecciones 301 van en su propia spec. |
| Las descripciones traen restos de Elementor o shortcodes que el sanitizado deja feos. | La allowlist elimina `class`/`style` y los `[shortcodes]`. Si aún quedan restos, se limpian en Woo, no en código. |
| Un producto editado en Woo no aparece hasta el próximo deploy. | Documentado en `CLAUDE.md`. El webhook de rebuild va en otra spec. |
| Alguien importa `store.ts` desde una isla React. | Hoy no hay secreto que filtrar, así que el impacto es bajo. Aun así, el `throw` en cliente y la regla en `CLAUDE.md` lo evitan. |

## Lo que **no** está en esta spec

- Hardening de WordPress (SPEC 02).
- Campos nuevos en el producto de Woo.
- Rebuild automático por webhook.
- Deploy de `main` por FTP.
- Formulario de cotización.
- Precios, stock, carrito o checkout.
- Proxy PHP o fetch a WordPress desde el navegador.
- Buscador y filtros combinados.
- Redirecciones desde las URLs actuales de WordPress.

Cada una de esas, si llega, va en su propia spec.
