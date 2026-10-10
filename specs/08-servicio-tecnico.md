# SPEC 08 — Página de servicio técnico

> **Status:** Implemented
> **Depends on:** SPEC 02, SPEC 03, SPEC 04
> **Date:** 2026-10-08
> **Objective:** Crear `/servicio-tecnico` según la pantalla "Servicio técnico" de la referencia (desktop y mobile), con sus textos editables desde Tina y el formulario de solicitud maquetado sin envío.

## Por qué existe esta spec

El footer ya enlaza a `/servicio-tecnico` y hoy da 404. El slide 2 de la Home ("Solicitar servicio") la reemplaza con `/contacto`, y ni el header ni el menú ☰ la enlazan.

La tarea "Página de servicio técnico con formulario" se cierra con dos specs: esta (la página y el formulario maquetado) y la 11 (el envío de Contacto, Cotización y Servicio técnico). Es el mismo corte de la SPEC 02 con Contacto: la espera por el hosting, el SMTP y Turnstile no frena la página.

## Referencia de diseño

Pantallas "Servicio técnico" de `Medical Digital Desktop.html` y `Medical Digital Mobile.html`. Breakpoints del estándar: base 360 (y 320), `md` 768, `lg` 1024, `xl` 1280.

| Hex del bundle | Token |
|---|---|
| `#F4F5F8` (fondo de la página) | `bg-surface-raised` |
| `#FFFFFF` (tarjeta del formulario) | `bg-surface` |
| `#F7F8FA` / `#E5E7EB` (campos) | `bg-surface-raised` / `border-line`, como `ContactFormReact` |
| `#1C2140` (h1, datos, íconos, foco) | `text-brand-secondary-dark` |
| `#3F3F3F` (bajada, labels) | `text-content-muted` |
| `#717274` sobre el fondo gris (breadcrumb, rótulos de los datos) | `text-content-muted` (con `content-subtle` daría 4.4975:1) |
| `#717274` dentro de la tarjeta (notas `(*)` y `(**)`) | `text-content-subtle` |
| `#18459A` (enlace a la política) | `text-brand-tertiary-dark` |
| `#E83C3E` / `#B8242A` (botón) | `btn-primary` |

| Bloque | Desktop | Mobile |
|---|---|---|
| Contenedor | 1120 px máx., padding 64/32/96 | padding 28/16/48 |
| Cabecera | breadcrumb 14 px; h1 48 px → `heading-h1`; bajada 17 px → `body-lg`, 640 px máx. | breadcrumb 13 px; h1 30 px → `heading-h2`; bajada corta, `body-md` |
| Datos | teléfono y correo en fila (gap 48), íconos de 40 px (`PiPhoneLight`, `PiEnvelopeSimpleLight`), valor 18 px | en columna (gap 14), íconos de 32 px, correo con `break-all` |
| Tarjeta | `rounded-[28px]`, padding 48 | `rounded-[22px]`, padding 22 |
| Grilla | 6 columnas, gap 20: Nombres y Apellidos 3+3; Correo, Teléfono e Institución 2+2+2; Marca, Modelo y Serie 2+2+2; Mensaje 6 | una columna, gap 14 |
| Campos | 52 px de alto, `rounded-xl`; textarea de 140 px | 50 px; textarea de 120 px; texto de 16 px (sin zoom en iOS) |
| Pie | notas `(**)` y `(*)` en 13 px; borde superior; casilla a la izquierda y botón de 54 px a la derecha | notas en una línea de 12 px; casilla y botón a todo el ancho, apilados |

## Scope

**In:**

- Ruta `/servicio-tecnico`, fiel a la referencia en desktop y mobile, sin scroll horizontal de 320 a 1536 px.
- **Cabecera clara:**
  - breadcrumb "Inicio / Servicio técnico" en un `<nav>` con `aria-current`;
  - un solo h1 y la bajada.
- **Datos de contacto:**
  - "Atención al cliente" con `global.company.phone` como enlace `tel:`;
  - "Correo electrónico" con el campo nuevo `global.company.serviceEmail` como enlace `mailto:`;
  - el ítem sin dato no se renderiza.
- **Formulario maquetado sin envío**, igual que Contacto en la SPEC 02:
  - los 9 campos de la referencia (Nombres, Apellidos, Correo electrónico, Teléfono móvil, Institución, Marca, Modelo, Serie y Mensaje del incidente), con `<label>` visible, `type`, `autocomplete`, `required` y asterisco;
  - "Marca" es texto libre;
  - notas `(**)` y `(*)`;
  - casilla de consentimiento `required`; sin `privacyUrl`, el texto va sin enlace;
  - botón "Enviar solicitud" (`type="button"`);
  - sin JS en producción (`client:tina`).
- **Tina:**
  - colección nueva `service`, un solo documento que no se crea ni se borra desde el panel, en `tina/collections/service.ts`;
  - `global.company` suma `serviceEmail`;
  - componente doble y una consulta por página.
- **SEO:** title y description desde `service.seo`, de 50–60 y 140–160 caracteres; canonical y OG de `BaseLayout`.
- **Enlaces, solo en el contenido (JSON):**
  - header: "Servicio técnico" entre Productos y Noticias;
  - menú ☰: tarjeta "Servicio posventa — Mantenimiento y repuestos" con imagen `public/uploads/menu/tarjeta-servicio-tecnico.webp`, sacada de la foto del slide 2;
  - menú ☰ › Atención al cliente: "Soporte técnico";
  - slide 2 de la Home: `ctaUrl` a `/servicio-tecnico`.

**Fuera de alcance (para specs futuras):**

- Envío, validación con mensajes junto al campo, honeypot, Turnstile y correo (SPEC 11).
- El estado "Solicitud registrada", con sus textos y su maqueta (SPEC 11).
- Casilla de consentimiento en el modal de cotización (SPEC 11).
- La página de la política de datos personales, que es la que llena `privacyUrl` (SPEC 09).
- JSON-LD `BreadcrumbList` y `Service`: `BreadcrumbList` para todas las páginas internas va en la 13. `Service` no genera resultados enriquecidos.
- Botones "Llamar" y "WhatsApp" en mobile: no están en la referencia de esta pantalla.
- Lista de servicios (`services` de `datos-diseno.js`): no aparece en la pantalla.
- Select o sugerencias de marcas de Woo, adjuntos (fotos del equipo), agenda de visitas y seguimiento de tickets.
- Enlace "Marcas y reseñas" en el header: llega con la SPEC 10.

## Modelo de datos

**Tina `service`, nueva.** Un solo documento, sin crear ni borrar desde el panel.

```ts
// tina/collections/service.ts → src/content/service/servicio-tecnico.json
{
  hero: {
    title,        // "Servicio posventa calificado" (h1)
    text,         // bajada, textarea
  },
  form: {
    incidentHint, // "(**) Indica la periodicidad y circunstancias…", textarea
    requiredNote, // "(*) Todos los campos son obligatorios."
    consentLabel, // "He leído y acepto la"
    privacyLabel, // "Política de uso de datos personales"
    privacyUrl,   // vacío: el texto va sin enlace
    submitLabel,  // "Enviar solicitud"
  },
  seo: { title, description },
}
```

**Tina `global.company`, se amplía sin cambiar lo existente.**

```ts
company: {
  address, phone, emails, hours,       // existentes
  serviceEmail,                        // nuevo: "servicio.tecnico@medicaldigitalperu.com"
}
```

Con la descripción en el panel: *"Lo usa la página de Servicio técnico. Vacío, no se muestra."*

**Contenido inicial**

```json
{
  "hero": {
    "title": "Servicio posventa calificado",
    "text": "Coordina una revisión técnica, mantenimiento o reparación de tus equipos con nuestros ingenieros certificados."
  },
  "form": {
    "incidentHint": "(**) Indica la periodicidad y circunstancias en las que ocurre el incidente. Si hubiera algún mensaje de error, anótalo.",
    "requiredNote": "(*) Todos los campos son obligatorios.",
    "consentLabel": "He leído y acepto la",
    "privacyLabel": "Política de uso de datos personales",
    "privacyUrl": "",
    "submitLabel": "Enviar solicitud"
  },
  "seo": {
    "title": "Servicio técnico de equipos médicos | Medical Digital",
    "description": "Solicita mantenimiento preventivo, correctivo o reparación de tus equipos médicos con ingenieros certificados y repuestos originales en todo el Perú."
  }
}
```

El title mide 52 caracteres y la description 150; se vuelven a medir al implementar.

**En el código, no en Tina** (criterio de la SPEC 02: las etiquetas de interfaz no son contenido editorial):

- labels de los 9 campos, con su `name` y su `autocomplete`:
  - `firstName` (`given-name`);
  - `lastName` (`family-name`);
  - `email` (`email`);
  - `phone` (`tel`);
  - `institution` (`organization`);
  - `brand`, `model` y `serial` (`off`);
  - `message`;
- rótulos "Atención al cliente" y "Correo electrónico";
- breadcrumb "Inicio / Servicio técnico".

**Reglas**

- Mobile usa los mismos textos que desktop. Las versiones cortas del diseño mobile no se cargan aparte, porque solo resumen las de desktop.
- Sin `hero.text`, la bajada no se renderiza. Sin `incidentHint` o `requiredNote`, esa nota no aparece.
- Sin `company.phone` ni `company.serviceEmail`, el bloque de datos no se renderiza.
- Sin `submitLabel`, el botón dice "Enviar solicitud".

## Plan de implementación

Rama `feat/spec-08-servicio-tecnico`, creada desde `staging` actualizado.

1. **Schema.** Crear `tina/collections/service.ts` y registrarla en `tina/config.ts`. Sumar `serviceEmail` a `global.company` en `tina/collections/global.ts`. Crear `src/content/service/servicio-tecnico.json` con el contenido inicial y llenar `serviceEmail` en `src/content/global/index.json`.
   - **Prueba:** `npm run dev`, y en `/admin` aparece "Servicio técnico" sin botones de crear ni borrar, y "Correo de servicio técnico" en Datos de la empresa.
2. **Página y cabecera.** Crear `src/pages/servicio-tecnico.astro`. Igual que `contacto.astro`, consulta `service` y `global` en paralelo y pasa el SEO a `BaseLayout`. Crear `src/components/service/ServiceHero.astro` y `ServiceHeroReact.tsx`, con breadcrumb, h1 y bajada sobre `bg-surface-raised`.
   - **Prueba:** `/servicio-tecnico` responde con la cabecera, un solo h1 y el title de `service.seo`.
3. **Datos de contacto.** Crear `ServiceInfo.astro` y `ServiceInfoReact.tsx`, que leen `global`: teléfono como `tel:` (sin espacios ni paréntesis en el `href`) y correo como `mailto:`, con sus íconos Phosphor Light. Los dos van en fila desde `md` y en columna en mobile.
   - **Prueba:** al vaciar `serviceEmail` en Tina, el ítem del correo desaparece.
4. **Formulario.** Crear `ServiceForm.astro` y `ServiceFormReact.tsx` siguiendo `ContactFormReact`, con las mismas clases de label y control, la grilla de 6 columnas desde `md`, las notas, la casilla y el botón. Todas las islas de la página usan `client:tina`.
   - **Prueba:** en `npm run preview`, la página no carga el runtime de React.
5. **Enlaces.** Editar `src/content/global/index.json` (link del header, tarjeta y "Soporte técnico" en el ☰) y `src/content/home/index.json` (`ctaUrl` del slide 2). Generar `public/uploads/menu/tarjeta-servicio-tecnico.webp` desde la foto del slide 2, con el mismo tamaño que las otras tarjetas y menos de 300 KB.
   - **Prueba:** desde el header, el ☰, el footer y el slide 2 se llega a `/servicio-tecnico`.
6. **Documentación.** Actualizar `CLAUDE.md`: colección `service`, `company.serviceEmail` y la ruta. Completar las "Notas de implementación" de esta spec.
   - **Prueba:** `npm run build` pasa.

## Criterios de aceptación

**Página**

- [ ] `/servicio-tecnico` responde 200 y aparece en el sitemap.
- [ ] Tiene un solo `h1`, "Servicio posventa calificado", y el breadcrumb "Inicio / Servicio técnico" está dentro de un `<nav>` con `aria-current="page"` en el último ítem.
- [ ] El title y la description salen de `service.seo` y miden 50–60 y 140–160 caracteres. El canonical apunta a `/servicio-tecnico`.
- [ ] No hay scroll horizontal en 320, 360, 768, 1024, 1280 y 1536 px.
- [ ] A 360 px coincide con la pantalla mobile de la referencia: campos en una columna, datos apilados, casilla y botón a todo el ancho.
- [ ] A 1280 px coincide con la pantalla desktop: grilla 3+3, 2+2+2, 2+2+2 y mensaje a todo el ancho; casilla a la izquierda y botón a la derecha.
- [ ] En producción (`npm run preview`), la página no carga el runtime de React.
- [ ] La consola del navegador no muestra errores.

**Datos de contacto**

- [ ] El teléfono es `global.company.phone` y enlaza a `tel:` sin espacios ni paréntesis.
- [ ] El correo es `global.company.serviceEmail` y enlaza a `mailto:`. A 320 px no desborda.
- [ ] Con `serviceEmail` vacío, el ítem del correo no está en el HTML. Con teléfono y correo vacíos, no está el bloque.

**Formulario**

- [ ] Tiene los 9 campos en el orden de la referencia, cada uno con `<label>` visible, asterisco, `required` y el `type` y el `autocomplete` del modelo de datos.
- [ ] "Marca" es un `<input type="text">`.
- [ ] A 360 px, los campos tienen texto de 16 px: iOS no hace zoom al enfocarlos.
- [ ] La casilla de consentimiento lleva `required`. Sin `privacyUrl`, el texto de la política se muestra sin enlace, y con URL es un enlace.
- [ ] "Enviar solicitud" es `type="button"`: al pulsarlo no se recarga la página ni se envía nada.
- [ ] El botón, la casilla y los campos mantienen el foco visible y se recorren con Tab en orden.
- [ ] El botón mide al menos 44 px de alto.

**Tina**

- [ ] Desde `/admin` se editan el título, la bajada, las notas, los textos del consentimiento, `privacyUrl`, el botón y el SEO, y el cambio se ve en la vista previa.
- [ ] `service` no permite crear ni borrar documentos.
- [ ] Con `hero.text`, `incidentHint` o `requiredNote` vacíos, ese texto desaparece sin romper el layout.

**Enlaces**

- [ ] El header muestra "Servicio técnico" entre Productos y Noticias, y lleva a `/servicio-tecnico`.
- [ ] El menú ☰ muestra la tarjeta "Servicio posventa" con imagen y el enlace "Soporte técnico", y los dos llevan a la página.
- [ ] "Solicitar servicio" del slide 2 de la Home lleva a `/servicio-tecnico`.
- [ ] `tarjeta-servicio-tecnico.webp` pesa menos de 300 KB y tiene texto alternativo.

**Código**

- [ ] Ningún componente nuevo escribe hex, `text-white/*` ni `bg-white/*`. El texto sobre `bg-surface-raised` no usa `content-subtle`.
- [ ] `npm run build` pasa.

## Decisiones

- **Sí: colección propia `service`.** Elección del usuario. Es el patrón de `about` y `contact` (SPEC 02) y de Eres 07.
- **No: un bloque dentro de `contact`.** Mezclaría dos páginas en un mismo documento.
- **Sí: teléfono de `global.company.phone` y correo en `global.company.serviceEmail`.** Elección del usuario, con el criterio de Eres 08: los datos de contacto no se duplican en la página. El teléfono de servicio técnico es el de la empresa.
- **No: teléfono y correo en `service`.** Se desincronizarían con el footer y Contacto.
- **Sí: teléfono y correo como enlaces `tel:` y `mailto:`,** aunque el diseño los dibuje como texto. Así están en Contacto, y en mobile ahorran copiar el número.
- **No: botones "Llamar" y "WhatsApp" en mobile.** El brief los mencionaba, pero la pantalla mobile de la referencia no los tiene: son de Contacto.
- **Sí: "Marca" como texto libre.** Elección del usuario. Servicio técnico atiende equipos que ya no se venden o que se compraron en otro lado.
- **No: select ni `<datalist>` con las marcas de Woo.** El select deja fuera esas marcas, y el `datalist` hace depender la página de la descarga de Woo.
- **Sí: formulario maquetado sin validación ni JS (`client:tina`).** Elección del usuario. Es el criterio de Contacto en la SPEC 02. La validación con mensajes junto al campo y los estados cargando/éxito/error llegan en la 11, en un solo módulo para los tres formularios.
- **No: validar ya.** Un botón que valida y luego no hace nada confunde. Además, este formulario quedaría con un criterio distinto al de Contacto y Cotización.
- **Sí: "Solicitud registrada" completo en la 11.** Elección del usuario. Un campo de Tina que no se ve en el sitio confunde al editor.
- **Sí: SEO con title, description, canonical y OG, sin JSON-LD propio.** Elección del usuario, con el criterio de Eres 06 y 08: las páginas institucionales no emiten JSON-LD, y Eres solo lo emite cuando da un resultado enriquecido (`FAQPage`, `BlogPosting`, `Product`).
- **No: `BreadcrumbList` ni `Service` en esta spec.** `Service` no da resultados enriquecidos. `BreadcrumbList` va en la 13 para todas las páginas internas, y la prop `jsonLd` de `BaseLayout` todavía no está en `staging` (llega con la 07).
- **Sí: los cuatro enlaces del diseño, solo en el contenido.** Elección del usuario. No toca código del header ni del menú.
- **Sí: cabecera clara propia en lugar de `PageHero`.** La referencia tiene fondo gris con breadcrumb, no el hero oscuro con foto de Nosotros y Contacto. La 07 hizo lo mismo en `/noticias`.
- **Sí: `content-muted` para el gris del diseño sobre el fondo de la página.** `content-subtle` sobre `surface-raised` da 4.4975:1 y no llega al 4.5:1 del estándar.
- **Sí: los mismos textos en desktop y mobile.** Las versiones cortas del diseño mobile solo resumen las de desktop, y tenerlas aparte duplicaría campos en Tina.
- **Sí: etiquetas de los campos y rótulos de datos en el código.** Es el criterio de la SPEC 02: no son contenido editorial.
- **Sí: imagen de la tarjeta del ☰ sacada de la foto del slide 2.** Es provisional, como las demás fotos del sitio, y se cambia desde Tina.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Conflictos con la rama de la 07 en `tina/config.ts`, `tina/__generated__/` y `global/index.json` | Los archivos generados no se resuelven a mano: después del merge se corre `tinacms build`. En el JSON son líneas sueltas. |
| `staging` llega a `main` con un formulario que no envía. El go-live exige formularios probados con un correo recibido. | Mismo criterio de la SPEC 02: lo dice el PR, y `staging` no pasa a `main` hasta que la 11 conecte el envío. |
| El cliente intenta usar el formulario en el preview y cree que envió | El botón no cambia de estado ni muestra éxito. El PR lo avisa al revisor. |
| `privacyUrl` vacío hasta la 09 | El texto se muestra sin enlace, como en Contacto. La 09 lo llena desde Tina sin tocar código. |
| Una ruta de imagen de Tina con el prefijo `assets.tina.io` en la tarjeta del ☰ | Ya pasa por `mediaUrl()` en el header (SPEC 03). |

## Lo que **no** entra en esta spec

- Envío, validación, honeypot, Turnstile, correo y el estado "Solicitud registrada" (SPEC 11).
- La política de datos personales (SPEC 09).
- JSON-LD de la página (SPEC 13).
- Botones "Llamar" y "WhatsApp", la lista de servicios, sugerencias de marcas de Woo, adjuntos, agenda y seguimiento de tickets.
- Enlace "Marcas y reseñas" en el header (SPEC 10).

Si alguna de estas cosas se hace, va en su propia spec.

## Notas de implementación

- El title mide 53 caracteres y la description 149 (la spec estimaba 52 y 150); los dos quedan en rango.
- Los datos de contacto van en una `<ul>`: un `<dl>` no admite el ícono como hijo del grupo `dt`/`dd`.
- El mensaje del incidente lleva `aria-describedby` hacia la nota `(**)` cuando existe.
- La tarjeta del ☰ es un recorte de 240×208 (9 KB) del slide 2, del mismo tamaño que las otras dos, con su `imageAlt`. Va entre Productos y Noticias, y "Soporte técnico" antes de Contacto, en el orden de la referencia.
- Las tres islas de la página son `client:tina`, igual que en Contacto. El header (`client:load`) y el banner de cookies (`client:idle`) cargan React en todas las páginas, así que el runtime sí se descarga en `/servicio-tecnico`. La página no agrega JS propio.
- `ContactFormReact` tiene el mismo choque de alturas que se corrigió aquí (`h-[52px]` contra `h-[130px]` en el textarea). Queda fuera de alcance.
- Sin credenciales de TinaCloud, el build se verifica con `npm run build:local`.
- Foco según la referencia: los campos solo cambian el borde a `brand-secondary-dark` y el fondo a `surface`, sin anillo. Casilla, botón y enlaces usan el anillo global, pero en `brand-secondary-dark` y no en rojo. El cambio aplica solo a esta página; el resto del sitio sigue con el anillo `brand-primary`.
- Los textos de 13 px de la referencia (breadcrumb y rótulos en mobile, notas en desktop) usan tokens: `caption` (12 px) en mobile y `body-sm` (14 px) en desktop. No hay token de 13 px.
- Sin `privacyUrl`, "Política de uso de datos personales" lleva el estilo de enlace de la referencia (subrayado, `text-brand-tertiary-dark`), pero sin `href`. Decisión del usuario mientras la SPEC 09 no cree la página. Al llenar `privacyUrl` en Tina pasa a ser un enlace real.
