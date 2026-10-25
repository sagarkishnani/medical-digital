# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Comandos

```bash
npm run dev        # TinaCMS + Astro (siempre juntos: /admin necesita el server de Tina)
npm run build      # tinacms build → astro build
npm run preview     # previsualiza el build de producción
```

No hay test runner configurado.

## Entorno

Copia `.env.example` a `.env`. Deja `TINA_CLIENT_ID`/`TINA_TOKEN` vacíos para
trabajar en **modo local** (Tina lee y escribe los archivos de `src/content/`
sin cuenta en la nube).

**`SITE_URL` define el dominio absoluto del build** (canonicals, sitemap,
`robots.txt`, JSON-LD y enlaces que salen del sitio). Normalmente se deja
vacía: en Amplify se deriva de sus variables (`pr-<n>.<app>.amplifyapp.com` en
los previews de PR, `<rama>.<app>.amplifyapp.com` en las ramas, con `/` → `-`)
y fuera de Amplify cae a `https://medicaldigitalperu.com`. Solo se define para
un dominio propio. La lógica vive en `resolveSite()` de `astro.config.mjs`.

**Producción no se compila en Amplify**, sino en GitHub Actions
(`.github/workflows/deploy.yml`), que fija `SITE_URL=https://medicaldigitalperu.com`
y `TINA_BRANCH=main`. Amplify queda para staging y los previews de PR: un build
de su rama `main` resuelve a `main.<app>.amplifyapp.com` y sale con `noindex` y
sin GA4. Ver **Producción** e **Indexación y analítica**.

**`TINA_BRANCH` importa más de lo que parece.** TinaCloud indexa el contenido
**por rama**, y el valor se hornea dentro de `tina/__generated__/client.ts` al
correr `tinacms build`: *no* se lee en runtime. Compilar un árbol contra el
índice de otra rama falla si los schemas difieren.

## Flujo de trabajo

### Ramas

`main` es producción y `staging` la línea de desarrollo. Las ramas de trabajo
**siempre salen de `staging` actualizado** y se PR-ean contra `staging`:

```
tipo/descripcion-corta
```

| Tipo | Cuándo |
|------|--------|
| `feat/` | Nueva funcionalidad |
| `fix/` | Corrección de error |
| `chore/` | Mantenimiento, dependencias, configuración, limpieza |

Ejemplos: `feat/formulario-contacto`, `fix/total-checkout-igv`,
`chore/actualizar-dependencias`. Minúsculas, palabras separadas por guiones, sin
tildes ni espacios.

### Commits

Conventional Commits, descripción **en presente y en español**:

```
tipo(alcance opcional): descripción en presente
```

```
feat: agrega formulario de contacto
fix(checkout): corrige cálculo del total con IGV
chore: actualiza dependencias
```

## Arquitectura

**Astro 5 SSG + React 19 (islas) + TinaCMS 2 (CMS sobre git)**

El sitio se compila estático (sin adaptador SSR). Todo lo dinámico en runtime es
una isla de React hidratada.

### Patrón de componente doble

Cada sección alimentada por el CMS son dos archivos:

- `Componente.astro` — resuelve la consulta a TinaCMS **en build time** con
  `client` de `tina/__generated__/client` y pasa `{ query, variables, data }`.
- `ComponenteReact.tsx` — recibe esas props y renderiza; envuelve el contenido en
  `useTina()`, que es lo que habilita la edición visual en el panel.

Directivas de hidratación: `client:load` arriba del fold, `client:visible`
debajo. `client:tina` (integración propia en `astro-tina-directive/`) hidrata
**solo dentro del editor de Tina**: en producción no carga React.

Las secciones de una misma página comparten una sola consulta: la página la
resuelve y se la pasa a cada isla (ver `src/pages/index.astro`).

### Contenido y colecciones

El contenido vive en `src/content/` como JSON (páginas estructuradas).
Las noticias son MDX en `src/content/blog/` (la carpeta conserva el nombre; la
URL es `/noticias`).
El schema de `tina/config.ts` es la única fuente de verdad sobre la forma del
contenido; cada colección vive en su propio archivo en `tina/collections/`.
Los tipos, las queries y el cliente se generan en `tina/__generated__/`
(**no editar a mano**).

Colecciones:

- `global` — header (`nav`: logo, enlaces, "Cotiza aquí" y el panel ☰ con
  tarjetas y columnas), footer (banner del catálogo, columnas de enlaces,
  certificaciones, Libro de Reclamaciones, redes y línea legal), SEO por
  defecto, código inyectado, el WhatsApp
  comercial (lo usan "Solicitar cotización" y el botón flotante, que se
  enciende con `whatsappButton.enabled`), el placeholder de la búsqueda
  (`search`), el catálogo PDF (`catalog`: sin archivo, sus enlaces no se
  dibujan en el mega menú, el panel ☰ ni el footer), los íconos de cada categoría de Woo
  (`categoryIcons`, los usan el header y la Home) y los datos de la empresa
  (`company`: dirección, teléfono, correos, horario y `serviceEmail`, el
  correo que muestra `/servicio-tecnico`; vacío, no se muestra), los textos
  del modal de cotización (`quote`: consentimiento, línea de destino, éxito y
  error) y el ID de GA4 (`analytics.ga4Id`; vacío, no se carga Google
  Analytics).
- `home` — contenido de la portada: slider, destacados (los marca Woo),
  especialidades (categorías de Woo), "Conoce más", marcas, testimonios y
  noticias (los 3 últimos posts). Cada marca lleva `slug` (el de WooCommerce)
  y `desc`; las marcas y los testimonios también se muestran en `/marcas`.
- `about` — página `/nosotros`. Cada política lleva `slug`: la pestaña se
  abre con `/nosotros?politica=<slug>#politicas`.
- `contact` — página `/contacto`, textos del formulario (con los de éxito y
  error) y el mapa de Google (acepta el código de "Insertar un mapa"; solo se
  usa si el `src` es de `google.com/maps/embed`).
- `service` — página `/servicio-tecnico`: cabecera, textos del formulario y
  SEO. El teléfono y el correo salen de `global.company`. El formulario envía
  con el backend de **Formularios**.
- `brandsPage` — página `/marcas`: cabecera, título y texto del enlace de la
  grilla, interruptores por bloque y SEO.
- `legal` — `/terminos-y-condiciones` (`terms`) y `/politicas-de-privacidad`
  (`privacy`): cabecera, fecha de actualización y PDF opcionales, texto en
  rich text y SEO.
- `post` — noticias en MDX (`src/content/blog/`): `title`, `excerpt` (lead y
  tarjetas), `category` (Productos, Actividades, Capacitaciones o Noticias,
  fijas en `NEWS_CATEGORIES`), `author` (vacío muestra "Equipo Medical
  Digital"), `coverImage` (también es el `og:image`), `date`, `featured` y
  `seo` opcional (vacío usa "{título} | Medical Digital" y el extracto). El
  tiempo de lectura se calcula en build (`readingMinutes`, 200 palabras/min).
- `news` — textos y SEO de `/noticias`.
- `maintenance` — modo mantenimiento del sitio.
- `cookieConsent` — textos del banner de cookies (`bannerText`,
  `btnConfigure`) y del modal de categorías. Ver **Cookies**.
- `productPage` — etiqueta ("Uso Profesional Médico") y sellos de la ficha de
  producto, iguales para todos los productos.
- `formConfig` — por formulario (`contacto`, `cotizacion`,
  `servicio-tecnico`): `enabled` y `recipients[]`. Ver **Formularios**.
- `promoPopup` — popup de promoción en todo el sitio: `enabled`,
  `campaign`, `delaySeconds` (vacío, 5), imagen opcional, título, texto y
  botón. Ver **Popup de promoción**.


### Catálogo de WooCommerce

Los productos viven en el WordPress de `WOO_STORE_URL` y se leen **solo en
build** desde la REST API v3 de Woo (`/wp-json/wc/v3/`), como en Eres, con una
clave de **solo lectura** (`WOO_CONSUMER_KEY`/`WOO_CONSUMER_SECRET`, por
cabecera `Authorization`). No hay proxy ni fetch a WordPress desde el
navegador. Ver `specs/01-catalogo-productos-woo.md` y `specs/06-ficha-producto.md`.

- `src/lib/woo/store.ts` descarga, proyecta y sanitiza. Solo sale lo declarado
  en `src/lib/woo/types.ts`; el HTML de las descripciones pasa por una allowlist.
- **Nunca importes `src/lib/woo/store.ts` desde un `.tsx`.** Solo desde páginas
  y componentes `.astro`. El módulo lanza un error si llega al navegador.
- `WOO_STORE_URL` y las claves van sin prefijo `PUBLIC_`. Con la URL vacía, el
  catálogo se genera vacío; con la URL y sin claves, o si WordPress no
  responde, **el build falla** a propósito para no publicar un catálogo vacío.
- Se leen solo productos `publish` y se descartan los de visibilidad `hidden`.
- Las imágenes pasan por `astro:assets` (`image.domains` se deriva de
  `WOO_STORE_URL` en `astro.config.mjs`) y se sirven desde `dist/`.
- Los productos no son componente doble: se editan en Woo, no en Tina.
- **Un cambio en Woo no aparece hasta el siguiente deploy.** En producción lo
  disparan los webhooks de producto (ver **Producción**); un cambio que no
  toca ningún producto (renombrar una categoría o una marca) espera al deploy
  diario. En staging hay que volver a desplegar ("Redeploy" en Amplify).

Rutas: `/productos`, `/productos/categoria/[slug]` y `/productos/[slug]`.

El catálogo (`/productos` y las categorías) comparte `CatalogPage.astro`:
`src/lib/woo/catalog.ts` arma en build los productos y las facetas, y la isla
`CatalogReact` filtra en el navegador. El estado vive en la URL (ver
`specs/05-catalogo-con-filtros.md`):

| Parámetro | Ejemplo | Por defecto (se omite) |
|---|---|---|
| `especialidad` | `?especialidad=cardiologia` | ninguna |
| `q` | `?q=holter` | vacío |
| `marca` | `?marca=schiller,edan` | ninguna |
| `orden` | `?orden=a-z` (`relevantes`, `a-z`, `z-a`) | `relevantes` |
| `pagina` | `?pagina=2` | `1` |

`/productos/categoria/<slug>` es una landing estática con la especialidad
implícita; cambiar de especialidad desde ahí lleva a `/productos?especialidad=…`.
"Más relevantes" pone primero los destacados de Woo. El catálogo apaga las view
transitions (`<BaseLayout viewTransitions={false}>`) para que `ClientRouter` no
compita con su historial.

La ficha (`/productos/[slug]`, ver `specs/06-ficha-producto.md`) suma tres
fuentes, todas en build:

- `brandLogo`: el logo de la marca, de `products/brands`.
- `src/lib/woo/extras.ts`: los campos de JetEngine (ficha técnica PDF,
  especificaciones, accesorios y video) desde el `meta_data` de la v3, en la
  misma descarga que el catálogo. Son **opcionales**: si ningún producto los
  trae, el build avisa y la ficha sale sin esas secciones. Las reglas puras están en
  `extrasRules.ts`.
- `src/lib/woo/productPage.ts` (`buildProductPage`, como en Eres): los paneles
  del acordeón y hasta 4 relacionados (cross-sells y upsells de Woo, después
  la misma especialidad por destacados, la misma marca y los destacados).

La portada del video de YouTube se elige en build (`src/lib/woo/youtubePoster.ts`,
ver `specs/12-ajustes-visuales.md`): `maxresdefault` → `sddefault` →
`hqdefault`, y la que responde pasa por `astro:assets` (`i.ytimg.com` está en
`image.domains`). Si YouTube no responde, el build avisa y usa `hqdefault`
remoto: una portada nunca tumba el deploy.

En mobile la ficha tiene una barra fija (`data-mobile-bottom-bar`): el `body`
reserva su alto y `BaseLayout hideWhatsAppButton` oculta el botón flotante por
debajo de `lg`.

### Noticias

`/noticias` y `/noticias/<slug>` (ver `specs/07-noticias.md`). Los helpers
viven en `src/utils/news.ts` (fecha "18 sep 2026", lectura, destacado). La isla
`NewsListReact` filtra en el navegador con `?categoria=<slug>`
(`history.replaceState`); el HTML estático es la vista "Todos". Destacado: en
"Todos", el más reciente con `featured`, o el más reciente; en una categoría,
el primero. Mobile no muestra destacado ni "Sigue leyendo". El artículo emite
`og:type="article"` y JSON-LD `BlogPosting` + `BreadcrumbList` mediante las
props `ogImage`, `ogType`, `article` y `jsonLd` de `BaseLayout`.

### Marcas

`/marcas` (ver `specs/10-marcas-y-resenas.md`) consulta `brandsPage` y `home`:
las marcas y los testimonios se editan en un solo lugar, la Home. En build
cuenta los productos de Woo por `brandSlug`; "Ver productos" lleva a
`/productos?marca=<slug>` solo si la marca tiene productos, y el build avisa
con un warning por cada `slug` sin productos. Un cambio de slug en Woo deja
la marca sin enlace hasta corregirlo en Tina.

La franja de logos (`BrandsReact`, Home y `/marcas`) es un marquee solo en
CSS (`animate-marquee`, `.marquee-mask`), sin controles como en la referencia;
el `<script>` de `Brands.astro` carga los logos antes de que entren en
pantalla. Con `prefers-reduced-motion` queda estática. Es una excepción al
estándar §4 (ver la SPEC 10): no lo extiendas a otros bloques.

### Legales

`/terminos-y-condiciones` y `/politicas-de-privacidad` (ver
`specs/09-legales-y-privacidad.md`) comparten `LegalPage.astro`, que dibuja el
texto con `PostBody` sin isla ni `useTina`: la edición en Tina se ve al
recargar la vista previa. Los formularios y el "Ver más" de cookies enlazan
la política de privacidad. El Libro de Reclamaciones queda sin URL hasta que
el cliente entregue la suya; el footer lo oculta mientras tanto.

### Formularios

Contacto, Cotización (`QuoteModal`) y Servicio técnico envían por correo con
`public/send-email.php` (ver `specs/11-envio-de-formularios.md`). Los campos
son fijos en el código, no en Tina.

- **Cliente:** `src/hooks/useFormSubmission.ts` valida con
  `src/utils/formValidation.ts`, maneja los estados (cargando, éxito y error)
  y llama a `src/utils/submitForm.ts`. Las piezas visuales (error junto al
  campo, éxito, honeypot y contador de caracteres) están en
  `src/components/shared/FormStatus.tsx`.
- **Reglas** (ver `specs/18-validaciones-formularios.md`): obligatorio,
  mínimo, máximo y formato de cada campo viven en `FORM_FIELDS` y en las
  `FORMS` del PHP, que deben cambiar juntas en el mismo commit. Los inputs
  toman su `maxLength` de `FORM_FIELDS`. Se valida al enviar y, después del
  primer intento, cada campo al salir de él. El teléfono acepta solo dígitos
  (7 a 11).
- **Marca de Servicio técnico:** un `<select>` con `getBrands()` (las marcas
  de Woo en build, orden alfabético) y "Otra marca" al final. Con "Otra
  marca" aparece `brandOther`, y el hook envía ese texto en `brand`: el PHP
  solo recibe `brand`.
- **Endpoint:** `PUBLIC_FORMS_ENDPOINT`; vacía, `send-email.php` del mismo
  dominio. En producción es el de `httpdocs`, junto al sitio. Amplify no
  ejecuta PHP: en staging, sin backend, el formulario valida y muestra el
  error con WhatsApp.
- **Destinatarios:** colección `formConfig` → `/form-config.json` en build
  (un cambio necesita redeploy). Sin destinatarios, usa `fallback_email`.
- **Secretos:** solo en `public/site-config.php`, que se sube a mano junto a
  `send-email.php` y está en `.gitignore` (plantilla en
  `public/config.example.php`). Sin ese archivo o con el SMTP vacío, el PHP
  responde un error JSON.
- **SMTP:** PHPMailer 7.1.1 copiado en `public/phpmailer/` (sin Composer),
  con STARTTLS a `smtp.office365.com:587`. El buzón del cliente necesita
  SMTP AUTH habilitado en Microsoft 365. Se envía un correo al equipo
  (correlativo `CON-`, `COT-` o `SVT-` y `Reply-To` del usuario) y una
  confirmación al usuario, con `Reply-To` del primer destinatario del
  formulario; si la confirmación falla, el envío igual cuenta.
- **Turnstile:** programado y apagado. Se activa con
  `PUBLIC_TURNSTILE_SITE_KEY` (el widget) y `turnstile_secret` (el PHP
  verifica y falla cerrado). Con una sola de las dos, no queda bien activado.
- **Protección:** honeypot `website`, 5 envíos cada 10 minutos por IP y CORS
  solo para el mismo origen (esquema, host y puerto) o `allowed_origins`. Un
  preview de Amplify que apunte a otro PHP necesita su URL en esa lista.
- **Datos:** no se guardan los envíos. `send-email.php` crea `data/` (con
  `.htaccess` que niega el acceso) solo para los contadores y los hashes de
  IP del límite.

### Cookies

`CookieConsentReact.tsx` (ver `specs/13-rendimiento-accesibilidad-cookies.md`)
tiene tres vistas: `hidden`, `banner` y `settings`. Sin consentimiento guardado
muestra el banner: una tarjeta fija abajo a la izquierda, sin overlay, que no
bloquea la página ni atrapa el foco. "Configurar", un enlace
`#preferencias-cookies` o el evento `open-cookie-consent` abren el modal de
categorías, un `<dialog>` nativo con `scrollLock`. La elección se guarda en
`localStorage["medical-digital-cookie-consent:v1"]`. En mobile el banner se
dibuja por encima del botón de WhatsApp y de la barra fija de la ficha.

La clave y la lectura viven en `src/utils/consent.ts` (`CONSENT_KEY`,
`readConsent`, `hasConsent("funcional" | "analitica")`): todo script que
dependa del consentimiento lo lee de ahí. Al guardar cualquier elección el
banner emite `cookie-consent-change` en `window`, con
`detail: { necesaria, funcional, analitica }`.

### Indexación y analítica

Ver `specs/14-seo-tecnico-ga4-indexacion.md`. `astro.config.mjs` decide una
vez si el build es indexable (`site === PRODUCTION_SITE`) y lo expone como
`import.meta.env.SITE_INDEXABLE`. Staging, los previews de PR y
`main.<app>.amplifyapp.com` no lo son; el build local sí, porque cae al
dominio de producción.

Un build no indexable avisa en consola (`Build no indexable (site: …)`),
emite `<meta name="robots" content="noindex, nofollow">` en todas las páginas,
responde `Disallow: /` sin la línea `Sitemap` en `robots.txt` y no carga GA4.
`npm run check:standard` falla a propósito sobre un build así.

GA4 (`src/components/shared/Analytics.astro`, montado en el `<head>` de
`BaseLayout`) usa `global.analytics.ga4Id`. Un ID que no cumpla
`G-XXXXXXXXXX` se trata como vacío y el build avisa (`src/utils/ga4.ts`).
`gtag.js` se pide solo con "Analítica" aceptada, al cargar o al recibir
`cookie-consent-change`, sin recargar. El `page_view` se envía a mano
(`send_page_view: false`): uno al cargar y uno por cada `astro:page-load`,
sin repetir la misma URL. Al retirar el consentimiento pone
`window["ga-disable-<ID>"]` y borra las cookies `_ga` y `_ga_*`. **No pegues
GA4 en `codeInjection.head`**: cargaría sin consentimiento.

El sitemap (`@astrojs/sitemap`) excluye `/admin`; el 404 no entra.

### Producción

Ver `specs/16-pase-a-produccion.md` y la guía `wordpress/README.md`. El sitio
se publica en el Plesk del cliente, en la carpeta `httpdocs` de
`medicaldigitalperu.com`, **la misma donde vive WordPress**. Astro sirve el
sitio público; WordPress queda para `/wp-admin/`, `/wp-json/` y
`/wp-content/`. Staging y los previews de PR siguen en Amplify.

- **Deploy:** `.github/workflows/deploy.yml` ("Deploy a producción") compila
  `main` y sube `dist/` con `rsync` por SSH (secrets `PLESK_*`). Corre con
  cada push a `main`, con cada webhook de producto (`repository_dispatch`,
  tipo `woo-catalog-changed`), todos los días a las 04:00 de Lima y a mano.
  No depende de `estandar.yml`.
- **Raíz compartida:** en la raíz de `httpdocs` no se borra nada; `--delete`
  solo corre dentro de las carpetas de primer nivel de `dist/`. El workflow
  se detiene si `dist/` trae un nombre de WordPress (`wp-content`,
  `index.php`, `wp-*.php`…): **no crees una página ni una carpeta en
  `public/` con esos nombres.**
- **Webhook:** `public/rebuild-hook.php` recibe los webhooks de producto de
  WooCommerce, valida la firma con `webhook_secret` y dispara el workflow con
  `github_token`. Las tres claves viven en `site-config.php`. No guarda nada
  en disco.
- **Servidor:** el `.htaccess` de `httpdocs` se edita a mano; el deploy no lo
  toca, ni `site-config.php`, ni `data/`. Su bloque está versionado en
  `wordpress/htaccess-astro.conf` (índice, redirecciones `301` de las URLs
  viejas de WordPress y 404 de Astro), con la reversa en
  `htaccess-reversa.conf` y la variante para nginx en `nginx-astro.conf`.
  **Una ruta nueva de WordPress que deba ser pública se agrega ahí.**
- **Prueba de humo:** al final del deploy comprueba la home, `robots.txt`,
  `/wp-json/`, `rebuild-hook.php`, una redirección y el 404. Si falla, el job
  queda en rojo; lo subido no se revierte solo.

### Popup de promoción

`PromoPopup.astro` (montado en `BaseLayout`) solo dibuja la isla con
`enabled: true`. `PromoPopupReact` abre un `<dialog>` nativo con `scrollLock`
a los `delaySeconds`. Al cerrarlo, o al hacer clic en el botón, guarda
`campaign` en `localStorage["medical-digital-promo-dismissed"]` y no vuelve a
salir hasta que `campaign` cambie en Tina. Dentro del editor de Tina se abre
siempre y sin espera. Un cambio necesita deploy.

### Modo mantenimiento

`BaseLayout.astro` consulta la colección `maintenance` en build time; con
`enabled: true` reemplaza todo el cuerpo de la página por una pantalla de aviso.

### Estilos

Tailwind CSS 3 con tokens propios en `tailwind.config.mjs`. Los tokens nuevos
de color y tipografía, y el sistema base de botones, corresponden al **UI Kit
aprobado**. Se mantienen temporalmente algunos tokens legacy usados por
componentes existentes. Las clases reutilizables (botones, `card`, `section`,
`container-xl`, `container-lg`) están en `src/styles/global.css`, que
**BaseLayout importa** — un CSS que nadie importa no se bundlea y no llega al
sitio.

La variante `can-hover:` (plugin en `tailwind.config.mjs`) aplica los hover solo
con mouse (`hover: hover` y `pointer: fine`): úsala en tarjetas y efectos que no
deben quedar "pegados" al tocar en mobile, p. ej. `can-hover:hover:shadow-lg`.

Iconos: `react-icons`. El UI Kit usa **Phosphor Light** (`react-icons/pi`, sufijo
`Light`). Excepciones que entregó diseño: los logos de las redes y de WhatsApp van
con `react-icons/fa6` (las redes se mapean en `src/components/shared/socialLinks.ts`)
y el ícono PDF es `BsFiletypePdf` (`react-icons/bs`). Cuando el
editor elige el ícono en Tina, las opciones están en `src/lib/icons.ts` y se
dibujan con `src/components/shared/Icon.tsx`.
Los íconos de especialidad que entregó diseño (corazón con pulso, pulmones y
ambulancia con sirena) viven en `src/components/shared/designIcons.ts`
como `GenIcon` de `react-icons`, con `currentColor` (ver `specs/15-iconos-especialidades.md`).

Componentes reutilizables (úsalos antes de escribir uno nuevo):

- `src/hooks/useSlider.ts` — todo slider va con Embla y este hook: sin
  autoplay y con `prefers-reduced-motion`. El teclado se resuelve con las
  flechas y los dots como `<button>`. No escribas un motor de arrastre propio.
- `src/components/shared/PageHero.tsx` — cabecera de página interna con
  breadcrumb.
- `src/components/shared/QuoteModal.tsx` — modal "Solicitar cotización".
- `src/components/productos/ProductCard.astro` — tarjeta de producto de la home
  y del catálogo, en Astro puro. Su botón lleva `data-quote-name`,
  `data-quote-url` (WhatsApp) y `data-quote-product-url` (sin él, se envía la
  URL de la página): `HeaderReact` escucha esos clics y abre el `QuoteModal`.
  Cualquier botón con esos atributos abre la cotización sin una isla propia.
- `src/utils/url.ts` (`withBase`) — rutas internas escritas en el código.
- `src/utils/scrollLock.ts` — bloquea y libera el scroll de la página (también
  detiene Lenis, expuesto en `window.lenis`). Úsalo en todo panel o modal a
  pantalla completa.

El header (`Header.astro` + `HeaderReact.tsx`) es sticky y coordina un solo
panel abierto a la vez: `ProductsMegaMenu` (desktop), `SiteMenu` (☰ en desktop
y menú mobile) y `SearchOverlay` (lee `/search-index.json`, que solo tiene
productos de Woo). Las anclas (`[id]`) llevan `scroll-margin-top` para quedar
visibles bajo el header; los heros ya no reservan espacio para él.
Los enlaces del menú van en la barra desde 1101 px (breakpoint `nav`, como
en la referencia); entre 1024 y 1100 px se muestran en una fila del panel ☰.
Texto y rellenos del header son fluidos (`text-nav-link`, `spacing.nav-*` en
`tailwind.config.mjs`): no los pases a medidas fijas por breakpoint, porque
con cinco enlaces el menú se monta sobre la lupa.

**Tema: light.** Los componentes NO escriben colores: piden tokens
semánticos, y por eso el tema se puede cambiar sin tocar una sola clase.

| Token | Para qué | Valor |
|---|---|---|
| `surface` | Fondo de la página | `#FFFFFF` |
| `surface-raised` | Tarjetas, footer | `#F5F5F5` |
| `content` | Texto principal (azul marino de marca) | `#1F2B5B` |
| `content-muted` | Texto secundario | `#4B5563` |
| `content-subtle` | Metadatos | `#6B7280` |
| `line` / `line-strong` | Bordes | `#E5E7EB` / `#CBD1D9` |
| `accent` | Marca legible sobre el fondo | `#A32C26` |

Los tonos de texto cumplen 4.5:1 sobre su fondo, **salvo `content-subtle` sobre
`surface-raised` (4.43:1)**: no lo uses para texto dentro de tarjetas o footer
hasta oscurecerlo. Si cambias un tono, vuelve a medir.

**Nunca escribas `text-white/65` ni `bg-white/5`**: asumen fondo oscuro y rompen
el tema. Las únicas excepciones legítimas son los bloques con fondo oscuro fijo
(el scrim del hero sobre una foto, el degradado de marca del CTA, el footer
navy) y el texto sobre `bg-brand-primary`. El footer usa la paleta `brand-*`
en vez de los tokens semánticos.

Para "texto en color de marca" usa `text-accent`, **no** `text-brand-primary-light`:
sobre fondo claro ese tono es ilegible.

**Paleta**: `brand-primary` (rojo), `brand-secondary` (azul marino),
`brand-tertiary` (azul), `semantics-success|alert|error` y `greyscale`, cada una
con los pasos `darkest`, `dark`, `medium`, `light` y `lightest`. `DEFAULT` repite
`medium`, así que `bg-brand-primary` equivale a `bg-brand-primary-medium`.
Fondos: `background-white` y `background-soft`. Degradados: `bg-gradient-primary`
y `bg-gradient-overlay`. Los hex viven solo en `tailwind.config.mjs`.

**Azul marino**: `brand-secondary` (`#1F2B5B`), `brand-secondary-dark`
(`#18214A`), `brand-secondary-darkest` (`#111833`), `brand-secondary-light`
(`#8C95B8`), `brand-secondary-lightest` (`#E6E9F2`). Son hex estimados desde el
Figma: confírmalos con el diseño.

**Tipografías**: Rubik (títulos), Rubik (cuerpo),
Space Mono (acentos técnicos). La escala está como utilidades de Tailwind
(`heading-xxl` → `caption-sm`).


### Panel del CMS

Disponible en `/admin` con `npm run dev`. Las imágenes se suben a `public/`.

### Imágenes del contenido

- Van en `public/uploads/<sección>/` (`home/`, `nosotros/`, `contacto/`…) y en
  el contenido se escriben como `/uploads/<sección>/<archivo>`.
- WebP para fotos y SVG para logos; ancho máximo 1440 px y menos de 300 KB
  por imagen (estándar §5.2).
- Nombres descriptivos en minúsculas con guiones
  (`slide-servicio-tecnico.webp`, no `IMG_2034.jpg`).
- Toda imagen del CMS pasa por `mediaUrl()` (`src/utils/mediaUrl.ts`): con
  TinaCloud llegan con el prefijo `assets.tina.io` y la función las devuelve a
  la ruta local.
- Cada componente funciona sin imagen (degradado de marca o bloque neutro), así
  que quitar una foto en Tina nunca rompe el layout.

El favicon es `public/favicon.svg`, con `public/favicon.png` de 100×100 como
respaldo; los dos se enlazan en `BaseLayout.astro`.
