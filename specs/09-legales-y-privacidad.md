# SPEC 09 — Términos y condiciones y políticas de privacidad

> **Status:** Aprobado
> **Depends on:** SPEC 02 (políticas de Nosotros y formulario de Contacto), SPEC 04 (columna Legales del footer), SPEC 08 (formulario de servicio técnico)
> **Date:** 2026-10-09
> **Objective:** Rehacer `/terminos-y-condiciones` y `/politicas-de-privacidad` con el texto de producción, editables desde Tina, y dejar sin destinos rotos los enlaces legales del sitio.

## Por qué existe esta spec

- Producción (WordPress) tiene dos páginas legales con texto real, y su `page-sitemap.xml` solo lista esas dos. Las URLs ya están indexadas y se conservan.
- En el sitio nuevo ninguna de las dos existe. "Términos y condiciones" del footer da 404, y no hay ningún enlace a la política de privacidad.
- Los formularios de Contacto (SPEC 02) y de Servicio técnico (SPEC 08) muestran "política de datos personales" sin enlace, porque `privacyUrl` está vacío. La Ley 29733 pide que el consentimiento enlace a la política.
- Otros enlaces dan 404 o llevan a un sitio genérico:
  - Homologación (`/homologacion`) y Libro de Reclamaciones (`/libro-de-reclamaciones`) dan 404.
  - "Ver más" del banner de cookies (`/politica-de-cookies`) da 404.
  - Devoluciones y Código de ética llevan a `/nosotros#politicas`, pero no abren su pestaña.
- El revisor decidió que estas páginas las hacemos nosotros con lo que hay en producción. No se crean páginas que producción no tiene.

## Referencia de diseño

La referencia ("Medical Digital Desktop.html" y "Mobile.html") no tiene pantalla de páginas legales. Se reusan los patrones del sitio, como en Eres 13:

- **Cabecera:** `PageHero` con `compact` y breadcrumb "Inicio / {título}". Sin imagen usa el degradado de marca (`bg-gradient-primary`), como las demás páginas internas.
- **Cuerpo:** una columna de lectura, `container-lg` con `max-w-[760px]`, sobre `surface`, con `py-10 md:py-20`.
- **Texto:** el rich text se dibuja con `PostBody` (SPEC 07), así que títulos, párrafos, listas y enlaces tienen el mismo estilo que una noticia.
  - `h2`: `text-heading-h4` → `md:text-heading-h3`.
  - Párrafos y listas: `text-body-md` → `md:text-body-lg`, en `content-muted`.
  - Enlaces: `text-accent`.
- **Última actualización:** línea opcional sobre el cuerpo, en `text-caption text-content-subtle`, con el formato de fecha de noticias ("18 sep 2026").
- **Descarga:** si hay PDF, se muestra el botón "Descargar documento completo" debajo del cuerpo. Es el mismo enlace de `PoliciesReact`, con `BsFiletypePdf` en `text-brand-primary`.

No hay hex nuevos: todo sale de tokens existentes.

## Scope

**In:**

- Colección singleton `legal` (`tina/collections/legal.ts`, `src/content/legal/index.json`) con dos grupos: `terms` y `privacy`.
- Páginas `/terminos-y-condiciones` y `/politicas-de-privacidad`:
  - `PageHero` y cuerpo en rich text;
  - fecha de actualización y PDF, los dos opcionales;
  - SEO propio y JSON-LD `BreadcrumbList`.
- Contenido inicial: el texto de producción palabra por palabra. Solo se corrige la tipografía (comillas y "N.°").
- Footer, columna Legales:
  - se agrega "Políticas de privacidad" → `/politicas-de-privacidad`;
  - se quita "Homologación";
  - "Devoluciones y garantías" y "Código de ética y conducta" abren su pestaña en `/nosotros` (`/nosotros?politica=<slug>#politicas`).
- Políticas de Nosotros: campo `slug` en cada política, y `PoliciesReact` selecciona la pestaña que pide `?politica=`.
- Libro de Reclamaciones: se vacía `global.footer.complaintsBook.url`. El footer ya lo oculta sin URL.
- Banner de cookies: `showMoreUrl` → `/politicas-de-privacidad`.
- Formularios: `privacyUrl` → `/politicas-de-privacidad` en Contacto (`contact`) y en Servicio técnico (`service`).
- `CLAUDE.md`: la colección `legal` y las dos rutas.

**Fuera de alcance (para futuras specs):**

- Páginas que producción no tiene: política de cookies, Devoluciones y garantías, Código de ética, Homologación y Libro de Reclamaciones.
- Libro de Reclamaciones virtual. Es obligatorio en Perú: el cliente debe entregar el enlace del proveedor o pedir una página propia, que depende de la SPEC 12.
- Casilla de consentimiento del modal de cotización (SPEC 12).
- Redacción o revisión legal de los textos.
- Generar los PDF: el campo queda listo, pero sin archivo no se muestra el botón.

## Modelo de datos

### `legal` (nueva, singleton)

`tina/collections/legal.ts` → `src/content/legal/index.json`, con `allowedActions` sin crear ni borrar, como `brandsPage`. Hay dos grupos con la misma forma, `terms` y `privacy`, definidos con un helper `legalDocumentFields` dentro del archivo:

```ts
{
  hero: { title: string; image?: string };   // image opcional: sin ella, degradado de marca
  updatedAt?: string;                          // datetime; vacío → no se muestra la línea
  body: TinaMarkdownContent;                   // rich-text; h2, p, ul, ol, a
  document?: string;                           // PDF opcional; sin él no hay botón
  seo: { title?: string; description?: string };
}
```

- La página consulta la colección una sola vez (`client.queries.legal({ relativePath: "index.json" })`) y elige el grupo.
- Se renderiza en Astro con `PostBody`, que es un componente React sin hidratación, igual que en `/noticias/<slug>`. No hay `useTina` ni isla: la edición en Tina se ve al recargar la vista previa.
- SEO vacío → `{hero.title} | Medical Digital` y la descripción por defecto de `global`.

### Contenido inicial (`src/content/legal/index.json`)

| Grupo | `hero.title` | `seo.title` (car.) | `seo.description` (car.) |
|---|---|---|---|
| `terms` | Términos y condiciones | Términos y condiciones de compra \| Medical Digital (50) | Conoce las condiciones para cotizar y comprar equipos médicos en Medical Digital: proceso de compra, pagos, garantía, servicio técnico y responsabilidades. (155) |
| `privacy` | Políticas de privacidad | Políticas de privacidad y datos personales \| Medical Digital (60) | Cómo Medical Digital recopila, usa y protege tus datos personales según la Ley N.° 29733, y cómo ejercer tus derechos de acceso, rectificación y cancelación. (157) |

- `body` copia producción: la intro, y cada "1. Objeto"… como `h2`, con sus párrafos y listas.
- En Privacidad, `info@medicaldigitalperu.com` es un enlace `mailto:`.
- `updatedAt`, `image` y `document` quedan vacíos.

### `about.policies.items` (se amplía)

```ts
{ name: "slug", label: "Identificador", type: "string",
  description: "Para enlazar la pestaña: /nosotros?politica=<identificador>#politicas. Minúsculas y guiones." }
```

| Política | `slug` |
|---|---|
| Política de calidad | `calidad` |
| Política antisoborno | `antisoborno` |
| Código de ética y conducta | `codigo-de-etica` |
| Devoluciones y garantías | `devoluciones-y-garantias` |

`PoliciesReact` lee `?politica=` al montar. Si coincide con un `slug`, abre esa pestaña. Si no coincide, abre la primera, como hoy. No cambia la URL al cambiar de pestaña.

### Cambios de contenido

| Archivo | Campo | Antes | Después |
|---|---|---|---|
| `global/index.json` | Legales › Devoluciones y garantías | `/nosotros#politicas` | `/nosotros?politica=devoluciones-y-garantias#politicas` |
| `global/index.json` | Legales › Código de ética y conducta | `/nosotros#politicas` | `/nosotros?politica=codigo-de-etica#politicas` |
| `global/index.json` | Legales › Homologación | `/homologacion` | se quita el enlace |
| `global/index.json` | Legales › (nuevo) | — | Políticas de privacidad → `/politicas-de-privacidad` (después de Términos) |
| `global/index.json` | `footer.complaintsBook.url` | `/libro-de-reclamaciones` | `""` |
| `cookie-consent/index.json` | `showMoreUrl` | `/politica-de-cookies` | `/politicas-de-privacidad` |
| `contact/contacto.json` | `form.privacyUrl` | `""` | `/politicas-de-privacidad` |
| `service/*.json` | `form.privacyUrl` | `""` | `/politicas-de-privacidad` |

## Plan de implementación

1. **Schema y contenido.** Crear `tina/collections/legal.ts` y registrarlo en `tina/config.ts`. Crear `src/content/legal/index.json` con el texto de producción de los dos grupos.
   Verificación: `npm run dev` levanta y "Legales" se edita en `/admin`.
2. **Plantilla.** Crear `src/components/legal/LegalPage.astro`. Recibe el grupo y arma:
   - `BaseLayout` con SEO y `BreadcrumbList`;
   - `PageHero compact`;
   - la fecha opcional;
   - `PostBody`;
   - el botón de PDF opcional.
3. **Rutas.** Crear `src/pages/terminos-y-condiciones.astro` y `src/pages/politicas-de-privacidad.astro`. Cada una consulta `legal` y pasa su grupo a `LegalPage`.
   Verificación: las dos rutas responden 200 en `npm run dev`.
4. **Pestañas de Nosotros.**
   - Agregar `slug` a `about.policies.items` en `tina/collections/about.ts` y los cuatro valores en `src/content/about/nosotros.json`.
   - `PoliciesReact` abre la pestaña que pide `?politica=`.
   Verificación: `/nosotros?politica=devoluciones-y-garantias#politicas` baja a Políticas con esa pestaña abierta.
5. **Enlaces.** Aplicar la tabla "Cambios de contenido" en `global`, `cookie-consent`, `contact` y `service`.
   Verificación: el footer no muestra Homologación ni Libro de Reclamaciones, y los formularios enlazan la política.
6. **Documentación.** Sumar `legal` a la lista de colecciones de `CLAUDE.md` y las dos rutas.
7. **Cierre.** Correr `npm run build` y `npm run check:standard`, y completar "Notas de implementación" y "QA realizada".

## Criterios de aceptación

**Páginas**

- [ ] `/terminos-y-condiciones` y `/politicas-de-privacidad` responden 200 y aparecen en `sitemap-*.xml`.
- [ ] Cada página tiene un solo `h1` (el título del hero), y cada sección del texto es un `h2`.
- [ ] El texto coincide con producción: Términos tiene 7 secciones y Privacidad 4, con las mismas listas.
- [ ] En Privacidad, `info@medicaldigitalperu.com` abre el cliente de correo (`mailto:`).
- [ ] El breadcrumb muestra "Inicio / {título}" y el HTML incluye JSON-LD `BreadcrumbList`.
- [ ] `<title>` y `meta description` son los de la tabla de contenido inicial, y el canonical apunta a la URL de la página.
- [ ] Con `updatedAt` vacío no aparece la línea de fecha. Con una fecha, se ve como "18 sep 2026".
- [ ] Sin `document` no hay botón de descarga. Con un PDF cargado, "Descargar documento completo" lo descarga.
- [ ] Las páginas no cargan JS de React fuera del editor de Tina.
- [ ] No hay scroll horizontal en 320, 360, 768, 1024, 1280 ni 1536 px.

**Enlaces**

- [ ] La columna Legales del footer muestra, en orden: Términos y condiciones, Políticas de privacidad, Devoluciones y garantías, y Código de ética y conducta.
- [ ] El footer no muestra Homologación ni Libro de Reclamaciones.
- [ ] "Devoluciones y garantías" lleva a Políticas de `/nosotros` con esa pestaña abierta. "Código de ética y conducta" hace lo mismo con la suya.
- [ ] `/nosotros` sin parámetro, o con un `?politica=` desconocido, abre la primera pestaña.
- [ ] "Ver más" del banner de cookies lleva a `/politicas-de-privacidad`.
- [ ] En Contacto y en Servicio técnico, "política de datos personales" es un enlace a `/politicas-de-privacidad`.
- [ ] Ningún enlace del sitio apunta a `/homologacion`, `/libro-de-reclamaciones` ni `/politica-de-cookies`, y `grep` sobre `src/content` lo confirma.

**Panel y build**

- [ ] En `/admin`, "Legales" no deja crear ni borrar documentos. Editar el texto de Términos y guardar cambia la página.
- [ ] El campo "Identificador" aparece en cada política de Nosotros.
- [ ] `npm run build` y `npm run check:standard` pasan sin errores.

## Decisiones

- **Sí: solo las dos páginas de producción.** Lo pidió el revisor: se rehace lo que existe y no se inventa texto legal.
- **No: páginas de cookies, Devoluciones, Código de ética, Homologación ni Libro de Reclamaciones.** No hay contenido en producción ni del cliente.
- **Sí: URLs planas (`/terminos-y-condiciones`, `/politicas-de-privacidad`).** Son las de producción, ya indexadas, y no hace falta un 301.
- **No: prefijo `/legal/`.** Obligaría a un 301 y no suma nada con dos páginas.
- **Sí: singleton `legal` con un grupo por documento.** Es el patrón de Eres 13 (`systemPages`) y de `brandsPage`, y deja el texto editable desde Tina.
- **No: colección con un documento por página.** Abre "crear documento" en el panel para un caso que el revisor descartó.
- **No: texto fijo en el `.astro`.** El cliente no podría corregirlo.
- **Sí: `PostBody` en Astro, sin isla ni `useTina`.** El texto legal no necesita edición visual en vivo y la página queda sin JS.
- **No: componente doble con `client:tina`.** Suma una isla por dos páginas de texto que se editan pocas veces.
- **Sí: texto de producción tal cual, con solo correcciones tipográficas.** Es texto legal: cambiar la redacción no nos corresponde.
- **Sí: SEO nuevo.** Producción no tiene meta description, y el estándar §6.1 pide 50–60 caracteres de título y 140–160 de descripción.
- **Sí: Devoluciones y Código de ética abren su pestaña con `?politica=<slug>#politicas`.** El parámetro elige la pestaña y el hash hace el scroll al bloque, sin agregar ids nuevos que choquen con `#politicas`.
- **No: hash por pestaña (`#politicas-devoluciones`).** No hay un elemento con ese id, así que el navegador no baja al bloque.
- **Sí: `slug` explícito en cada política.** Derivarlo del título rompería el enlace del footer cada vez que se edite un título.
- **Sí: quitar Homologación y vaciar la URL del Libro de Reclamaciones.** Un enlace a un 404 se ve peor que no tener el enlace.
- **No: página "Próximamente".** Publica una promesa sin fecha.
- **Sí: "Ver más" de cookies → Políticas de privacidad.** Es lo más cercano que existe.
- **Sí: "Políticas de privacidad" en la columna Legales.** Ningún enlace del sitio llevaba a esa página.
- **Sí: campos `updatedAt` y `document` opcionales.** Cubren "descargables" de la tarea sin inventar un PDF. Sin datos, no se muestran.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El Libro de Reclamaciones es obligatorio en Perú (Código de Protección al Consumidor) y queda sin enlace. | Es temporal y se avisa en el PR. El campo `complaintsBook` sigue en Tina: el enlace vuelve en cuanto el cliente entregue la URL del proveedor. |
| La política de privacidad de producción no habla de cookies, y "Ver más" del banner lleva ahí. | Es el destino más cercano que existe. Se avisa en el PR para que el cliente decida si suma una sección de cookies al texto. |
| Los textos de producción pueden estar desactualizados. | El revisor los dio por válidos. Se pueden editar desde Tina sin tocar código. |
| Un editor cambia el `slug` de una política y el enlace del footer deja de abrir su pestaña. | La página abre la primera pestaña en vez de fallar. La descripción del campo explica para qué sirve. |
| `PoliciesReact` hidrata con `client:visible`, así que la pestaña elegida aparece cuando el bloque entra en pantalla. | El hash `#politicas` hace el scroll primero y la isla se hidrata al llegar. La primera pestaña puede verse un instante; se valida en QA en mobile. |

## Lo que **no** entra en esta spec

- Páginas de cookies, Devoluciones y garantías, Código de ética, Homologación y Libro de Reclamaciones.
- Libro de Reclamaciones virtual o con formulario (necesita la SPEC 12 o el proveedor del cliente).
- Casilla de consentimiento del modal de cotización (SPEC 12).
- Redacción o revisión legal, y la generación de los PDF.

Cada una, si llega, va en su propia spec.
