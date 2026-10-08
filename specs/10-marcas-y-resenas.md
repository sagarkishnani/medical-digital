# SPEC 10 — Marcas y reseñas

> **Status:** Aprobada
> **Depends on:** SPEC 02 (marcas y testimonios de la Home), SPEC 05 (filtro `?marca=` del catálogo), SPEC 07 (prop `jsonLd` de `BaseLayout`)
> **Date:** 2026-10-08
> **Objective:** Crear `/marcas` según la pantalla "Marcas y reseñas" de la referencia, reutilizando las marcas y los testimonios que ya edita la Home.

## Por qué existe esta spec

- La columna "Medical Digital" del footer ya enlaza a "Marcas y reseñas" → `/marcas`, y la ruta no existe: hoy es un 404 visible desde todo el sitio.
- Producción (WordPress) tiene `/marcas/` con una descripción por marca y "Ver productos". La URL se conserva.
- La referencia ("Medical Digital Desktop.html" y "Mobile.html", pantalla `isMarcas`) define cuatro bloques: hero con breadcrumb, franja de logos, "Nuestras marcas" (tarjeta por marca) y reseñas.
- La Home ya tiene `home.brands` (13 marcas con logo) y `home.testimonials`. Esta spec no los duplica: Eres resolvió lo mismo en Nosotras (su SPEC 06) leyendo `home.pillars` desde la página interna.

## Referencia de diseño

Breakpoints del estándar: 320 / 360 base, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

### Hex del bundle → Token

| Hex | Uso en la referencia | Token |
|---|---|---|
| `#1C2140` | Fondo del hero, texto principal | `bg-gradient-primary` (PageHero), `text-content` |
| `rgba(28,33,64,.92 → .1)` | Degradado sobre la foto | `bg-gradient-overlay` (PageHero) |
| `#B3C3E3` | Breadcrumb | `text-brand-tertiary-light` (PageHero) |
| `#E5E7EB` | Bordes de la franja y las tarjetas | `border-line` |
| `#3F3F3F` | Descripción de la marca | `text-content-muted` |
| `#E83C3E` | Hover de "Ver productos" | `btn-link` (hover `brand-primary-medium`) |
| `#F4F5F8` | Fondo de reseñas | `bg-surface-raised` (TestimonialsReact) |

### Bloques

| Bloque | Desktop | Mobile | Implementación |
|---|---|---|---|
| Hero | 420 px, foto con degradado navy, H1 56 px | 340 px, H1 32 px | `PageHero` sin cambios (420 / 260 px, igual que Nosotros y Contacto) |
| Franja de logos | Marquee, logos 180×64, gap 72 | Marquee, 130×48, gap 40 | `BrandsReact` sin cambios: franja estática |
| Nuestras marcas | H2 40 px; grilla de 3 columnas, gap 20; tarjeta con borde, radio 24, padding 28, logo de 44 px de alto, texto 15 px | H2 26 px; una columna, gap 14; radio 20, padding 22, logo de 36 px, texto 14 px | Componente nuevo `BrandGrid` |
| Reseñas | Fondo gris, título, 4.9 · 120 reseñas, flechas, 3 tarjetas | 1 tarjeta, dots | `TestimonialsReact` sin cambios |

Tarjeta de marca, en clases: `rounded-2xl border border-line p-[22px] md:p-7`, `flex flex-col gap-3.5 md:gap-5`. Logo en un contenedor `h-11 md:h-14` con `max-h-9 md:max-h-11 max-w-[160px] md:max-w-[180px] object-contain mix-blend-multiply`; sin logo, el nombre en `text-heading-h4 font-semibold`. Descripción en `text-body-md text-content-muted flex-1`. Enlace `btn-link`. Grilla `grid gap-3.5 md:grid-cols-2 md:gap-5 lg:grid-cols-3`.

## Scope

**In:**

- Ruta `/marcas` con hero, franja de logos, "Nuestras marcas" y reseñas, fiel a la referencia en desktop y mobile.
- Colección nueva `brandsPage` (documento único `src/content/marcas/marcas.json`): SEO, hero, título y texto del enlace de la grilla, e interruptores por bloque.
- `home.brands` gana `slug` y `desc`. Las marcas y los testimonios se siguen editando en la Home y se muestran en las dos páginas.
- "Ver productos" lleva a `/productos?marca=<slug>` solo si la marca tiene productos en Woo en el build.
- Descripciones iniciales condensadas desde `/marcas/` de producción.
- Foto del hero extraída de la referencia como contenido provisional.
- JSON-LD `BreadcrumbList`.

**Fuera de alcance (para futuras specs):**

- Página individual por marca (`/marcas/<slug>`).
- 301 desde `/marca/<slug>/` de WordPress a `/productos?marca=<slug>`: va en la SPEC 13.
- Reseñas de Google por API: se editan a mano, como en la SPEC 02.
- Marquee animado.

## Modelo de datos

### `home.brands` (se amplía)

```ts
// tina/collections/home.ts
brands: [{
  name,     // existente
  logo,     // existente
  url,      // existente: enlace externo opcional de la franja
  slug,     // nuevo: slug de la marca en WooCommerce ("track-master")
  desc,     // nuevo: textarea, se muestra en /marcas
}]
```

- La etiqueta del grupo pasa a "Marcas (se muestran en la Home y en /marcas)".
- `slug` lleva la descripción "Slug de la marca en WooCommerce. Vacío o sin productos: no se muestra «Ver productos»." y valida el formato `^[a-z0-9-]+$`.

### `brandsPage` (nueva)

```ts
// tina/collections/brandsPage.ts → src/content/marcas/marcas.json
{
  hero: { title, image },
  logos: { enabled },                     // franja de logos
  brands: { enabled, title, linkLabel },  // "Nuestras marcas", "Ver productos"
  testimonials: { enabled },
  seo: { title, description },
}
```

`ui.allowedActions: { create: false, delete: false }`, como `about` y `contact`.

### Contenido inicial

`src/content/marcas/marcas.json`:

```json
{
  "hero": {
    "title": "Marcas aliadas que respaldan cada equipo",
    "image": "/uploads/marcas/hero-marcas-alianza.webp"
  },
  "logos": { "enabled": true },
  "brands": { "enabled": true, "title": "Nuestras marcas", "linkLabel": "Ver productos" },
  "testimonials": { "enabled": true },
  "seo": {
    "title": "Marcas aliadas de equipos médicos | Medical Digital",
    "description": "Conoce las marcas de equipos médicos que Medical Digital representa en Perú: Schiller, Baxter, Edan, Bovie, Merivaara y más, con respaldo y servicio técnico."
  }
}
```

`slug` y `desc` en `src/content/home/index.json`, en el orden actual de la Home. Los slugs se verificaron contra la Store API de producción el 2026-10-08 (`/wp-json/wc/store/v1/products/brands`):

| Marca | `slug` | Productos | `desc` |
|---|---|---|---|
| Schiller | `schiller` | 27 | Compañía suiza fundada en 1974, líder en diagnóstico cardiopulmonar, desfibrilación, monitoreo de pacientes y software clínico. Comenzó con un electrocardiógrafo de bolsillo para emergencias. |
| Bovie | `bovie` | 2 | Empresa estadounidense especializada en electrocirugía desde 1982. Desarrolla generadores electroquirúrgicos, accesorios y tecnología avanzada como J-Plasma para clínicas y hospitales de todo el mundo. |
| Merivaara | `merivaara` | 3 | Fundada en 1901, es referente en diseño industrial y tecnología para la atención médica. Sus soluciones para salas de cirugía mejoran la seguridad del paciente y la eficiencia de cada operación. |
| Health o meter | `health-o-meter` | 2 | Con orígenes en 1919, creó la primera balanza de platina para médicos. Desde hace más de un siglo lidera el mercado de básculas médicas profesionales en Norteamérica. |
| Ganshorn | `ganshorn` | 0 | Empresa alemana especializada en función pulmonar desde 1982: espirómetros, pletismógrafos corporales y ergoespirometría con tecnología Made in Germany. Forma parte del Grupo Schiller desde 2014. |
| Midmark | `midmark` | 1 | Empresa estadounidense fundada en 1915 que fabrica productos médicos, dentales y veterinarios, y ofrece los servicios relacionados. |
| Edan | `edan` | 2 | Fabricante de dispositivos médicos fundado en 1995, con soluciones de monitoreo, diagnóstico, imagenología, ultrasonido y pruebas en el punto de atención presentes en más de 170 países. |
| Baxter | `baxter` | 3 | Empresa global de tecnología médica fundada en 1931 en Estados Unidos. Desarrolla soluciones en diálisis, terapias intravenosas, nutrición clínica, anestesia y productos quirúrgicos en más de 100 países. |
| Beacon | `beacon` | 1 | Compañía global especializada en equipos de imagen médica usados: resonancia, PET/CT, tomografía, rayos X, ultrasonido y mamografía. Ofrece evaluación, venta, instalación y logística. |
| Jansen | `jansen` | 1 | Empresa europea que desde 1971 diseña y fabrica muebles modulares, carros, soportes y sistemas a medida para equipos médicos en salas de tratamiento y quirófanos. |
| Medicapture | `medicapture` | 1 | Empresa estadounidense fundada en 2002, especializada en grabadoras de video médico HD y 4K para endoscopia, laparoscopia y cirugía general, integradas a los sistemas hospitalarios. |
| Trackmaster | `track-master` | 0 | Fabricante estadounidense de cintas para pruebas médicas y rehabilitación cardiovascular desde 1983. Sus equipos, precisos y silenciosos, cumplen las normas ISO 13485, FDA, CE y CSA. |
| Vivachek | `vivachek` | 2 | Empresa china fundada en 2013, especializada en diagnóstico clínico inmediato (POCT): monitoreo de glucosa, pruebas rápidas y analizadores de orina, con distribución en más de 120 países. |

Ganshorn y Trackmaster no aparecen en la Store API: no tienen productos publicados.

## Plan de implementación

1. **Schema de `home`.** Agregar `slug` y `desc` a `brands` y cambiar la etiqueta. Sembrar la tabla anterior en `src/content/home/index.json`. Verificación: `npm run dev` levanta y los campos se editan en `/admin` → Home → Marcas.
2. **Colección `brandsPage`.** Crear `tina/collections/brandsPage.ts`, registrarla en `tina/config.ts` y crear `src/content/marcas/marcas.json`. Verificación: aparece "Marcas y reseñas" en `/admin` y no se puede crear ni borrar.
3. **Foto del hero.** `public/uploads/marcas/hero-marcas-alianza.webp` (1440×309, 21 KB), ya extraída del bundle.
4. **Conteo por marca.** En `src/pages/marcas.astro`, `getProducts()` y un `Record<string, number>` por `brandSlug`. Si un `slug` de Tina no tiene productos, `console.warn` en el build con el nombre de la marca; el build no falla.
5. **Hero.** `src/components/marcas/BrandsHero.astro` + `BrandsHeroReact.tsx` (`client:tina`) con `PageHero` y breadcrumb "Marcas y reseñas", igual que `AboutHero`.
6. **Grilla.** `src/components/marcas/BrandGrid.astro` + `BrandGridReact.tsx` (`client:tina`). Recibe la sección de `brandsPage`, la de `home` y `productCounts`; usa `useTina` para cada una. "Ver productos" es un `<a class="btn-link">` a `withBase("/productos?marca=<slug>")`, con un `<span class="sr-only">` "de {marca}" para que cada enlace tenga nombre único. Sin productos, el enlace no se renderiza. Sin marcas con nombre, `<div hidden />`.
7. **Página.** `src/pages/marcas.astro`: consulta `brandsPage` y `home`, monta `BrandsHero`, `Brands` (si `logos.enabled`), `BrandGrid` (si `brands.enabled`) y `Testimonials` (si `testimonials.enabled`), y pasa `seo` y el `jsonLd` de `BreadcrumbList` (Inicio → Marcas y reseñas) a `BaseLayout`.
8. **Build y QA.** `npm run build`, revisión en 320, 360, 768, 1024, 1280 y 1536 px, y Safari en iPhone mediante el preview de Amplify.

## Criterios de aceptación

- [ ] `/marcas` responde 200, y el enlace "Marcas y reseñas" del footer lleva ahí.
- [ ] Hay un solo `<h1>`: "Marcas aliadas que respaldan cada equipo". El breadcrumb dice "Inicio / Marcas y reseñas".
- [ ] La franja de logos es la misma de la Home y no se mueve.
- [ ] "Nuestras marcas" muestra las 13 marcas en el orden de `home.brands`: 3 columnas desde `lg`, 2 en `md` y 1 en mobile, sin scroll horizontal en 320 px.
- [ ] Ganshorn y Trackmaster no muestran "Ver productos". Las otras 11 enlazan a `/productos?marca=<slug>`, y el catálogo abre con esa marca filtrada y al menos un producto.
- [ ] Cada "Ver productos" tiene nombre accesible único ("Ver productos de Schiller").
- [ ] Un cambio en `desc` o en el logo desde Home → Marcas se ve en `/` y en `/marcas`.
- [ ] Con `brands.enabled`, `logos.enabled` o `testimonials.enabled` en `false`, ese bloque no está en el HTML.
- [ ] Una marca sin logo muestra su nombre, y el hero sin imagen muestra el degradado de marca.
- [ ] El `<title>` mide entre 50 y 60 caracteres, la description entre 140 y 160, y hay canonical.
- [ ] El HTML trae un JSON-LD `BreadcrumbList` válido en el Rich Results Test, y ningún `aggregateRating`.
- [ ] En producción, `/marcas` no carga React para el hero ni la grilla (`client:tina`). Solo hidrata el slider de testimonios.
- [ ] `npm run build` pasa, y avisa con un warning por Ganshorn y Trackmaster.
- [ ] Ningún componente nuevo escribe hex ni `text-white/…` fuera del hero.

## Decisiones

- **Sí: colección `brandsPage` y marcas y testimonios leídos de `home`.** Elección del usuario. Es el patrón de Eres 06 (Nosotras lee `home.pillars`): cada dato se edita en un solo lugar y `global` no crece.
- **Sí: dos consultas en la página (`brandsPage` y `home`).** Medical ya lo hace (Contacto consulta `contact` y `global`, y la Home tres). Duplicar los datos para ahorrar una consulta en build no compensa.
- **No: mover las marcas a `global`.** Eres evita meter contenido de páginas en `global` (SPEC 11, "para que `global` no crezca").
- **No: una colección con un documento por marca.** Para 13 marcas es más trabajo en el panel y en el código, sin ganar nada concreto.
- **Sí: `slug` editable en vez de derivarlo del nombre.** "Trackmaster" daría `trackmaster`, y en Woo es `track-master`.
- **Sí: ocultar "Ver productos" sin productos.** Elección del usuario. La referencia lleva al catálogo sin filtro, y eso muestra otras marcas. El enlace aparece solo en el siguiente deploy después de cargar productos en Woo.
- **Sí: franja de logos estática, reutilizando `BrandsReact`.** Elección del usuario. Es lo que decidió la SPEC 02: el estándar (§4) prohíbe el autoplay, y un marquee lo es.
- **Sí: `PageHero` sin cambios.** En mobile mide 260 px y no 340 como la referencia, pero así queda igual que Nosotros y Contacto.
- **Sí: descripciones condensadas desde producción.** Elección del usuario. Los textos de la referencia solo cubren 7 de las 13 marcas e incluyen marcas que no están (Welch Allyn, Suntech). Los de producción miden hasta unas 90 palabras y dejarían tarjetas desparejas. Se condensan a 1–2 frases sin agregar datos y con las erratas corregidas ("doctorados", "electrosquirúrgicos"). Es contenido inicial: el cliente lo valida y lo edita en Tina.
- **No: `line-clamp` en la descripción.** Oculta contenido.
- **Sí: foto del hero de la referencia como provisional.** Elección del usuario, como la foto de Nosotras en Eres 06.
- **Sí: JSON-LD solo `BreadcrumbList`.** El estándar (§6.2) no pide `Brand` ni `ItemList`, y Eres solo agrega JSON-LD cuando habilita un resultado enriquecido. `Organization` ya lo emite `BaseLayout`.
- **No: `aggregateRating` con las reseñas.** Google no lo admite para reseñas publicadas por el propio negocio.
- **Sí: `client:tina` en el hero y la grilla.** No tienen interacción, así que en producción no cargan React (estándar §5).

## Riesgos

- **La foto del hero mide 1440×309** y el hero 420 px de alto en desktop: se amplía un 36 % y puede verse blanda. Pedir la original o una del cliente de al menos 1440×600.
- **Depende de la SPEC 07** para la prop `jsonLd` de `BaseLayout`. Si la 07 no está mergeada al implementar, rebasar sobre `staging` cuando lo esté.
- **Los slugs pueden cambiar en Woo.** Un slug que deja de coincidir solo oculta el enlace; el warning del build lo avisa.
- **Las descripciones condensadas** son una redacción nuestra sobre textos del cliente: requieren su visto bueno.
- **Trackmaster:** la Home dice "Trackmaster" y producción "Track master". Se mantiene el nombre de la Home.

## Notas de implementación / QA realizada

_Se completa al terminar._
