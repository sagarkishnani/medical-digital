# SPEC 02 — Páginas institucionales: Home, Nosotros y Contacto

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-09-29
> **Objective:** Maquetar Home, Nosotros y Contacto según la referencia "Medical Digital Desktop.html", con su contenido editable desde Tina y los formularios maquetados sin envío.

## Scope

**In:**

- Rutas `/` (reemplaza la Home actual), `/nosotros` y `/contacto`, fieles a la referencia en desktop y responsive en 360 / 768 / 1280+ (y 320 px por el estándar). El mobile sigue la referencia "Medical Digital Mobile.html": cambia el layout, no el contenido.
- **Home:** hero en slider (Embla + `useSlider`, sin autoplay), "Equipos más solicitados" (productos destacados de Woo), "Encuentra el equipo según tu especialidad" (categorías de Woo con conteo), bloque "Conoce más" con estadísticas estáticas, franja de logos de marcas estática, testimonios en slider con calificación de Google editable, y los últimos 3 artículos del blog. "Solicitar cotización" abre el modal de la referencia (campos, "Hablar con un asesor" por WhatsApp) maquetado sin envío.
- **Nosotros:** hero con breadcrumb, quiénes somos, visión y misión, valores, y políticas en pestañas accesibles con enlace a un PDF opcional.
- **Contacto:** hero con breadcrumb, formulario de la referencia maquetado sin envío (10 campos con `<label>`, selects de ubicación y especialidad, casilla de consentimiento), datos de sede, teléfono, correos, horario y botón de WhatsApp (en mobile, botones "Llamar" y "WhatsApp" lado a lado y los datos antes del formulario), y mapa de Google embebido con enlace "Cómo llegar".
- **Tina:** schema de `home` reescrito, colecciones nuevas `about` y `contact`, cada una en su archivo de `tina/collections/`, con el patrón de componente doble y una consulta por página.
- Contenido inicial con los textos y las fotos de la referencia como imágenes provisionales (licencia del diseñador, confirmada el 2026-09-30), en `public/uploads/<sección>/`. Cada componente sigue funcionando sin imagen: el hero y los slides muestran el degradado de marca, las fotos un bloque neutro con la misma proporción y las marcas su nombre.
- Se eliminan `Hero`, `Features` y `CTA` de la Home actual.

**Out of scope (for future specs):**

- Envío del formulario de contacto (validación, Turnstile, correo corporativo) y su estado "¡Mensaje enviado!": llegan con la infraestructura de formularios de la tarea "Página de servicio técnico con formulario".
- Header y botón flotante de WhatsApp de la referencia: spec propia del header.
- Footer de la referencia: spec propia, dentro de la tarea "Links legales en el footer".
- Envío del modal de cotización y su estado "¡Solicitud enviada!": llegan con la infraestructura de formularios de la tarea de servicio técnico.
- Resto de páginas de la referencia: Productos y Detalle rediseñados, Marcas, Servicio técnico, Blog y Post.
- Reseñas de Google en vivo: la calificación y los testimonios se editan a mano en Tina.
- Imágenes finales y logos de marcas: los entrega el cliente y se cargan desde Tina.
- Lenis (ver Decisiones).

## Modelo de datos

**Tina `home`, reescrita.** Se reemplazan `hero`, `features` y `cta`; se conserva `seo`.

```ts
// tina/collections/home.ts → src/content/home/index.json
{
  slides: [{ eyebrow, title, text, image, imageAlt, ctaLabel, ctaUrl }],
  featured: { title, linkLabel, limit /* number, por defecto 4 */ },
  specialties: {
    title, linkLabel,
    icons: [{ categorySlug, icon /* opción fija → Phosphor Light */ }], // sin coincidencia = ícono genérico
  },
  about: {
    image, imageAlt, text, buttonLabel, buttonUrl,
    stats: [{ icon, prefix /* "+" opcional */, value, label }],
  },
  brands: [{ name, logo, url }],          // sin logo, se muestra el nombre
  testimonials: {
    title, rating /* 4.9 */, reviewsCount /* 120 */, reviewsUrl,
    items: [{ text, name, role }],        // iniciales derivadas del nombre
  },
  news: { title, linkLabel },             // posts: los 3 más recientes de `post`
  seo: { title, description },
}
```

**Tina `about`, nueva.** Documento único, sin crear ni borrar desde el panel.

```ts
// tina/collections/about.ts → src/content/about/nosotros.json
{
  hero: { title, image },
  intro: { eyebrow, title, paragraphs: string[], image, imageAlt },
  visionMission: { image, imageAlt, visionTitle, vision, missionTitle, mission },
  values: { title, items: [{ icon, name, text }] },
  policies: { title, items: [{ title, intro, points: string[], document /* PDF subido, opcional */ }] },
  seo: { title, description },
}
```

**Tina `contact`, nueva.** Documento único.

```ts
// tina/collections/contact.ts → src/content/contact/contacto.json
{
  hero: { title, image },
  form: {
    title, submitLabel,
    locations: string[],   // opciones de "Ubicación"
    consentLabel, privacyLabel, privacyUrl, // sin URL, el texto va sin enlace
  },
  // Las opciones de "Especialidad" salen de las categorías de Woo, más "Otra".
  map: {
    embedUrl,      // código de Google Maps › Compartir › Insertar un mapa, o solo su src; se usa el src si es de google.com/maps/embed
    directionsUrl, // enlace "Cómo llegar" (Google Maps)
    title,         // título accesible del iframe
  },
  seo: { title, description },
}
```

**Tina `global`, se amplía sin cambiar lo existente.** Los datos de la empresa quedan en un solo lugar para que el footer y el formulario futuros los reutilicen.

```ts
company: { address /* multilínea */, phone, emails: string[], hours }
// whatsapp ya existe en global y se reutiliza
```

**Woo: nueva función en `src/lib/woo/store.ts`.** Los tipos no cambian.

```ts
export function getFeaturedProducts(limit: number): Promise<WooProduct[]>
// GET products?featured=true&per_page={limit}. Proyección igual que getProducts().
```

Convenciones:

- Los íconos se eligen de una lista fija de opciones que el componente traduce a Phosphor Light (`react-icons/pi`). Un valor desconocido no muestra ícono y no rompe el build.
- Las imágenes de Tina pasan por `mediaUrl()` (`src/utils/mediaUrl.ts`).
- Los productos y las categorías llegan a las islas como props desde el `.astro`. Ningún `.tsx` importa `store.ts`.

## Plan de implementación

Cada paso deja el build verde y va en su propio commit.

1. **Slider base.** Agregar `embla-carousel-react` y crear `src/hooks/useSlider.ts`, adaptado de Fiberlux (spec 68): sin autoplay, con flechas y dots accesibles, y respetando `prefers-reduced-motion`.
2. **Datos de empresa.** Agregar `company` al schema de `global` y cargar dirección, teléfono, correos y horario en `src/content/global/`.
3. **Destacados de Woo.** Agregar `getFeaturedProducts(limit)` a `store.ts` y comprobar la respuesta contra el WordPress real.
4. **Home.** Reescribir `tina/collections/home.ts` y `src/content/home/index.json`; crear las secciones con el patrón de componente doble en `src/components/home/` (slider, destacados, especialidades, conoce más, marcas, testimonios, noticias); resolver en `src/pages/index.astro` una sola consulta de Tina más Woo y los posts; borrar `Hero`, `Features` y `CTA` antiguos.
5. **Nosotros.** Crear `tina/collections/about.ts` y registrarlo en `tina/config.ts`; `src/content/about/nosotros.json`; secciones en `src/components/about/`; `src/pages/nosotros.astro`.
6. **Contacto.** Crear `tina/collections/contact.ts` y registrarlo; `src/content/contact/contacto.json`; secciones en `src/components/contact/`; `src/pages/contacto.astro`. Incluye los datos de `global.company`, WhatsApp con `src/utils/whatsapp.ts` y el mapa embebido.
7. **Navegación.** Comprobar que el menú de `global` enlace a `/nosotros` y `/contacto`, y ajustar solo el contenido si hace falta.
8. **Cierre.** `npm run build` y, si existe, `npm run check:standard`; ajustar mobile a "Medical Digital Mobile.html"; QA responsive en 320, 360, 768 y 1280 px con contenido real; actualizar la lista de colecciones del `CLAUDE.md`; agregar a esta spec "Notas de implementación" y "QA realizada".

## Criterios de aceptación

**Build y estándar**

- [ ] `npm run build` termina sin errores.
- [x] `npm run check:standard` pasa, si existe.
- [x] Ningún `.tsx` importa `src/lib/woo/store.ts`.
- [x] Ningún componente nuevo usa hex, `text-[NNpx]` ni `text-white/…` fuera de las excepciones del `CLAUDE.md`.

**Home (`/`)**

- [ ] El slider se mueve con flechas, dots, teclado y arrastre, no tiene autoplay y cada slide enlaza a su CTA.
- [x] "Equipos más solicitados" muestra solo productos con `featured` en Woo, hasta `limit`, y cada tarjeta enlaza a `/productos/[slug]`.
- [x] Sin destacados en Woo, la sección no se renderiza y el build no falla.
- [x] Las especialidades muestran las categorías de Woo con su conteo real y enlazan a `/productos/categoria/[slug]`.
- [x] Las estadísticas, las marcas y los testimonios salen de Tina, y los números aparecen sin animación.
- [ ] Noticias muestra los 3 posts más recientes. Con 0 posts, la sección no se renderiza.
- [x] "Solicitar cotización" abre un `<dialog>` modal con el nombre del producto; se cierra con el botón, con Esc y al pulsar fuera.
- [x] Los campos del modal tienen `<label>` (visualmente oculto) y los obligatorios llevan `required`.
- [x] "Enviar solicitud" no envía datos ni muestra un mensaje de éxito. "Hablar con un asesor" abre WhatsApp con el producto.
- [x] La flecha diagonal de cada tarjeta lleva a la ficha del producto.

**Nosotros (`/nosotros`)**

- [x] Muestra todas las secciones de la referencia.
- [x] Las pestañas de políticas funcionan con teclado y tienen roles ARIA de tabs.
- [ ] El botón "Descargar documento" solo aparece si la política tiene un PDF cargado.

**Contacto (`/contacto`)**

- [x] El formulario tiene los 10 campos de la referencia con `<label>` visible; los campos de datos obligatorios llevan `required` y el asterisco, y la casilla de consentimiento lleva `required`.
- [x] "Enviar" no envía datos ni muestra un mensaje de éxito.
- [x] Sin `privacyUrl`, el texto de la política se muestra sin enlace.
- [x] La dirección, el teléfono, los correos y el horario salen de `global.company`, y WhatsApp usa el número de `global`.
- [x] El iframe del mapa lleva `title`, `loading="lazy"`, `referrerpolicy="strict-origin-when-cross-origin"` y relación de aspecto fija (no mueve el layout al cargar).
- [ ] Si `embedUrl` no empieza por `https://www.google.com/maps/embed`, el iframe no se renderiza y queda solo el enlace "Cómo llegar".

**Tina**

- [ ] Todo el contenido editorial (títulos, textos, listas, enlaces e imágenes) de las tres páginas se edita desde `/admin` con vista previa en vivo. Las etiquetas de interfaz (campos de formulario, botones y rótulos de datos) viven en el código.
- [x] `about` y `contact` no permiten crear ni borrar documentos.

**Responsive y accesibilidad**

- [x] No hay scroll horizontal ni textos cortados o superpuestos en 320, 360, 768 y 1280 px.
- [x] En mobile el layout coincide con "Medical Digital Mobile.html" y el contenido es el mismo que en desktop.
- [x] En mobile, destacados y noticias son carruseles horizontales con scroll nativo (sin JS) y las pestañas de Políticas son píldoras con scroll horizontal.
- [x] Todas las imágenes tienen `width`, `height` y `alt`; las decorativas llevan `alt=""`.
- [x] Sin imagen cargada en Tina, cada sección conserva su layout y muestra su respaldo (degradado de marca, bloque neutro o nombre de la marca).
- [x] Con `prefers-reduced-motion`, los sliders cambian sin transición.
- [x] Hay un solo `h1` por página y los encabezados siguen su orden.

## Decisiones

**Tomadas:**

| Decisión | Por qué |
|---|---|
| Una sola spec para las tres páginas | Es una tarea de maquetación; los formularios tienen su tarea propia ("Página de servicio técnico con formulario"). |
| El formulario de Contacto se maqueta ahora, sin envío | Mismo criterio que el modal de cotización: es parte del diseño aprobado. El estado "¡Mensaje enviado!" no se muestra hasta que el envío sea real. Decisión revisada el 2026-09-30 (antes: Contacto sin formulario). |
| Header y footer quedan fuera, en dos specs separadas | Afectan a todas las páginas, incluido el catálogo publicado. El footer tiene tarea propia y depende de los documentos legales del cliente; el header es interactivo y no debe esperar esos documentos. Mismo criterio que Fiberlux (spec 07 del footer; specs 09, 16 y 33 del header). Ambas tocan `global`, así que van en secuencia. |
| El modal de cotización se maqueta ahora, sin envío | Es parte del diseño aprobado de la tarjeta. "Hablar con un asesor" ya funciona por WhatsApp. El estado "¡Solicitud enviada!" no se muestra hasta que el envío sea real: confirmar un envío que no ocurrió engañaría al cliente. |
| Los destacados salen de la marca "Destacado" de Woo | El cliente los elige donde ya edita los productos, sin enlaces que se rompan al renombrar un producto. |
| Embla con `useSlider` | Patrón probado en Fiberlux (spec 68). Pesa unos 7 KB gzip. |
| Mapa con el iframe oficial "Insertar un mapa" de Google Maps, URL editable en Tina | No necesita clave de API ni facturación. `loading="lazy"` evita cargarlo hasta que se acerca al viewport. Solo se aceptan URLs de `google.com/maps/embed` para que el panel no pueda inyectar un iframe arbitrario. |
| Datos de la empresa en `global.company` | Una sola fuente; el footer y el formulario futuros los reutilizarán. |
| Logos de marcas en franja estática, no en marquee | El estándar (sección 04) prohíbe los carruseles con autoplay, y un marquee lo es. |
| Estadísticas sin count-up | El estándar prohíbe los "contadores que corren solos". |
| Íconos Phosphor Light con `react-icons/pi` | Son los del diseño aprobado y vienen en `react-icons`, que ya está instalado: no suma dependencias. Reemplaza la convención anterior de Font Awesome (`CLAUDE.md` actualizado); WhatsApp sigue con su logo de `fa6`. Sin pulmones en Phosphor, Diagnóstico Respiratorio usa "viento". Revisión del 2026-09-30. |
| Colores de la referencia llevados a tokens | El `CLAUDE.md` y el estándar prohíben hex en los componentes. |
| Tarjetas de destacados sin garantía ni especificación | Esos datos no existen en `WooProduct`. Se agregan cuando Woo los exponga. |
| La tarjeta de destacados sigue la referencia; `ProductCard` del catálogo no se toca | El rediseño del catálogo queda fuera de alcance. |
| Calificación de Google (4.9 · 120) editada a mano en Tina | La API de Places pide clave y facturación: sería un servicio nuevo. |
| Imágenes provisionales del diseño, con respaldo por componente | El diseñador confirmó que las fotos están bajo su licencia y se pueden publicar como provisionales. Así el preview refleja el diseño aprobado; el cliente las reemplaza desde Tina sin tocar código. Si se quita una imagen, la sección conserva su layout (mismo criterio que Fiberlux, spec 24). |
| Opciones de "Especialidad" desde las categorías de Woo | Una lista propia en Tina se desincroniza cuando el cliente agrega o renombra categorías. |
| Etiquetas de interfaz en el código | Campos de formulario, botones y rótulos de datos no son contenido editorial; mismo criterio que la ficha de producto (SPEC 01) y Fiberlux. |
| Mismo contenido en todos los tamaños; solo cambia el layout | El cliente edita un solo texto en Tina. Mismo criterio que Fiberlux (spec 07). Donde la referencia mobile recorta textos (Quiénes somos, opciones de los selects) se mantiene el de desktop; el extracto de las noticias se oculta en mobile por presentación. |
| Botón "Llamar" en mobile | Aparece en la referencia mobile y usa el teléfono de `global.company`: no es contenido nuevo. |
| Solo español | `LOCALES = ["es"]`: no hacen falta rutas `/en`. |

**Descartadas:**

| Alternativa | Por qué no |
|---|---|
| Dividir en Home + Nosotros y Contacto aparte | Sin el envío de formularios, Contacto es solo maquetación. |
| Contacto sin formulario hasta tener el envío | Inconsistente con el modal de cotización, que ya se maquetó sin envío. |
| Imágenes en `public/images/` con rutas relativas (como Fiberlux) | El repo de referencia más reciente del equipo usa `public/uploads/<sección>/` con rutas `/uploads/…`; se sigue esa convención. |
| Imágenes genéricas de relleno en el repo | Archivos que después hay que acordarse de borrar. |
| Textos separados para mobile en Tina | Duplica el contenido que el cliente mantiene y se desincroniza. |
| Header y footer en una sola spec | Tareas, dependencias y riesgos distintos; un PR más grande y con más rondas de revisión. |
| Destacados elegidos en Tina con una lista de slugs | Se rompen si alguien renombra un producto en Woo. |
| Scroll horizontal nativo con `scroll-snap` | Los dots y la accesibilidad habría que hacerlos a mano. |
| Motor de arrastre propio | En Fiberlux, `useDragSlider` pasó por las specs 40 y 62 y se descartó. |
| Lenis | El estándar lo excluye en sitios con catálogo y formularios largos, y figura en "No copiar de Fiberlux". |
| Fachada con imagen y carga del iframe al clic | Un paso extra para el usuario y una imagen más que mantener; con `loading="lazy"` el costo del iframe ya queda fuera de la carga inicial. |
| Maps Embed API (`/maps/embed/v1/place?key=…`) o mapas estáticos | Requieren clave y cuenta de facturación de Google. |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Nadie marcó productos como destacados en Woo, o `featured=true` no filtra como se espera en la Store API. | La sección no se renderiza si viene vacía. Se verifica en el paso 3 contra el WordPress real; si no hay destacados, se pide al cliente que los marque. |
| El modal de cotización y el formulario de Contacto llegan a `main` sin envío. El go-live exige "formularios probados con correo recibido". | El PR lo indica: `staging` no se promueve a `main` hasta que la tarea de formularios conecte el envío. |
| Los testimonios y la calificación "4.9 · 120 reseñas en Google" son de ejemplo del diseño. Publicarlos como reales sería engañoso para los clientes. | Se maquetan tal como están en el diseño. El PR lo indica y el cliente debe reemplazarlos por testimonios y cifras reales desde Tina antes de pasar a `main`. |
| Las imágenes provisionales quedan publicadas en un repo público. | Licencia del diseñador confirmada antes de subirlas. Son WebP de 16–68 KB y se reemplazan por las del cliente desde Tina. |
| Se agregan dos colecciones y cambia `home`; `TINA_BRANCH` se fija en build y el preview puede compilar contra el índice equivocado. | El preview del PR usa la rama real. Sin red, `build:local` y después restaurar `tina/__generated__/` y `tina-lock.json`. |
| Contraste heredado: `btn-primary` en 4.08:1 y `content-subtle` sobre `surface-raised` en 4.4975:1. | No usar `content-subtle` para texto dentro de tarjetas. El contraste de `btn-primary` sigue pendiente de diseño y no se corrige aquí. |
| La referencia mobile llegó después de maquetar desktop. | Se ajusta página por página antes del PR, con capturas en 360 px contra la referencia. |

## Notas de implementación

- Íconos compartidos: `src/lib/icons.ts` (opciones de Tina) y `src/components/shared/Icon.tsx` (traducción a Phosphor Light, `react-icons/pi`).
- `src/components/shared/PageHero.tsx`: cabecera con breadcrumb de Nosotros y Contacto.
- `src/components/shared/QuoteModal.tsx`: modal de cotización con `<dialog>` nativo, reutilizable en las fichas de producto. La línea "Tu solicitud llegará a ventas@…" de la referencia se agrega con el envío real, para no prometer un envío que aún no existe.
- Hidratación: slider con `client:load`; destacados (modal) y testimonios con `client:visible`; Políticas con `client:visible`; el resto con `client:tina` (0 JS en producción).
- Se agregó `specialties.catalogLabel` al modelo de `home` para editar el texto de la tarjeta "Ver todo el catálogo".
- Especialidades en 5 columnas: la tarjeta "Ver todo el catálogo" ocupa una celda y va justo después de la última categoría, sin huecos intermedios; el espacio sobrante queda al final de la fila hasta que Woo tenga más categorías.
- Slides 2 y 3 apuntan a `/contacto` y `/productos`: `/servicio-tecnico` y `/marcas` aún no existen.
- Contacto en la grilla del diseño: formulario (7fr) y datos de la empresa (4fr). El formulario no necesita JS (`client:tina`).
- Revisión del PR (2026-10-02): los botones de WhatsApp de Contacto usan el verde del diseño (`semantics-success`, hover `semantics-success-dark`); los indicadores del slider son barras como en la referencia (10 px inactivo al 45 %, 40 px activo, 8 px de separación); las flechas de testimonios tienen borde visible y ya no se atenúan al desactivarse, para que ambas se vean del mismo tamaño.
- Radios de 48 px del diseño llevados a `2xl` (24 px): el UI Kit no tiene token de 48.
- Mapa: el campo acepta el código completo de Google; `referrerpolicy="strict-origin-when-cross-origin"`, el que entrega Google hoy.
- Rutas internas fijas con `withBase()` (`src/utils/url.ts`) para respetar `BASE_URL`; las URLs que vienen de Tina se usan tal cual, como en el header.
- Estándar aplicado en la revisión final: `duration: 12` en Embla (~210 ms medidos con Playwright) y transiciones de 300 ms como máximo, tarjetas de especialidades con altura mínima (no fija), sliders operables con sus botones (el viewport no recibe foco, como en el patrón de carrusel de WAI-ARIA), `duration` mínimo de Embla también al arrastrar con `prefers-reduced-motion`, `h1` de la Home fijo (`sr-only`, desde el título SEO) en lugar de dentro de un slide que se oculta, datos de Contacto antes del formulario en el DOM, panel de Políticas enfocable, áreas táctiles de 44 px en los dots, `width` y `height` en todas las imágenes, y títulos y descripciones SEO de 50–60 y 140–160 caracteres.
- Imágenes provisionales en `public/uploads/home/`, `uploads/nosotros/` y `uploads/contacto/`: WebP de 1440 px como máximo y 16–68 KB, con nombres descriptivos; en el contenido, rutas `/uploads/…`. La primera diapositiva lleva `fetchPriority="high"` (LCP) y las demás `"low"`.
- Carpetas de componentes en inglés (`about/`, `contact/`), como las colecciones de Tina y el repo de referencia más reciente del equipo.
- Colecciones nuevas en `tina dev`: hay que reiniciar el servidor para que indexe sus documentos.
- **Pendiente para la tarea "Catálogo y detalle de producto":** en la Home "Solicitar cotización" abre el modal; en la ficha de producto (SPEC 01) abre WhatsApp directo. Unificar reutilizando `QuoteModal`.
- **Pendiente de decisión de diseño (UI Kit):** el texto blanco sobre el verde de WhatsApp del diseño (`#37B24D`) queda en 2.5:1, bajo el 4.5:1 de AA; y los indicadores del slider, para igualar la referencia, miden 18–48 px de ancho, menos que el área táctil de 44 × 44 del estándar (las flechas sí cumplen y hacen la misma función). Además, el navy de títulos `#1C2140` se usa como `brand-secondary-dark` porque no hay token semántico para él; y el contraste no textual de los dots inactivos (2.47:1) y de los bordes de campos (`line`, 1.24:1) queda bajo el 3:1 de WCAG 1.4.11. Cambiarlo se aparta del diseño aprobado, igual que el contraste de `btn-primary` que ya figura en `CLAUDE.md`.
- **Pendiente para la tarea "SEO técnico":** el sitio no tiene JSON-LD `Organization` ni `LocalBusiness` (estándar 6.2); los datos ya están en `global.company`.
- **Pendiente para la spec del footer:** el enlace "Contacto" del footer sigue en `/#cta`, que dejó de existir al reemplazar la Home. Se decidió no tocar el footer en esta spec.

## QA realizada

- `astro build` con `WOO_STORE_URL` real, `tsc --noEmit` y `check:standard`: 0 errores (aviso previo: páginas sin `og:image`). JS de la página más pesada: 88 KB gzip.
- Capturas en 320, 360, 768 y 1280 px de `/`, `/nosotros` y `/contacto`: sin cortes ni solapes; el mapa real se muestra.
- Mobile comparado a 360 px contra "Medical Digital Mobile.html" en las tres páginas: carruseles horizontales de destacados y noticias, valores en filas, políticas en píldoras, datos de contacto antes del formulario con "Llamar" y "WhatsApp". Desktop verificado sin cambios.
- Desviación de tipografía en mobile: títulos de 26 px de la referencia llevados a `heading-h3` (24 px); el UI Kit no tiene 26.
- Enlaces internos de las tres páginas: 0 rotos.
- Woo real: 6 destacados y 7 categorías con conteo.
- Contacto con formulario revisado en 1280 px contra la referencia.
- `npm run build:local` (equivalente local de `npm run build`, que necesita TinaCloud): 59 páginas sin errores.
- Pruebas end-to-end con Playwright en 360 y 1280 px (fuera del repo): overflow, `h1`, imágenes, áreas táctiles, consola, slider (~210 ms y con `prefers-reduced-motion`), modal completo, pestañas con teclado, formulario, mapa y orden mobile. Todas pasan.
- Build sin Woo (`WOO_STORE_URL` vacía): compila, `check:standard` sin errores y 77/77 pruebas; destacados y especialidades no se renderizan.
- Hero con las fotos de la referencia: desktop igual a la referencia; en mobile se ajustaron encuadre (`object-center`) y degradado (90 % → 60 % → 35 %) para igualarla. La diferencia restante es el header (transparente sobre el hero; en la referencia es sólido): lo resuelve la spec del header.
- WordPress respondió con timeouts intermitentes en varios builds del 2026-09-30. Reportado para revisarlo fuera de esta spec.
- Sin verificar desde local: arrastre del slider en touch real, sección de noticias con 0 posts, botón de PDF de políticas, mapa con URL inválida, edición en vivo desde `/admin`, `npm run build` con TinaCloud (lo valida el preview de Amplify).
