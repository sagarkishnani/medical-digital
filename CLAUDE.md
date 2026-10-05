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
Los artículos del blog son MDX en `src/content/blog/`.
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
  (`search`), el catálogo PDF (`catalog`), los íconos de cada categoría de Woo
  (`categoryIcons`, los usan el header y la Home) y los datos de la empresa
  (`company`: dirección, teléfono, correos y horario).
- `home` — contenido de la portada: slider, destacados (los marca Woo),
  especialidades (categorías de Woo), "Conoce más", marcas, testimonios y
  noticias (los 3 últimos posts).
- `about` — página `/nosotros`.
- `contact` — página `/contacto` y el mapa de Google (acepta el código de
  "Insertar un mapa"; solo se usa si el `src` es de `google.com/maps/embed`).
- `post` — artículos del blog en MDX (`src/content/blog/`).
- `maintenance` — modo mantenimiento del sitio.
- `cookieConsent` — textos del banner de cookies.


### Catálogo de WooCommerce

Los productos viven en el WordPress de `WOO_STORE_URL` y se leen **solo en
build** desde la Store API pública (`/wp-json/wc/store/v1/`): no hay claves, ni
proxy, ni fetch a WordPress desde el navegador. Ver `specs/01-catalogo-productos-woo.md`.

- `src/lib/woo/store.ts` descarga, proyecta y sanitiza. Solo sale lo declarado
  en `src/lib/woo/types.ts`; el HTML de las descripciones pasa por una allowlist.
- **Nunca importes `src/lib/woo/store.ts` desde un `.tsx`.** Solo desde páginas
  y componentes `.astro`. El módulo lanza un error si llega al navegador.
- `WOO_STORE_URL` va sin prefijo `PUBLIC_`. Vacía, el catálogo se genera vacío;
  si WordPress no responde, **el build falla** a propósito para no publicar un
  catálogo vacío.
- Las imágenes pasan por `astro:assets` (`image.domains` se deriva de
  `WOO_STORE_URL` en `astro.config.mjs`) y se sirven desde `dist/`.
- Los productos no son componente doble: se editan en Woo, no en Tina.
- **Un cambio en Woo no aparece hasta el siguiente deploy.** Hay que volver a
  desplegar (push o "Redeploy" en Amplify).

Rutas: `/productos`, `/productos/categoria/[slug]` y `/productos/[slug]`.

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

Iconos: `react-icons`. El UI Kit usa **Phosphor Light** (`react-icons/pi`, sufijo
`Light`). Excepciones que entregó diseño: los logos de las redes y de WhatsApp van
con `react-icons/fa6` (las redes se mapean en `src/components/shared/socialLinks.ts`)
y el ícono PDF es `BsFiletypePdf` (`react-icons/bs`). Cuando el
editor elige el ícono en Tina, las opciones están en `src/lib/icons.ts` y se
dibujan con `src/components/shared/Icon.tsx`.

Componentes reutilizables (úsalos antes de escribir uno nuevo):

- `src/hooks/useSlider.ts` — todo slider va con Embla y este hook: sin
  autoplay y con `prefers-reduced-motion`. El teclado se resuelve con las
  flechas y los dots como `<button>`. No escribas un motor de arrastre propio.
- `src/components/shared/PageHero.tsx` — cabecera de página interna con
  breadcrumb.
- `src/components/shared/QuoteModal.tsx` — modal "Solicitar cotización".
- `src/utils/url.ts` (`withBase`) — rutas internas escritas en el código.
- `src/utils/scrollLock.ts` — bloquea y libera el scroll de la página (también
  detiene Lenis, expuesto en `window.lenis`). Úsalo en todo panel o modal a
  pantalla completa.

El header (`Header.astro` + `HeaderReact.tsx`) es sticky y coordina un solo
panel abierto a la vez: `ProductsMegaMenu` (desktop), `SiteMenu` (☰ en desktop
y menú mobile) y `SearchOverlay` (lee `/search-index.json`, que solo tiene
productos de Woo). Las anclas (`[id]`) llevan `scroll-margin-top` para quedar
visibles bajo el header; los heros ya no reservan espacio para él.

**Tema: light.** Los componentes NO escriben colores: piden tokens
semánticos, y por eso el tema se puede cambiar sin tocar una sola clase.

| Token | Para qué | Valor |
|---|---|---|
| `surface` | Fondo de la página | `#FFFFFF` |
| `surface-raised` | Tarjetas | `#F7F7F8` |
| `content` | Texto principal (azul marino de marca) | `#3A4066` |
| `content-muted` | Texto secundario | `#3F3F3F` |
| `content-subtle` | Metadatos | `#717274` |
| `line` | Bordes | `#E5E7EB` |
| `accent` | Marca legible sobre el fondo | `#B8242A` |

`content`, `content-muted` y `content-subtle` cumplen 4.5:1 sobre `surface` y
`surface-raised`, **salvo `content-subtle` sobre `surface-raised` (4.4975:1)**:
no lo uses para texto dentro de tarjetas hasta oscurecerlo. Si cambias
un tono, vuelve a medir.

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

**Tipografías**: Rubik. Escala aprobada: `display`, `heading-h1` → `heading-h4`,
`subtitle`, `body-lg|md|sm`, `caption`, `overline`, `link` y `stat`, en px fijos.
La escala provisional anterior (`heading-xxl` → `caption-sm`) y Space Mono
(`font-mono`) siguen definidas porque hay componentes que todavía las usan; no
forman parte del UI Kit.

**Botones**: variantes `btn-primary`, `btn-secondary`, `btn-inverse` (sobre
fondo oscuro), `btn-link` y `btn-navigation` (el "Contacto" del header,
rectangular). Tamaños `btn-lg` (48px, por defecto), `btn-md` (40px) y `btn-sm`
(32px). Cada variante funciona sin `.btn`. Estados: hover, pressed (`:active`),
disabled (`disabled` o `aria-disabled="true"`) y el focus visible global.

Pendientes de decisión de diseño: el texto blanco sobre `brand-primary-medium`
(`btn-primary`, `btn-navigation`) y el hover de `btn-link` quedan en 4.08:1, y
`btn-sm` mide 32px frente al target táctil de 44×44.


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
