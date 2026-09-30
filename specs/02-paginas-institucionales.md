# SPEC 02 — Páginas institucionales: Home, Nosotros y Contacto

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-09-29
> **Objective:** Maquetar Home, Nosotros y Contacto según la referencia "Medical Digital Desktop.html", con su contenido editable desde Tina y los formularios maquetados sin envío.

## Scope

**In:**

- Rutas `/` (reemplaza la Home actual), `/nosotros` y `/contacto`, fieles a la referencia en desktop y responsive en 360 / 768 / 1280+ (y 320 px por el estándar). El mobile sigue el Figma cuando llegue.
- **Home:** hero en slider (Embla + `useSlider`, sin autoplay), "Equipos más solicitados" (productos destacados de Woo), "Encuentra el equipo según tu especialidad" (categorías de Woo con conteo), bloque "Conoce más" con estadísticas estáticas, franja de logos de marcas estática, testimonios en slider con calificación de Google editable, y los últimos 3 artículos del blog. "Solicitar cotización" abre el modal de la referencia (campos, "Hablar con un asesor" por WhatsApp) maquetado sin envío.
- **Nosotros:** hero con breadcrumb, quiénes somos, visión y misión, valores, y políticas en pestañas accesibles con enlace a un PDF opcional.
- **Contacto:** hero con breadcrumb, formulario de la referencia maquetado sin envío (10 campos con `<label>`, selects de ubicación y especialidad, casilla de consentimiento), datos de sede, teléfono, correos, horario y botón de WhatsApp, y mapa de Google embebido con enlace "Cómo llegar".
- **Tina:** schema de `home` reescrito, colecciones nuevas `about` y `contact`, cada una en su archivo de `tina/collections/`, con el patrón de componente doble y una consulta por página.
- Contenido inicial solo con los textos de la referencia. Cada componente funciona sin imagen: el hero y los slides muestran el degradado de marca, las fotos un bloque neutro con la misma proporción y las marcas su nombre.
- Se eliminan `Hero`, `Features` y `CTA` de la Home actual.

**Out of scope (for future specs):**

- Envío del formulario de contacto (validación, Turnstile, correo corporativo) y su estado "¡Mensaje enviado!": llegan con la infraestructura de formularios de la tarea "Página de servicio técnico con formulario".
- Header y botón flotante de WhatsApp de la referencia: spec propia del header.
- Footer de la referencia: spec propia, dentro de la tarea "Links legales en el footer".
- Envío del modal de cotización y su estado "¡Solicitud enviada!": llegan con la infraestructura de formularios de la tarea de servicio técnico.
- Resto de páginas de la referencia: Productos y Detalle rediseñados, Marcas, Servicio técnico, Blog y Post.
- Reseñas de Google en vivo: la calificación y los testimonios se editan a mano en Tina.
- Imágenes finales: las entrega el cliente y se cargan desde Tina.
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
    icons: [{ categorySlug, icon /* opción fija → fa6 */ }], // sin coincidencia = ícono genérico
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
  visionMission: { image, imageAlt, vision, mission },
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
    specialties: string[], // opciones de "Especialidad"
    consentLabel, privacyLabel, privacyUrl, // sin URL, el texto va sin enlace
  },
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

- Los íconos se eligen de una lista fija de opciones que el componente traduce a `react-icons/fa6`. Un valor desconocido no muestra ícono y no rompe el build.
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
8. **Cierre.** `npm run build` y, si existe, `npm run check:standard`; ajustar mobile al Figma; QA responsive en 320, 360, 768 y 1280 px con contenido real; actualizar la lista de colecciones del `CLAUDE.md`; agregar a esta spec "Notas de implementación" y "QA realizada".

## Criterios de aceptación

**Build y estándar**

- [ ] `npm run build` termina sin errores.
- [ ] `npm run check:standard` pasa, si existe.
- [ ] Ningún `.tsx` importa `src/lib/woo/store.ts`.
- [ ] Ningún componente nuevo usa hex, `text-[NNpx]` ni `text-white/…` fuera de las excepciones del `CLAUDE.md`.

**Home (`/`)**

- [ ] El slider se mueve con flechas, dots, teclado y arrastre, no tiene autoplay y cada slide enlaza a su CTA.
- [ ] "Equipos más solicitados" muestra solo productos con `featured` en Woo, hasta `limit`, y cada tarjeta enlaza a `/productos/[slug]`.
- [ ] Sin destacados en Woo, la sección no se renderiza y el build no falla.
- [ ] Las especialidades muestran las categorías de Woo con su conteo real y enlazan a `/productos/categoria/[slug]`.
- [ ] Las estadísticas, las marcas y los testimonios salen de Tina, y los números aparecen sin animación.
- [ ] Noticias muestra los 3 posts más recientes. Con 0 posts, la sección no se renderiza.
- [ ] "Solicitar cotización" abre un `<dialog>` modal con el nombre del producto; se cierra con el botón, con Esc y al pulsar fuera.
- [ ] Los campos del modal tienen `<label>` (visualmente oculto) y los obligatorios llevan `required`.
- [ ] "Enviar solicitud" no envía datos ni muestra un mensaje de éxito. "Hablar con un asesor" abre WhatsApp con el producto.
- [ ] La flecha diagonal de cada tarjeta lleva a la ficha del producto.

**Nosotros (`/nosotros`)**

- [ ] Muestra todas las secciones de la referencia.
- [ ] Las pestañas de políticas funcionan con teclado y tienen roles ARIA de tabs.
- [ ] El botón "Descargar documento" solo aparece si la política tiene un PDF cargado.

**Contacto (`/contacto`)**

- [ ] El formulario tiene los 10 campos de la referencia con `<label>` visible; los obligatorios llevan `required` y el asterisco.
- [ ] "Enviar" no envía datos ni muestra un mensaje de éxito.
- [ ] Sin `privacyUrl`, el texto de la política se muestra sin enlace.
- [ ] La dirección, el teléfono, los correos y el horario salen de `global.company`, y WhatsApp usa el número de `global`.
- [ ] El iframe del mapa lleva `title`, `loading="lazy"`, `referrerpolicy="strict-origin-when-cross-origin"` y relación de aspecto fija (no mueve el layout al cargar).
- [ ] Si `embedUrl` no empieza por `https://www.google.com/maps/embed`, el iframe no se renderiza y queda solo el enlace "Cómo llegar".

**Tina**

- [ ] Todos los textos e imágenes de las tres páginas se editan desde `/admin` con vista previa en vivo.
- [ ] `about` y `contact` no permiten crear ni borrar documentos.

**Responsive y accesibilidad**

- [ ] No hay scroll horizontal ni textos cortados o superpuestos en 320, 360, 768 y 1280 px.
- [ ] En mobile coincide con el Figma aprobado.
- [ ] Todas las imágenes tienen `width`, `height` y `alt`; las decorativas llevan `alt=""`.
- [ ] Sin imagen cargada en Tina, cada sección conserva su layout y muestra su respaldo (degradado de marca, bloque neutro o nombre de la marca).
- [ ] Con `prefers-reduced-motion`, los sliders cambian sin transición.
- [ ] Hay un solo `h1` por página y los encabezados siguen su orden.

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
| Íconos de `react-icons/fa6`, no Phosphor | Es la librería del proyecto y evita una dependencia más. |
| Colores de la referencia llevados a tokens | El `CLAUDE.md` y el estándar prohíben hex en los componentes. |
| Tarjetas de destacados sin garantía ni especificación | Esos datos no existen en `WooProduct`. Se agregan cuando Woo los exponga. |
| La tarjeta de destacados sigue la referencia; `ProductCard` del catálogo no se toca | El rediseño del catálogo queda fuera de alcance. |
| Calificación de Google (4.9 · 120) editada a mano en Tina | La API de Places pide clave y facturación: sería un servicio nuevo. |
| Sin imágenes iniciales; respaldo por componente | La licencia de las fotos de la referencia está por definir con el cliente. Mismo criterio que Fiberlux (spec 24: respaldo cuando falta la imagen). Para ver el aspecto final se pueden subir fotos de licencia libre desde Tina, sin tocar código. |
| Solo español | `LOCALES = ["es"]`: no hacen falta rutas `/en`. |

**Descartadas:**

| Alternativa | Por qué no |
|---|---|
| Dividir en Home + Nosotros y Contacto aparte | Sin formulario, Contacto es solo maquetación. |
| Contacto sin formulario hasta tener el envío | Inconsistente con el modal de cotización, que ya se maquetó sin envío. |
| Commitear las fotos de la referencia | Licencia sin definir con el cliente. |
| Imágenes genéricas de relleno en el repo | Archivos que después hay que acordarse de borrar. |
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
| El cliente tarda en entregar las imágenes y el sitio se ve sin fotos. | El respaldo mantiene el layout. Mientras tanto se pueden subir fotos de licencia libre desde Tina. |
| Se agregan dos colecciones y cambia `home`; `TINA_BRANCH` se fija en build y el preview puede compilar contra el índice equivocado. | El preview del PR usa la rama real. Sin red, `build:local` y después restaurar `tina/__generated__/` y `tina-lock.json`. |
| Contraste heredado: `btn-primary` en 4.08:1 y `content-subtle` sobre `surface-raised` en 4.4975:1. | No usar `content-subtle` para texto dentro de tarjetas. El contraste de `btn-primary` sigue pendiente de diseño y no se corrige aquí. |
| El Figma mobile llega después de empezar a maquetar. | Maquetar mobile-first con el estándar y ajustar al Figma antes del PR. Adjuntar capturas en 360, 768 y 1280 px. |

## Notas de implementación

- Íconos compartidos: `src/lib/icons.ts` (opciones de Tina) y `src/components/shared/Icon.tsx` (traducción a `react-icons/fa6`).
- `src/components/shared/PageHero.tsx`: cabecera con breadcrumb de Nosotros y Contacto.
- `src/components/shared/QuoteModal.tsx`: modal de cotización con `<dialog>` nativo, reutilizable en las fichas de producto.
- Hidratación: slider con `client:load`; destacados (modal) y testimonios con `client:visible`; Políticas con `client:visible`; el resto con `client:tina` (0 JS en producción).
- Se agregó `specialties.catalogLabel` al modelo de `home` para editar el texto de la tarjeta "Ver todo el catálogo".
- Especialidades en 5 columnas: la tarjeta "Ver todo el catálogo" ocupa las columnas que sobran según cuántas categorías tenga Woo.
- Slides 2 y 3 apuntan a `/contacto` y `/productos`: `/servicio-tecnico` y `/marcas` aún no existen.
- Contacto en la grilla del diseño: formulario (7fr) y datos de la empresa (4fr). El formulario no necesita JS (`client:tina`).
- Botón "Escríbenos por WhatsApp" con `semantics-success-dark`: el verde del diseño con texto blanco queda en 2.5:1.
- Radios de 48 px del diseño llevados a `2xl` (24 px): el UI Kit no tiene token de 48.
- Mapa: el campo acepta el código completo de Google; `referrerpolicy="strict-origin-when-cross-origin"`, el que entrega Google hoy.
- Colecciones nuevas en `tina dev`: hay que reiniciar el servidor para que indexe sus documentos.
- **Pendiente para la spec del footer:** el enlace "Contacto" del footer sigue en `/#cta`, que dejó de existir al reemplazar la Home. Se decidió no tocar el footer en esta spec.

## QA realizada

- `astro build` con `WOO_STORE_URL` real, `tsc --noEmit` y `check:standard`: 0 errores (aviso previo: páginas sin `og:image`). JS de la página más pesada: 88 KB gzip.
- Capturas en 320, 360, 768 y 1280 px de `/`, `/nosotros` y `/contacto`: sin cortes ni solapes; el mapa real se muestra.
- Enlaces internos de las tres páginas: 0 rotos.
- Woo real: 6 destacados y 7 categorías con conteo.
- Contacto con formulario revisado en 1280 px contra la referencia.
- Pendiente de revisión manual en navegador: modal de cotización (abrir, cerrar con X, Esc y clic fuera), pestañas de Políticas con teclado, y `npm run build` completo con el dev server detenido.
