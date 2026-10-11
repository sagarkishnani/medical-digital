# SPEC 14 — SEO técnico: GA4 con consentimiento e indexación por entorno

> **Status:** Aprobado
> **Depends on:** SPEC 13 (banner de cookies), SPEC 09 (política de privacidad)
> **Date:** 2026-10-10
> **Objective:** Activar GA4 solo con el consentimiento de "Analítica" y dejar indexable únicamente producción, con el sitemap enlazado desde `robots.txt`.

## Por qué existe esta spec

- La tarjeta "SEO técnico e indexación" del tablero pide sitemap, redirecciones 301, Search Console y GA4 activos.
- El sitemap (`@astrojs/sitemap`) y `robots.txt` ya existen y responden bien en staging.
- GA4 no está instalado. El banner de cookies guarda la elección de "Analítica", pero nada la lee.
- Staging y los previews de PR son indexables: `robots.txt` solo bloquea `/admin/` y ninguna página lleva `noindex`.
- Las redirecciones 301 y Search Console quedan fuera por decisión del usuario (ver Decisiones). La tarjeta no se cierra por completo con esta spec.

## Scope

**In:**

- **GA4.** Campo `global.analytics.ga4Id` en Tina. Vacío, no se carga nada.
- **Consentimiento.** `gtag.js` se carga solo si la categoría `analitica` está aceptada. Si el usuario la retira, deja de medir.
- **Evento de consentimiento.** El banner avisa al guardar, para que GA4 arranque sin recargar la página.
- **Vistas de página** también en las navegaciones con view transitions.
- **Indexación por entorno.** Fuera de producción: `<meta name="robots" content="noindex, nofollow">` y `Disallow: /` en `robots.txt`. En producción queda como hoy.
- **GA4 solo en producción.** Staging y los previews no cargan `gtag.js` aunque el ID esté definido.
- **Sitemap.** Se mantiene `@astrojs/sitemap`. Se verifica que excluye `/admin` y el 404, y `robots.txt` solo lo anuncia en producción.
- **Política de privacidad.** Se agrega la mención a Google Analytics si el texto no la tiene.
- Actualización de `CLAUDE.md` y de `.env.example`.

**Fuera de alcance (para futuras specs):**

- Redirecciones 301 desde el sitio anterior.
- Verificación en Search Console y envío del sitemap.
- Consent Mode v2 y Google Tag Manager.
- Eventos personalizados (cotización, formularios, descarga del catálogo).
- `lastmod` en el sitemap.
- Píxeles de Meta u otras plataformas.

## Modelo de datos

### `tina/collections/global.ts`: objeto nuevo `analytics`

```ts
{
  type: "object",
  name: "analytics",
  label: "Analítica",
  fields: [
    {
      name: "ga4Id",
      label: "ID de medición de GA4",
      description: "Formato G-XXXXXXXXXX. Vacío, no se carga Google Analytics.",
      type: "string",
    },
  ],
}
```

`src/content/global/index.json` suma `"analytics": { "ga4Id": "" }`. El usuario todavía no tiene el ID: el campo se entrega vacío y se llena después en Tina. Un valor que no cumpla `/^G-[A-Z0-9]{6,}$/` se trata como vacío y el build avisa.

### Módulo nuevo `src/utils/consent.ts`

```ts
export const CONSENT_KEY = "medical-digital-cookie-consent:v1";
export const CONSENT_EVENT = "cookie-consent-change";
export function readConsent(): Record<string, boolean> | null;
export function hasConsent(category: "funcional" | "analitica"): boolean;
```

`CookieConsentReact.tsx` deja de declarar su propia clave y su `readConsent`, y los importa de aquí.

### Evento de consentimiento

`CookieConsentReact.tsx` lo emite al guardar cualquier elección:

```ts
window.dispatchEvent(
  new CustomEvent("cookie-consent-change", {
    detail: { necesaria: true, funcional: boolean, analitica: boolean },
  })
);
```

### Componente nuevo `src/components/shared/Analytics.astro`

- Recibe `ga4Id` desde `BaseLayout.astro`.
- No dibuja nada si el ID está vacío o si el entorno no es indexable.
- Su `<script>` carga `https://www.googletagmanager.com/gtag/js?id=<ID>` cuando `hasConsent("analitica")` es verdadero, al cargar la página o al recibir `cookie-consent-change`. Lo carga una sola vez.
- Configura `gtag("config", id, { send_page_view: false })` y envía `page_view` a mano: una vez al cargar y otra en cada `astro:page-load`.
- Con el consentimiento retirado pone `window["ga-disable-<ID>"] = true` y borra las cookies `_ga` y `_ga_*`.

### Entorno indexable

`astro.config.mjs` calcula la decisión una vez y la expone al build:

```ts
const site = resolveSite();
const indexable = site === PRODUCTION_SITE; // "https://medicaldigitalperu.com"
// vite.define: { "import.meta.env.SITE_INDEXABLE": JSON.stringify(indexable) }
```

| Entorno | `site` | `indexable` |
|---|---|---|
| Preview de PR | `pr-<n>.<app>.amplifyapp.com` | `false` |
| Rama `staging` | `staging.<app>.amplifyapp.com` | `false` |
| Rama `main` sin `SITE_URL` | `main.<app>.amplifyapp.com` | `false` |
| Rama `main` con `SITE_URL=https://medicaldigitalperu.com` | dominio propio | `true` |
| Build local | `https://medicaldigitalperu.com` | `true` (no se despliega) |

Con `indexable` en `false`:

- `BaseLayout.astro` emite `<meta name="robots" content="noindex, nofollow">`.
- `robots.txt` responde `User-agent: *` y `Disallow: /`, sin la línea `Sitemap`.
- `Analytics.astro` no carga GA4.
- El build imprime un aviso: `Build no indexable (site: <url>). Define SITE_URL para producción.`

Con `indexable` en `true`, `robots.txt` queda como hoy: `Disallow: /admin/` y la línea `Sitemap`.

## Plan de implementación

Cada paso compila (`npm run build`) y se puede commitear por separado.

1. **Entorno indexable.** En `astro.config.mjs`, calcular `indexable`, exponerlo con `vite.define` e imprimir el aviso cuando sea `false`. Declarar `SITE_INDEXABLE` en `src/env.d.ts`.
2. **`noindex`.** En `BaseLayout.astro`, emitir la meta `robots` cuando `import.meta.env.SITE_INDEXABLE` es `false`.
3. **`robots.txt`.** En `src/pages/robots.txt.ts`, responder `Disallow: /` sin `Sitemap` cuando no es indexable.
4. **Sitemap.** Construir y revisar `dist/sitemap-0.xml`: sin `/admin`, sin `/404` y con todas las rutas de `src/pages/`. Corregir el `filter` de `astro.config.mjs` solo si falta o sobra algo.
5. **`consent.ts`.** Crear `src/utils/consent.ts` y hacer que `CookieConsentReact.tsx` lo use. Sin cambios de comportamiento.
6. **Evento.** En `CookieConsentReact.tsx`, emitir `cookie-consent-change` dentro de `persistAndClose`.
7. **Schema.** Agregar `analytics.ga4Id` a `tina/collections/global.ts` y a `src/content/global/index.json` (vacío).
8. **`Analytics.astro`.** Crear el componente con la carga condicionada, el `page_view` manual y el apagado al retirar el consentimiento. Montarlo en el `<head>` de `BaseLayout.astro` con el ID del CMS.
9. **Política de privacidad.** Revisar `src/content/legal/` y agregar el párrafo de Google Analytics (qué mide, que es opcional y cómo retirarlo con el enlace `#preferencias-cookies`) si no está.
10. **Documentación.** Actualizar `CLAUDE.md` (`SITE_URL` obligatoria en producción, GA4, `consent.ts`) y el comentario de `SITE_URL` en `.env.example`. Completar "Notas de implementación" y "QA realizada".

## Criterios de aceptación

**Indexación**

- [ ] En staging y en un preview de PR, todas las páginas traen `<meta name="robots" content="noindex, nofollow">`.
- [ ] En staging, `/robots.txt` responde `Disallow: /` y no tiene la línea `Sitemap`.
- [ ] Un build con `SITE_URL=https://medicaldigitalperu.com` no emite la meta `robots`, y `robots.txt` trae `Disallow: /admin/` y `Sitemap: https://medicaldigitalperu.com/sitemap-index.xml`.
- [ ] Un build no indexable imprime el aviso con la URL del sitio.
- [ ] `sitemap-0.xml` lista la Home, `/productos`, cada categoría, cada ficha, `/noticias`, cada noticia, `/nosotros`, `/marcas`, `/contacto`, `/servicio-tecnico` y las dos páginas legales.
- [ ] `sitemap-0.xml` no lista `/admin` ni `/404`.

**GA4**

- [ ] Con `ga4Id` vacío, ninguna página pide nada a `googletagmanager.com` ni a `google-analytics.com`.
- [ ] Con un ID válido en un build indexable y sin consentimiento guardado, tampoco se pide nada.
- [ ] Al pulsar "Aceptar todo", `gtag.js` se carga sin recargar y se envía un `page_view`.
- [ ] Con "Analítica" aceptada, cada navegación entre páginas envía un solo `page_view`, con view transitions y en `/productos` (que las tiene apagadas).
- [ ] Al pulsar "Rechazar todo" después de aceptar, no se envían más eventos y desaparecen las cookies `_ga` y `_ga_*`.
- [ ] Con un ID válido en staging, `gtag.js` no se carga aunque se acepte "Analítica".
- [ ] Un ID con formato inválido (`UA-123`, `GTM-ABC`) no carga nada y el build avisa.
- [ ] El campo "ID de medición de GA4" aparece en Tina dentro de "Analítica".

**Consentimiento**

- [ ] `CookieConsentReact.tsx` importa la clave y `readConsent` de `src/utils/consent.ts`. La clave `medical-digital-cookie-consent:v1` aparece en un solo archivo de `src/`.
- [ ] El banner y el modal de cookies se comportan igual que al cerrar la SPEC 13.

**General**

- [ ] `/politicas-de-privacidad` menciona Google Analytics y cómo retirar el consentimiento.
- [ ] `npm run build`, `npm run typecheck` y `npm run check:standard` pasan sin errores ni warnings nuevos, salvo el aviso de build no indexable.
- [ ] Lighthouse mobile de la Home en el preview mantiene Rendimiento ≥ 90.

## Decisiones

- **Sí: dos specs.** Esta cubre SEO técnico; la SPEC 13 cubre rendimiento, accesibilidad, animaciones y cookies. Esta depende de la 13 porque el banner cambia ahí.
- **Sí: definición rápida de las últimas secciones.** El usuario confirmó la cabecera y el alcance, y pidió asumir el resto sin revisarlo sección por sección. El modelo de datos, el plan, los criterios y los riesgos no tuvieron confirmación explícita.
- **No: redirecciones 301.** Decisión del usuario. El mapeo desde el sitemap del WordPress anterior tampoco se hace, porque sin redirecciones no tiene uso. Si el dominio pasa al sitio nuevo sin ellas, las URLs viejas indexadas darán 404.
- **No: Search Console.** El usuario no tiene acceso al DNS para la verificación por registro TXT.
- **No: verificación de Search Console por meta tag.** Era la alternativa sin DNS; el usuario pidió no hacer nada en este punto.
- **Sí: ID de GA4 en un campo de Tina.** Elección del usuario. El cliente lo cambia sin tocar código y vacío no carga nada.
- **No: variable de entorno `PUBLIC_GA4_ID`.** Obliga a entrar a Amplify para un dato que no es secreto.
- **No: pegarlo en `codeInjection.head`.** Cargaría sin consentimiento.
- **Sí: GA4 solo con "Analítica" aceptada.** Elección del usuario. Es lo que el banner promete.
- **No: Consent Mode v2.** Carga `gtag.js` y envía pings antes de cualquier elección.
- **Sí: `page_view` manual.** Con `ClientRouter` la página no recarga, y el envío automático de GA4 depende de una opción de la propiedad que no se ve desde el código.
- **Sí: `noindex` y `Disallow: /` fuera de producción.** Confirmado por el usuario. Staging no debe competir con el dominio real.
- **Sí: "producción" es `site === PRODUCTION_SITE`.** Reutiliza `resolveSite()` sin una variable nueva. Falla hacia el lado seguro: un entorno sin `SITE_URL` no se indexa.
- **No: decidir por el nombre de la rama (`AWS_BRANCH === "main"`).** La URL `main.<app>.amplifyapp.com` quedaría indexable junto al dominio propio.
- **Sí: GA4 apagado fuera de producción.** Las visitas de staging y de los previews ensucian los datos.
- **Sí: quitar la línea `Sitemap` del `robots.txt` no indexable.** Anunciar un sitemap de URLs bloqueadas es contradictorio.
- **Sí: mantener `@astrojs/sitemap` como está.** Ya genera el índice y excluye `/admin`. Solo se verifica.
- **No: `lastmod`.** Los productos vienen de Woo en build y no hay una fecha confiable por página.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Producción sale con `noindex` porque falta `SITE_URL` en la rama `main` de Amplify | El build avisa con la URL resuelta. Se documenta en `CLAUDE.md` y hay un criterio que verifica el build con `SITE_URL`. Se comprueba el HTML de producción después del primer deploy |
| Sin 301, las URLs del sitio anterior pierden su posición al cambiar el dominio | Fuera de alcance por decisión del usuario. Queda anotado aquí para retomarlo en una spec propia antes del lanzamiento |
| Sin Search Console no se ve si Google indexa bien el sitio nuevo | Fuera de alcance hasta tener acceso al DNS. El sitemap queda listo para enviarlo |
| `page_view` duplicado si la propiedad de GA4 tiene activa la medición de cambios de historial | `send_page_view: false` y envío manual. Se verifica en DebugView con una navegación |
| El campo se entrega vacío y GA4 no queda "activo" al cerrar la spec | Es un dato pendiente del usuario. El criterio se prueba con un ID de prueba en un build local con `SITE_URL` |
| La SPEC 13 cambia `CookieConsentReact.tsx` al mismo tiempo | Esta spec se implementa después de mergear la 13 |
| `gtag.js` baja el rendimiento de Lighthouse | Solo carga tras el consentimiento, y Lighthouse mide una primera visita sin él |

## Lo que **no** entra en esta spec

- Redirecciones 301 desde el sitio anterior.
- Verificación en Search Console y envío del sitemap.
- Consent Mode v2 y Google Tag Manager.
- Eventos personalizados de GA4.
- `lastmod` en el sitemap.
- Píxeles de otras plataformas.

Cada una, si llega, va en su propia spec.
