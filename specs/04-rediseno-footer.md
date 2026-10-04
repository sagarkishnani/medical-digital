# SPEC 04 — Rediseño del footer

> **Status:** Aprobado
> **Depends on:** SPEC 02, SPEC 03
> **Date:** 2026-10-03
> **Objective:** Reemplazar el footer del starter por el de la referencia (desktop y mobile) —banner del catálogo, columnas Productos / Medical Digital / Legales / contacto, certificaciones, Libro de Reclamaciones y crédito—, editable desde Tina.

## Por qué existe esta spec

El footer actual viene del starter:

- es claro (`bg-surface-raised`), con el nombre en texto en lugar del logo;
- tiene una sola columna ("Sitio") y su enlace "Contacto" apunta a `/#cta`, que dejó de existir con la Home de SPEC 02;
- no muestra los datos de la empresa, el catálogo, los enlaces legales ni el Libro de Reclamaciones, obligatorio en Perú;
- sus redes usan `react-icons/fa6`, mientras el header ya usa los logos de Phosphor (SPEC 03).

La referencia (`Medical Digital Desktop.html` y `Medical Digital Mobile.html`) define un footer navy oscuro con el banner del catálogo PDF, cuatro columnas, una franja de certificaciones con el Libro de Reclamaciones y la barra de copyright con el crédito a TWNSTUDIOS.

Corresponde a la tarea "Links legales en el footer".

## Referencia de diseño (valores extraídos del bundle)

El footer es un bloque con fondo oscuro fijo: la excepción que admite el `CLAUDE.md`. Usa la paleta (`brand-*`) en lugar de los tokens semánticos de superficie, que asumen el tema claro. Ningún hex en los componentes.

**Contenedor**

- `<footer>` con `bg-brand-secondary-dark` y texto blanco.
- Desktop: padding superior 48 px; interior de 1320 px con padding lateral de 32 px y gap vertical de 40 px entre bloques.
- Mobile: padding `32px 16px 24px` y gap de 28 px.

**Banner del catálogo**

- Fondo `#262C52`, que no existe como token: se usa `bg-white/5` sobre el navy (≈ `#272C4A`), dentro de la excepción de fondo oscuro fijo.
- Desktop: radio 24 px, padding `24px 28px 24px 32px`, en fila con `justify-between`. Mobile: radio 20 px, padding `20px 16px`, en columna con gap de 14 px.
- Ícono `PiFilePdfLight` blanco sobre una caja `brand-primary`: 56 px con radio 14 e ícono de 30 px (desktop); 48 px con radio 12 e ícono de 26 px (mobile).
- Título "Catálogo de Productos para Medicina General Perú": `heading-h4` (20 px) en desktop y `subtitle` (16 px) en mobile.
- Botón "Descargar catálogo": 50 px de alto, `rounded-full`, `brand-primary`, hover `brand-primary-dark`, 15 px peso 500; padding horizontal de 28 px en desktop y ancho completo en mobile.

**Grilla de columnas**

| Ancho | Columnas | Gap |
|---|---|---|
| ≥ `lg` (1024 px) | `1.3fr 1fr 1fr 1fr 1.3fr`: marca, Productos, Medical Digital, Legales y contacto | 36 px |
| `md` a `lg` | La marca ocupa la fila completa; las cuatro columnas en 2 × 2 | 36 px |
| < `md` | Productos y Medical Digital en 2 columnas; Legales debajo; contacto a todo el ancho | 24 px |

- **Marca:** logo de `nav.logo` en blanco (`brightness-0 invert`) de 30 px (26 px en mobile), la frase en `body-sm` (14 px, interlineado 1.6) `brand-tertiary-light` con `max-w-[260px]` y, en desktop, las redes debajo.
- **Títulos de columna:** `overline` (12 px, peso 500), mayúsculas, tracking `.08em`, `brand-secondary-light`. En mobile, 11 px.
- **Enlaces:** `body-sm` (14 px) blancos, gap de 13 px (12 px en mobile); hover `brand-primary-light`, sin subrayado.
- **Contacto ("Estamos para ayudarte"):** teléfono (`tel:`), cada correo de `company.emails` (`mailto:`) y la dirección, con íconos `PiPhoneLight`, `PiEnvelopeSimpleLight` y `PiMapPinLight` de 20 px en `brand-primary-light` y un gap de 10 px.

**Redes**

- Círculos de 44 px con borde `brand-secondary` e ícono Phosphor `Pi…LogoLight` de 18 px; hover con fondo y borde `brand-primary`. La referencia mide 42 px; se sube a 44 por el target táctil del estándar.
- En desktop van debajo de la frase; en mobile, después de las certificaciones.

**Franja de certificaciones**

- `border-y border-brand-secondary` y padding vertical de 24 px (20 px en mobile).
- Desktop: en fila con `justify-between`; a la izquierda el rótulo "CERTIFICACIONES" y las certificaciones con gap de 32 px; a la derecha el Libro de Reclamaciones. Mobile: en columna con gap de 16 px.
- Cada certificación: círculo de 52 px (44 en mobile) con borde `brand-tertiary-light` y `PiCertificateLight` de 26 px (22 en mobile) del mismo color; código en `body-sm` peso 500 y nombre en `caption` `brand-tertiary-light`.
- Libro de Reclamaciones: `PiBookOpenLight` de 32 px (28 en mobile) y el texto en 13 px, en dos líneas en desktop y en una en mobile.

**Barra inferior**

- `caption` (12 px) `brand-secondary-light`, padding inferior de 28 px.
- Desktop: en fila con `justify-between`. Mobile: en columna con gap de 6 px.
- "© {año} Medical Digital Perú · Todos los derechos reservados" y "Desarrollado por TWNSTUDIOS".

**Contraste sobre `brand-secondary-dark`** (medido): blanco 15.66:1, `brand-tertiary-light` 8.82:1, `brand-primary-light` 7.92:1 y `brand-secondary-light` 5.92:1. Todos pasan 4.5:1. Sobre el banner (`bg-white/5`) bajan a ≈ 13.4, 7.6, 6.8 y 5.1:1. El blanco sobre el botón `brand-primary` queda en 4.08:1: es el mismo pendiente de diseño de `btn-primary` que ya registra el `CLAUDE.md`.

**Transiciones:** solo de color en hover, en 300 ms (estándar §4).

## Alcance

**Entra:**

- Reescribir `FooterReact.tsx` con el layout de la referencia en los tres anchos (< `md`, `md`–`lg`, ≥ `lg`).
- Mismo contenido en desktop y mobile: solo cambia el layout.
- Banner del catálogo con el archivo de `global.catalog.file`. Sin archivo, el botón se muestra pero no descarga, como en el header (SPEC 03).
- Columnas Productos, Medical Digital y Legales desde `footer.columns`, con los enlaces del modelo de datos.
- Columna de contacto desde `global.company`: teléfono, todos los correos y dirección.
- Certificaciones como lista editable en Tina, sembrada con los 3 valores de la referencia.
- Libro de Reclamaciones con texto y URL editables, sembrado con `/libro-de-reclamaciones`.
- Redes de `footer.social` con los logos de Phosphor. Los mapas `SOCIAL_NAMES` y `SOCIAL_ICONS` salen de `SiteMenu.tsx` a `src/components/shared/socialLinks.ts`, y los usan el panel ☰ y el footer.
- Año del copyright automático en build.
- Crédito "Desarrollado por TWNSTUDIOS", fijo en el código y enlazado con UTM.
- `Footer.astro` pasa de `client:visible` a `client:tina`: el footer no tiene interacción, así que en producción no carga React.
- Campos nuevos en `footer` (`tina/collections/global.ts`) y contenido nuevo en `src/content/global/index.json`.
- Se corrige el enlace muerto `/#cta`.
- Actualizar el `CLAUDE.md` (colección `global`) y la descripción de `company` en el schema, que dice "más adelante, el footer".

**No entra (para futuras specs o pendientes):**

- Las páginas `/marcas`, `/servicio-tecnico`, `/terminos-y-condiciones` y `/homologacion`: sus enlaces dan 404 hasta que existan.
- El formulario del Libro de Reclamaciones (`/libro-de-reclamaciones`): necesita envío y numeración correlativa, así que lleva su propia spec.
- La política de privacidad: no está en la referencia.
- El archivo PDF del catálogo, que lo entrega el cliente.
- La confirmación de las certificaciones por parte del cliente.
- Variar el contenido por breakpoint (las diferencias de la referencia mobile).
- El botón flotante de WhatsApp, que ya hizo SPEC 03.
- Animaciones de entrada o de scroll en el footer.

## Modelo de datos

Cambios en `tina/collections/global.ts` (objeto `footer`) y en `src/content/global/index.json`. `columns`, `social` y `legal` conservan su forma. `company`, `catalog` y `nav` no cambian.

```jsonc
"footer": {
  "tagline": "Más de 18 años equipando a las instituciones de salud del Perú con tecnología médica de marcas líderes.",
  "catalogTitle": "Catálogo de Productos para Medicina General Perú",       // NUEVO
  "catalogButtonLabel": "Descargar catálogo",                               // NUEVO
  "columns": [
    {
      "title": "Productos",
      "links": [
        { "label": "Cardiología",              "url": "/productos/categoria/cardiologia" },
        { "label": "Emergencia",               "url": "/productos/categoria/emergencia" },
        { "label": "Diagnóstico respiratorio", "url": "/productos/categoria/diagnostico-respiratorio" },
        { "label": "Hospitalización",          "url": "/productos/categoria/hospitalizacion" },
        { "label": "Ver todos",                "url": "/productos" }
      ]
    },
    {
      "title": "Medical Digital",
      "links": [
        { "label": "Nosotros",             "url": "/nosotros" },
        { "label": "Marcas y reseñas",     "url": "/marcas" },            // ⚠︎ 404 hasta su spec
        { "label": "Servicio técnico",     "url": "/servicio-tecnico" },  // ⚠︎ 404 hasta su spec
        { "label": "Noticias",             "url": "/blog" },
        { "label": "Trabaja con nosotros", "url": "/contacto" }
      ]
    },
    {
      "title": "Legales",
      "links": [
        { "label": "Términos y condiciones",     "url": "/terminos-y-condiciones" }, // ⚠︎ misma URL que el sitio actual
        { "label": "Devoluciones y garantías",   "url": "/nosotros#politicas" },
        { "label": "Código de ética y conducta", "url": "/nosotros#politicas" },
        { "label": "Homologación",               "url": "/homologacion" }            // ⚠︎
      ]
    }
  ],
  "contactTitle": "Estamos para ayudarte",                                  // NUEVO
  "certificationsTitle": "Certificaciones",                                 // NUEVO
  "certifications": [                                                       // NUEVO
    { "code": "ISO 9001:2015", "name": "Sistema de Gestión de Calidad" },
    { "code": "BPA",           "name": "Buenas Prácticas de Almacenamiento" },
    { "code": "ISO 13485",     "name": "Dispositivos médicos" }
  ],
  "complaintsBook": { "label": "Libro de Reclamaciones", "url": "/libro-de-reclamaciones" }, // NUEVO, ⚠︎
  "social": [ /* sin cambios: linkedin, facebook, instagram */ ],
  "legal": "Medical Digital Perú · Todos los derechos reservados"
}
```

**Schema nuevo en `footer`:**

| Campo | Tipo | Etiqueta en Tina |
|---|---|---|
| `catalogTitle` | string | Título del banner del catálogo |
| `catalogButtonLabel` | string | Texto del botón del catálogo |
| `contactTitle` | string | Título de la columna de contacto |
| `certificationsTitle` | string | Título de las certificaciones |
| `certifications` | lista de objetos `{ code, name }` | Certificaciones (`itemProps`: `code`) |
| `complaintsBook` | objeto `{ label, url }` | Libro de Reclamaciones |

**Convenciones:**

- `legal` no lleva `©` ni el año: el componente antepone `© {new Date().getFullYear()}` en el build.
- La columna de contacto siempre va última y no forma parte de `footer.columns`: sale de `global.company`.
- La URL del crédito es una constante en `FooterReact.tsx` (`TWNSTUDIOS_CREDIT_URL = "https://twnstudios.com/?utm_source=medicaldigital&utm_medium=referral&utm_campaign=client_portfolio"`) y no tiene campo en Tina.
- Las etiquetas de las redes (`aria-label`) salen de `SOCIAL_NAMES` en `socialLinks.ts`.
- Sin `certifications`, el bloque de certificaciones no se renderiza. Sin `complaintsBook.url`, el Libro de Reclamaciones tampoco. Si faltan los dos, la franja completa desaparece.
- Las categorías de Productos usan los mismos slugs de Woo que `categoryIcons`.

## Plan de implementación

La rama `feat/spec-04-rediseno-footer` sale de `feat/spec-03-rediseno-header` (PR #11, aún sin merge). Tras el merge se alinea sobre `staging` con `git rebase --onto origin/staging feat/spec-03-rediseno-header` y recién entonces se abre el PR. Cada paso deja el sitio compilando.

1. **Schema y contenido.**
   - Agregar al objeto `footer` de `tina/collections/global.ts` los campos `catalogTitle`, `catalogButtonLabel`, `contactTitle`, `certificationsTitle`, `certifications[]` y `complaintsBook`.
   - Cambiar la descripción de `company`, que hoy dice "más adelante, el footer".
   - Sembrar `src/content/global/index.json` con el modelo de datos. Con esto también se corrige `/#cta`.
   - *Prueba:* `npm run build` pasa; en `/admin` → Global → Footer aparecen los campos nuevos; el footer viejo sigue funcionando.
2. **Redes compartidas.**
   - Mover `SOCIAL_NAMES` y `SOCIAL_ICONS` de `SiteMenu.tsx` a `src/components/shared/socialLinks.ts` y que `SiteMenu.tsx` los importe desde ahí.
   - *Prueba:* el panel ☰ y el menú mobile muestran las mismas redes que antes.
3. **Footer desktop (≥ `lg`).**
   - Reescribir `FooterReact.tsx` con el banner del catálogo, la grilla de 5 columnas (marca con redes, tres columnas del CMS y contacto), la franja de certificaciones y el Libro de Reclamaciones, y la barra inferior con el año y el crédito.
   - Cada texto editable lleva `data-tina-field`, y el logo pasa por `mediaUrl()`.
   - *Prueba:* a 1280 y 1440 px se ve como la referencia desktop.
4. **Tablet y mobile.**
   - De `md` a `lg`, la marca ocupa la fila completa y las columnas van en 2 × 2.
   - Debajo de `md`, se aplican el apilado y los tamaños mobile: el banner en columna con el botón a todo el ancho, Productos y Medical Digital en 2 columnas, las certificaciones en columna, las redes después de las certificaciones y la barra inferior en columna.
   - *Prueba:* a 320, 360, 390 y 768 px no hay scroll horizontal y el orden es el de la referencia mobile.
5. **Hidratación.**
   - Cambiar `Footer.astro` a `client:tina`.
   - *Prueba:* en `npm run preview`, el footer no carga el JS de React. En `/admin`, editar la frase, una columna, una certificación o el Libro de Reclamaciones se refleja en la vista previa.
6. **Documentación y QA.**
   - Actualizar la colección `global` en el `CLAUDE.md`.
   - Correr `npm run build` y `npm run check:standard`, si existe.
   - Hacer el QA con Playwright a 320, 360, 768, 1280 y 1440 px, comparando con las dos referencias.
   - Agregar a la spec las "Notas de implementación" y la "QA realizada".

## Criterios de aceptación

- [ ] `npm run build` termina sin errores (y `npm run check:standard`, si existe, sin errores nuevos).
- [ ] A ≥ 1024 px el footer muestra, en este orden: el banner del catálogo; la fila de marca, Productos, Medical Digital, Legales y "Estamos para ayudarte" en proporción 1.3 : 1 : 1 : 1 : 1.3; la franja de certificaciones con el Libro de Reclamaciones a la derecha, y la barra inferior.
- [ ] Entre 768 y 1023 px, la marca ocupa la fila completa y las cuatro columnas van en 2 × 2.
- [ ] Debajo de 768 px, el orden es: banner, marca (logo y frase), Productos y Medical Digital en 2 columnas, Legales, contacto, certificaciones, Libro de Reclamaciones, redes y barra inferior.
- [ ] A 320 y 360 px no hay scroll horizontal y ningún texto se corta.
- [ ] El contenido es el mismo en todos los anchos: la frase, la columna Productos, "Trabaja con nosotros" y "Código de ética y conducta" se ven también en mobile.
- [ ] Los enlaces van a las URLs del modelo de datos. Nosotros, Noticias, Trabaja con nosotros, las 4 categorías, "Ver todos" y las dos políticas de `/nosotros#politicas` no dan 404.
- [ ] `/marcas`, `/servicio-tecnico`, `/terminos-y-condiciones`, `/homologacion` y `/libro-de-reclamaciones` llevan su URL final. Que den 404 está aceptado.
- [ ] Ningún enlace del footer apunta a `/#cta`.
- [ ] El contacto muestra el teléfono como `tel:`, los dos correos de `company.emails` como `mailto:` y la dirección.
- [ ] Las certificaciones muestran ISO 9001:2015, BPA e ISO 13485 con su nombre. Si se vacía la lista en Tina, el bloque desaparece sin romper el layout.
- [ ] Con `catalog.file` vacío, "Descargar catálogo" se ve pero no tiene `href`. Con un PDF cargado, lo descarga en otra pestaña.
- [ ] Las redes usan los logos de Phosphor, con círculos de 44 × 44 px, `aria-label` con el nombre de la red y apertura en otra pestaña.
- [ ] La barra inferior muestra "© {año actual} Medical Digital Perú · Todos los derechos reservados".
- [ ] "TWNSTUDIOS" enlaza a `https://twnstudios.com/?utm_source=medicaldigital&utm_medium=referral&utm_campaign=client_portfolio` con `target="_blank"` y `rel="noopener"`, y el crédito no aparece en `/admin`.
- [ ] Hover de los enlaces: `brand-primary-light`, sin subrayado. Hover de las redes: fondo `brand-primary`. Todos los textos alcanzan 4.5:1 sobre su fondo, salvo el botón `brand-primary` (pendiente de diseño ya registrado).
- [ ] Ningún componente del footer escribe un hex.
- [ ] En producción el footer no carga React (`client:tina`). En `/admin`, editar la frase, el banner, una columna, una certificación, el Libro de Reclamaciones, una red o la línea legal se refleja en la vista previa.
- [ ] El panel ☰ y el menú mobile siguen mostrando las mismas redes después de mover `socialLinks.ts`.

## Decisiones

| Decisión | Por qué |
|---|---|
| **Sí:** mismo contenido en desktop y mobile; solo cambia el layout | Criterio de Fiberlux (spec 07) y Eres (spec 04). Las diferencias de la referencia mobile (sin frase, sin Productos, "Productos" en vez de "Trabaja con nosotros", "Código de ética" corto) se tratan como iteración vieja del diseño. *(Elección del usuario.)* |
| **No:** ocultar la frase y Productos en mobile, ni un selector "solo desktop / solo mobile" por enlace | Duplica o diverge contenido; el selector complica el schema y el trabajo del editor. |
| **Sí:** solo lo que está en la referencia | Sin política de privacidad ni enlaces extra. *(Elección del usuario.)* |
| **Sí:** Legales con destino real cuando existe y URL final cuando no | "Devoluciones y garantías" y "Código de ética" ya son pestañas de `/nosotros#politicas`; Términos (`/terminos-y-condiciones`, misma URL del sitio actual) y Homologación dan 404 hasta su página. Mismo criterio que Eres. *(Elección del usuario.)* |
| **No:** ocultar los enlaces sin página ni crear aquí las páginas legales | Ocultarlos deja el footer incompleto frente a la referencia; crear las páginas es otra spec y depende de los textos del cliente. |
| **Sí:** Libro de Reclamaciones a `/libro-de-reclamaciones` | Es obligatorio en Perú y su formulario necesita backend: spec propia. La URL ya queda definitiva. *(Elección del usuario.)* |
| **Sí:** "Marcas y reseñas" → `/marcas` y "Servicio técnico" → `/servicio-tecnico` | Serán páginas propias (están en la referencia); sus specs vienen después. *(Elección del usuario.)* |
| **Sí:** columna Productos como columna más de `footer.columns` | El editor elige categorías y orden; el footer no depende de Woo ni de `store.ts`. *(Elección del usuario.)* |
| **No:** categorías automáticas desde Woo | El editor no elegiría cuáles; el footer leería `store.ts` en todas las páginas. |
| **Sí:** sembrar las 3 certificaciones de la referencia, editables en Tina | Fidelidad a la referencia. *(Elección del usuario.)* El sitio actual no las nombra: ver riesgos. |
| **Sí:** el footer muestra todos los `company.emails` | Una sola fuente de datos; la columna crece una línea frente a la referencia. *(Elección del usuario.)* |
| **Sí:** crédito como texto "Desarrollado por TWNSTUDIOS", fijo en código, con UTM y `rel="noopener"` | Igual a la referencia. Fijo para que no se quite desde el CMS; sin `noreferrer` para no perder el referrer (criterio de Eres). *(Elección del usuario.)* |
| **Sí:** año automático en build | El copyright no queda desactualizado; cada deploy lo recalcula. |
| **Sí:** `client:tina` en lugar de `client:visible` | El footer no tiene interacción: en producción no hace falta React. |
| **Sí:** `socialLinks.ts` compartido entre el panel ☰ y el footer | Mismos nombres y logos en los dos lugares; criterio de Eres. |
| **Sí:** paleta `brand-*` y `bg-white/5` dentro del footer | Bloque de fondo oscuro fijo: la excepción que admite el `CLAUDE.md`. `#262C52` no es token y no se agrega uno para un solo uso. |
| **Sí:** redes de 44 px en vez de 42 | Target táctil del estándar. |
| **Sí:** la rama sale de `feat/spec-03-rediseno-header` y no de `staging` | El footer usa `SiteMenu.tsx`, `global.catalog` y las redes del PR #11, que aún no está mergeado. Tras el merge se alinea con `git rebase --onto origin/staging feat/spec-03-rediseno-header` y recién entonces se abre el PR. *(Elección del usuario.)* |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Las certificaciones sembradas no están confirmadas: el sitio actual no las nombra y declarar una ISO que la empresa no tiene es un problema legal. | Queda como pendiente explícito en la descripción del PR: confirmarlas con el cliente antes del paso a `main`. Se corrigen o vacían desde Tina sin tocar código. |
| Los enlaces ⚠︎ dan 404 hasta que existan sus páginas. | Decisión aceptada. Al crear cada página, verificar que su ruta coincide con la del footer (se cambia en un solo lugar, el JSON). |
| Si Woo cambia el slug de una categoría, su enlace en el footer se rompe. | Mismos slugs que `categoryIcons`; anotarlo en la descripción del campo en Tina. |
| Si la revisión pide cambios en el header, la rama del footer queda desalineada. | Los cambios se hacen en la rama del header y el footer se vuelve a alinear con el mismo `rebase --onto`. El PR del footer no se abre hasta el merge del header. |
| `client:tina` no reflejara la edición en vivo. | Ya se usa en Nosotros y Noticias; el paso 5 lo verifica en `/admin`. |
| El blanco sobre "Descargar catálogo" (`brand-primary`) queda en 4.08:1. | Mismo pendiente de diseño que `btn-primary`, ya registrado en el `CLAUDE.md`. |
