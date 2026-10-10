# SPEC 11 — Envío de formularios

> **Status:** Aprobado
> **Depends on:** SPEC 02 (Contacto y modal de cotización), SPEC 08 (formulario de servicio técnico), SPEC 09 (política de privacidad)
> **Date:** 2026-10-09
> **Objective:** Hacer que los formularios de Contacto, Cotización y Servicio técnico envíen por correo a través de `send-email.php`, con validación, honeypot, límite por IP y estados de envío, todo configurado pero sin credenciales.

## Por qué existe esta spec

- Los tres formularios están maquetados sin envío:
  - Contacto (SPEC 02) y Servicio técnico (SPEC 08) tienen un botón `type="button"` y hoy no cargan JS en producción (`client:tina`).
  - El modal de cotización hace `preventDefault()` y no tiene casilla de consentimiento.
- El repo no tiene backend de formularios. Solo quedan rastros del starter en `.gitignore` (`public/site-config.php`) y en `.env.example` (`PUBLIC_TURNSTILE_SITE_KEY`).
- Decisión del revisor (2026-10-08):
  - Turnstile no se activa todavía.
  - El envío sale desde el correo del cliente (Microsoft 365).
  - Todo queda configurado, pero sin credenciales.
- Eres es la referencia (`send-email.php` + PHPMailer + `form-config.json`). Sin embargo, guarda cada envío en `data/submissions/`, no tiene límite por IP y responde CORS `*`. Las tres cosas chocan con el estándar §8 y §9, así que esta spec no las copia.
- `staging` no puede pasar a `main` hasta que esto esté probado con un correo recibido (estándar §10).

## Referencia de diseño

Pantallas "Contacto", "Servicio técnico" y el modal de cotización de "Medical Digital Desktop.html" y "Mobile.html" (estados `contactSent`, `svcSent` y `quoteSent`). La referencia no dibuja estados de cargando, de error ni errores por campo. Esos estados salen del estándar §7 y §8, con los tokens del UI Kit.

### Hex del bundle → Token

| Hex | Uso en la referencia | Token |
|---|---|---|
| `#EBF7ED` | Círculo del check de éxito | `bg-semantics-success-lightest` |
| `#267C35` | Ícono del check | `text-semantics-success-dark` |
| `#717274` | Texto de éxito y línea "Tu solicitud llegará a…" | `text-content-subtle` |
| `#E83C3E` | "Enviar otro mensaje" / "Enviar otra solicitud" | `btn-link` |
| `#1C2140` | "Cerrar" del modal (borde y texto) | `btn` + `border-brand-secondary-dark text-brand-secondary-dark` (`btn-secondary` es rojo) |
| — | Error junto al campo (no está en la referencia) | `text-semantics-error-dark` + ícono `PiWarningCircleLight` |

### Estados

| Estado | Contacto | Servicio técnico | Cotización |
|---|---|---|---|
| Formulario | Sin cambios de maqueta (SPEC 02) | Sin cambios (SPEC 08) | Agrega la casilla de consentimiento y la línea `PiEnvelopeSimpleLight` "Tu solicitud llegará a…" (`text-caption`, 12 px, de la escala del UI Kit; la referencia usa 13 px, `text-content-subtle`) antes de los botones |
| Cargando | Botón `aria-disabled`, texto "Enviando…" y la misma medida | Igual | Igual |
| Éxito | Reemplaza el formulario: círculo de 72 px con `PiCheckLight` de 38 px, título de 24 px (`text-heading-h3`), texto de 15 px y enlace "Enviar otro mensaje"; `padding` 56 px | Igual, con "Solicitud registrada" y "Enviar otra solicitud"; `padding` 48 px | Igual dentro del modal, con "¡Solicitud enviada!", texto con `max-w-[380px]` y botón "Cerrar" de 48 px; `padding` 20 px |
| Error de envío | Mensaje con `role="alert"` sobre el botón, con enlace a WhatsApp; los datos se conservan | Igual | Igual; "Hablar con un asesor" ya está al lado |
| Error de campo | Texto bajo el campo, `aria-invalid` y `aria-describedby`; el foco va al primer campo inválido | Igual | Igual (sus labels son `sr-only`, así que el error se ve bajo el input) |

## Scope

**In:**

- **Backend PHP** en `public/`, que llega a la raíz de `dist/`:
  - `send-email.php`:
    - recibe JSON, valida por `formType`, revisa el honeypot `website` y el límite por IP;
    - verifica Turnstile solo si hay secreto;
    - genera el correlativo y envía por SMTP con PHPMailer;
    - manda la confirmación a quien llenó el formulario.
  - `config.example.php`: plantilla de `site-config.php` con `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `from_name`, `fallback_email`, `turnstile_secret` y `allowed_origins`, todos sin valores reales.
  - `phpmailer/` (`PHPMailer.php`, `SMTP.php`, `Exception.php`), copiados sin Composer.
  - Una carpeta `data/` creada en runtime, con `.htaccess` que niega el acceso. Guarda los contadores de correlativos y el límite por IP (IP con hash). **No guarda los envíos.**
- **Sin credenciales, falla de forma controlada:**
  - sin `site-config.php`, o con el SMTP vacío, responde un error JSON;
  - el formulario muestra el estado de error con WhatsApp y no se rompe.
- **Destinatarios en Tina:**
  - colección nueva `formConfig` (`contacto`, `cotizacion`, `servicio-tecnico`: `enabled` y `recipients[]`);
  - `src/pages/form-config.json.ts` emite `/form-config.json` en build;
  - sin destinatarios, se usa `fallback_email`.
- **Cliente compartido:**
  - `src/utils/submitForm.ts`: POST a `PUBLIC_FORMS_ENDPOINT`; vacía, va a `send-email.php` del mismo dominio, con `withBase`;
  - un módulo de validación con las mismas reglas para los tres formularios.
- **Turnstile listo y apagado:**
  - el widget solo se carga si existe `PUBLIC_TURNSTILE_SITE_KEY`;
  - el PHP verifica y falla cerrado solo si existe `turnstile_secret`.
- **Contacto y Servicio técnico:**
  - pasan de `client:tina` a `client:visible`;
  - botón `type="submit"`, validación y estados de cargando, éxito y error.
- **Cotización:**
  - envío real con el producto y su URL;
  - casilla de consentimiento obligatoria con enlace a `/politicas-de-privacidad` (Ley 29733);
  - línea "Tu solicitud llegará a…" y estado "¡Solicitud enviada!" con "Cerrar".
- **Textos editables en Tina:**
  - éxito y error en `contact.form` y `service.form`;
  - objeto nuevo `global.quote` (consentimiento, línea de destino, éxito y error).
- `.env.example` suma `PUBLIC_FORMS_ENDPOINT`.
- `CLAUDE.md` gana la sección "Formularios", con cómo activar el SMTP y Turnstile cuando lleguen las credenciales.

**Fuera de alcance (para futuras specs):**

- Subir el PHP y `site-config.php` al servidor, y decidir dónde corre en producción y en los previews (SPEC 13, con autorización del revisor).
- Cargar credenciales reales: buzón de M365 con SMTP AUTH y claves de Turnstile. Las entrega el cliente o el revisor.
- Probar el envío con un correo recibido: depende de lo anterior y queda en el checklist de go-live.
- Mock del backend en `npm run dev`.
- Formularios definidos en Tina (`dynamicForms` de Eres): los campos son fijos del diseño.
- Adjuntos ("Trabaja con nosotros"), Libro de Reclamaciones y newsletter.
- Guardar los envíos o un panel para verlos.

## Modelo de datos

### `formConfig` (nueva, documento único `src/content/form-config/index.json`)

```ts
// tina/collections/formConfig.ts
{
  forms: [{                 // list, label = label
    formType,               // string, options: "contacto" | "cotizacion" | "servicio-tecnico"
    label,                  // string, solo para el panel
    enabled,                // boolean; false → el PHP rechaza y el sitio muestra el error
    recipients,             // string[]; vacío → fallback_email de site-config.php
  }]
}
```

Contenido inicial: los tres formularios con `enabled: true`. Los correos se escriben como contenido provisional del sitio: `info@`, `ventas@` y `servicio.tecnico@medicaldigitalperu.com`, hasta que el cliente los confirme. `/form-config.json` emite lo mismo, sin `label`.

### `contact.form` y `service.form` (se amplían)

```ts
successTitle,   // "¡Mensaje enviado!" | "Solicitud registrada"
successText,    // "Te responderemos en menos de 24 horas hábiles." | "Te confirmaremos la fecha de visita en menos de 24 horas hábiles."
successReset,   // "Enviar otro mensaje" | "Enviar otra solicitud"
errorText,      // "No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp."
```

### `global.quote` (nuevo objeto)

```ts
quote: {
  recipientNote,  // "Tu solicitud llegará a ventas@medicaldigitalperu.com"; vacío, no se muestra
  consentLabel,   // "Acepto la"
  privacyLabel,   // "política de datos personales"
  privacyUrl,     // "/politicas-de-privacidad"
  successTitle,   // "¡Solicitud enviada!"
  successText,    // "Un asesor comercial te contactará en menos de 24 horas hábiles."
  closeLabel,     // "Cerrar"
  errorText,      // "No pudimos enviar tu solicitud. Inténtalo de nuevo o habla con un asesor."
}
```

### Payload de `submitForm` → `send-email.php`

```ts
type FormType = "contacto" | "cotizacion" | "servicio-tecnico";
// Común: { formType, website /* honeypot */, captchaToken, consent: true }
contacto:          { firstName, lastName, phone, email, position?, institution, location, specialty?, message? }
cotizacion:        { name, institution, email, phone, message?, product, productUrl }
"servicio-tecnico": { firstName, lastName, email, phone, institution, brand, model, serial, message }
// Respuesta: { success: true, correlativo } | { success: false, error, fields?: Record<string, string> }
```

### Reglas de validación (las mismas en cliente y servidor)

| Regla | Valor |
|---|---|
| Obligatorios | Los que hoy llevan `*` en cada formulario, más `consent` |
| Correo | `FILTER_VALIDATE_EMAIL` en PHP y un regex equivalente en el cliente |
| Teléfono | 7–15 dígitos; se permiten `+`, espacios, guiones y paréntesis |
| Largo máximo | 120 caracteres por campo de texto y 3000 en `message` |
| `location` / `specialty` | En el servidor solo se limpia el texto, no se valida contra la lista (sale de Tina y de Woo) |

### `site-config.php` (en el servidor, git-ignored)

```php
return [
  'smtp_host' => 'smtp.office365.com', 'smtp_port' => 587,
  'smtp_user' => '', 'smtp_pass' => '',          // buzón del cliente con SMTP AUTH
  'from_name' => 'Medical Digital Web',
  'fallback_email' => '',
  'turnstile_secret' => '',                      // vacío = captcha apagado
  'allowed_origins' => [],                       // p. ej. dominios de Amplify; vacío = solo el mismo dominio
];
```

### Archivos de runtime en `public/data/` (en el servidor, git-ignored)

- `counter.json`: `{ "contacto": 12, ... }`. Correlativos `CON-000012`, `COT-…` y `SVT-…`.
- `ratelimit.json`: `{ "<sha256(ip + smtp_user)>": [timestamps] }`. Máximo 5 envíos cada 10 minutos por IP, y se purgan las entradas vencidas.

## Plan de implementación

1. **Validación compartida.** Crear `src/utils/formValidation.ts` con las reglas de la tabla, por `formType`. Devuelve `{ campo: mensaje }` y no tiene dependencias.
2. **Cliente de envío.** Crear `src/utils/submitForm.ts`:
   - hace POST JSON a `PUBLIC_FORMS_ENDPOINT` o, si está vacía, a `withBase("/send-email.php")`;
   - toda falla (red, respuesta que no es JSON, 404 en Amplify) termina en `{ success: false }`.
   - Sumar `PUBLIC_FORMS_ENDPOINT=` a `.env.example`.
3. **Turnstile apagado.** Crear `src/components/shared/Turnstile.tsx`:
   - sin `PUBLIC_TURNSTILE_SITE_KEY` no dibuja nada ni carga el script;
   - con clave, carga `challenges.cloudflare.com/turnstile/v0/api.js` una sola vez y entrega el token.
4. **Campo de formulario accesible.** Extraer las piezas que se repiten (mensaje de error bajo el campo con `id`, `aria-invalid` y `aria-describedby`, estado de éxito con el check y botón con "Enviando…") a `src/components/shared/FormStatus.tsx`, sin cambiar la maqueta actual.
5. **Schema.**
   - Crear `tina/collections/formConfig.ts` y `src/content/form-config/index.json`, y registrarlos en `tina/config.ts`.
   - Ampliar `contact.form`, `service.form` y `global` (`quote`) con los textos del modelo de datos.
   - Correr `npm run build` para regenerar `tina/__generated__/` y `tina-lock.json`.
6. **`/form-config.json`.** Crear `src/pages/form-config.json.ts` (patrón de Eres, sin `label`). Comprobar que existe en `dist/` después del build.
7. **Backend.**
   - Copiar PHPMailer en `public/phpmailer/` (tag estable, con su `LICENSE`).
   - Crear `public/config.example.php`.
   - Crear `public/send-email.php` con este orden de chequeos:
     1. método y origen (`allowed_origins` o el mismo host);
     2. config presente y SMTP no vacío;
     3. honeypot (falso éxito);
     4. límite por IP;
     5. Turnstile, si hay secreto;
     6. `formType` y `enabled`;
     7. validación (devuelve `fields`);
     8. correlativo;
     9. correo interno con `Reply-To` y confirmación al usuario, con escape HTML y URLs derivadas del host.
   - Agregar `public/data/` a `.gitignore`. El PHP crea `data/` con `.htaccess` `Require all denied`.
8. **Contacto.**
   - `ContactForm.astro` pasa a `client:visible`.
   - `ContactFormReact` gana el estado (`idle | sending | success | error`), el honeypot oculto, Turnstile, la validación al enviar y el foco en el primer error.
   - Con éxito, el formulario se reemplaza por el estado de éxito, y "Enviar otro mensaje" limpia y vuelve.
9. **Servicio técnico.** Lo mismo en `ServiceForm.astro` y `ServiceFormReact`.
10. **Cotización.**
    - `Header.astro` pasa `global.quote` a `HeaderReact` → `QuoteModal`.
    - El modal gana la casilla de consentimiento, la línea `recipientNote`, la validación, el envío con `product` y `productUrl`, y el estado "¡Solicitud enviada!" con "Cerrar".
    - Al cerrar y volver a abrir, el modal empieza limpio.
11. **Documentación.**
    - `CLAUDE.md` gana la sección "Formularios": piezas, `formConfig`, `site-config.php`, cómo activar SMTP y Turnstile, sin datos guardados, y qué pasa sin backend.
    - Se suma `formConfig` a la lista de colecciones.
    - El estado del servicio técnico de la SPEC 08 se actualiza.

## Criterios de aceptación

**Sitio (verificables sin PHP):**

- [ ] `npm run build` y `npm run check:standard` terminan sin errores.
- [ ] `dist/` contiene `send-email.php`, `config.example.php`, `phpmailer/` y `form-config.json`, y **no** contiene `site-config.php` ni `data/`.
- [ ] `/form-config.json` lista los tres `formType` con su `enabled` y sus `recipients` de Tina, sin `label`.
- [ ] Contacto y Servicio técnico cargan su isla en producción (`client:visible`), y el botón es `type="submit"`.
- [ ] Enviar vacío no hace la petición. Cada obligatorio muestra su mensaje bajo el campo, con `aria-invalid="true"`, y el foco va al primer campo inválido.
- [ ] Un correo o un teléfono con formato inválido muestran su mensaje propio. Un error nunca se comunica solo con color.
- [ ] Sin marcar la casilla de consentimiento no se envía, en los tres formularios.
- [ ] Mientras envía, el botón dice "Enviando…", queda `aria-disabled` y no admite un doble envío.
- [ ] Sin backend (preview de Amplify o `npm run preview`), el envío muestra `errorText` con `role="alert"`, ofrece WhatsApp y conserva lo escrito.
- [ ] El modal de cotización tiene la casilla de consentimiento con enlace a `/politicas-de-privacidad`, y la línea `recipientNote` cuando no está vacía.
- [ ] Al cerrar el modal y abrirlo con otro producto, empieza limpio y con el nombre nuevo.
- [ ] Sin `PUBLIC_TURNSTILE_SITE_KEY`, ninguna página pide `challenges.cloudflare.com`.
- [ ] Desde `/admin` se editan los destinatarios, `enabled` y los textos de éxito y error de los tres formularios.
- [ ] Sin scroll horizontal a 320, 360, 768, 1024 y 1440 px, en los estados de error y de éxito.

**Backend (con PHP 8.2, local o en el servidor cuando el revisor lo autorice):**

- [ ] Sin `site-config.php`, `send-email.php` responde 500 JSON `{ success: false }` sin romperse.
- [ ] Con config y SMTP vacío, responde un error JSON y no intenta conectar.
- [ ] El honeypot `website` con valor responde `{ success: true }` y no envía.
- [ ] El sexto envío desde la misma IP en 10 minutos responde 429.
- [ ] Un origen fuera de `allowed_origins` (y distinto del host) recibe 403.
- [ ] Un payload sin un obligatorio, o con un correo inválido, responde 400 con `fields`.
- [ ] `data/` tiene `.htaccess` con `Require all denied`, y ningún archivo de `data/` guarda nombre, correo ni teléfono.
- [ ] Con `turnstile_secret` y sin token, responde 400 y no envía.
- [ ] Con credenciales SMTP válidas, llega el correo interno con correlativo y `Reply-To` del usuario, y llega la confirmación a quien llenó el formulario. *(Queda para cuando haya credenciales, en el go-live.)*

## Decisiones

- **Sí: Turnstile programado y apagado.** El revisor pidió no activarlo todavía y dejar todo configurado. Se activa con dos claves y sin tocar código. El PHP falla cerrado solo si hay secreto, como en Eres.
- **No: dejar Turnstile fuera.** Activarlo después obligaría a abrir otra spec y otro PR por algo que el revisor ya decidió usar.
- **Sí: PHPMailer copiado en `public/phpmailer/`, sin Composer.** El revisor pidió enviar desde el correo del cliente (Microsoft 365, SMTP AUTH en el puerto 587 con STARTTLS), y `mail()` no autentica. Es la misma solución de Eres. Es una dependencia nueva: va con su `LICENSE` y se nombra en el PR.
- **No: `mail()` de IONOS.** El correo saldría del hosting y no del buzón del cliente, y la entrega dependería de DMARC.
- **Sí: destinatarios en Tina (`formConfig` → `/form-config.json`).** El cliente cambia correos sin tocar el servidor, como en Eres. Un cambio necesita redeploy. Los correos quedan públicos en el JSON, pero ya son públicos en el sitio (`global.company`).
- **No: destinatarios en `site-config.php`.** Cada cambio obligaría a subir el archivo a mano al servidor.
- **Sí: confirmación a quien llenó el formulario.** Le da constancia y le entrega el correlativo para el seguimiento. Si falla, el envío principal igual cuenta como éxito, como en Eres. El límite por IP acota el abuso de mandar confirmaciones a correos ajenos.
- **Sí: `PUBLIC_FORMS_ENDPOINT`, vacía por defecto.** En producción el PHP corre en el mismo dominio. Los previews pueden apuntar a un PHP real con `allowed_origins`, como Eres. Sin backend, el formulario valida y muestra el error con WhatsApp.
- **No: mock en dev.** Sería código que no llega a producción y puede ocultar diferencias con el PHP real.
- **Sí: no guardar los envíos.** El estándar §8 lo pide, y el correo ya es el registro. En `data/` solo quedan contadores y hashes de IP.
- **No: copiar `saveSubmission` de Eres.** Guarda datos personales en el servidor sin plazo ni aviso.
- **Sí: límite por IP en el PHP (5 cada 10 minutos, IP con hash).** El estándar §8 lo exige y Eres no lo tiene. Un archivo JSON alcanza para este volumen.
- **Sí: CORS restringido a `allowed_origins` o al mismo host.** Eres responde `Access-Control-Allow-Origin: *`, lo que deja usar el endpoint desde cualquier sitio.
- **Sí: validación con las mismas reglas en cliente y servidor.** La del cliente es comodidad y la del servidor es la que protege (§8). El servidor devuelve `fields` para mostrar cada error junto a su campo.
- **Sí: Contacto y Servicio técnico pasan a `client:visible`.** Para enviar necesitan JS en producción. Están debajo del fold, así que se hidratan al llegar.
- **Sí: textos de éxito y error editables en Tina.** Es el criterio de la SPEC 08 (el estado completo en esta spec). Los de cotización van en `global.quote`, porque el modal vive en el header de todas las páginas.
- **Sí: `recipientNote` como texto editable, y no derivado de `formConfig`.** Es una línea de interfaz. Si se derivara de la lista, mostraría varios correos o el `fallback`.
- **Sí: casilla de consentimiento en el modal de cotización.** La Ley 29733 la exige, aunque la referencia no la dibuje. Va con el mismo texto y el mismo estilo que Contacto.
- **Sí: campos fijos en código, y no `dynamicForms`.** Los tres formularios tienen los campos del diseño. Un constructor de formularios en Tina sería excesivo.
- **Sí: correlativos por tipo (`CON-`, `COT-`, `SVT-`).** Sirven para buscar el correo y para responderle al cliente.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El administrador de M365 del cliente no habilita SMTP AUTH, o el tenant lo bloquea con *Security defaults*. | El código no cambia: el error se ve como "no se pudo enviar" y WhatsApp sigue disponible. La alternativa (`mail()` o un relay) se decide en el go-live. |
| `staging` llega a `main` con formularios que muestran error porque no hay credenciales. | El PR lo indica. El checklist del go-live (§10) exige un correo recibido antes de promover a `main`. |
| PHPMailer copiado queda desactualizado frente a vulnerabilidades. | Se fija el tag de la copia en el PR y en `CLAUDE.md`, y se revisa en el go-live junto con `npm audit`. |
| No hay PHP local, así que el backend no se prueba en este PR. | Los criterios del backend quedan separados. Se prueban con PHP 8.2 (local o en el servidor, con autorización), antes del go-live. |
| `data/` sin permisos de escritura en el hosting. | El PHP sigue sin contador ni límite, y registra el problema con `error_log`. No bloquea el envío. |
| Un preview apunta al PHP de producción y manda correos reales al cliente durante QA. | `allowed_origins` vacío por defecto. Se habilita a propósito y se avisa al probar. |
| El `client:visible` suma JS a dos páginas. | Las islas usan solo React y utilidades propias, sin librerías. Se mide con `check:standard` contra el presupuesto de 150 KB. |

## Lo que **no** entra en esta spec

- Subir el backend al servidor ni decidir el hosting de producción (SPEC 13).
- Credenciales reales de SMTP y de Turnstile.
- La prueba con un correo recibido (go-live).
- Mock del backend en dev.
- Formularios configurables en Tina, adjuntos, Libro de Reclamaciones y newsletter.
- Guardar los envíos o un panel para consultarlos.

## Notas de implementación

- **Hook compartido:** además de `FormStatus.tsx`, el estado, la validación, el honeypot y Turnstile de los tres formularios viven en `src/hooks/useFormSubmission.ts`. Así cada formulario solo dibuja sus campos.
- **URL del producto en la cotización:** `ProductCard` y la ficha suman `data-quote-product-url`. Sin ese atributo (por ejemplo, "Asesoría comercial"), se envía la URL de la página desde la que se pidió.
- **Tipografía del éxito:** la escala del UI Kit pone los 24 px en `text-heading-h3`, no en `h4` como decía el borrador de esta spec.
- **"Cerrar" del éxito de cotización:** `btn-secondary` es rojo en este proyecto. Se usa `btn` con borde y texto `brand-secondary-dark`, como la referencia.
- **`location` es obligatorio también en el PHP.** Si el editor vacía las opciones de "Ubicación" en Tina, el campo deja de mostrarse y el envío de Contacto falla con un error de campo. No se cubrió ese caso para no relajar la regla.
- **PHPMailer 7.1.1** (último release, 2026-05-18), con su `LICENSE` (LGPL 2.1) y un `.htaccess` que niega el acceso directo a la carpeta.
- **Build local sin claves de Woo:** el `.env` local tiene `WOO_STORE_URL` sin claves, y el build falla a propósito. Para probar se corrió `WOO_STORE_URL= npm run build:local` (catálogo vacío).
- **Peso:** `check:standard` marca 152 KB de JS en la home, el mismo valor que `staging` antes de esta rama (aviso previo de la SPEC 06).

## QA realizada

- `npm run build:local` (con `WOO_STORE_URL` vacío), `tsc --noEmit` sin errores en `src/` y `npm run check:standard`: 0 errores y 2 avisos previos (`og:image` y JS de la home).
- `dist/` trae `send-email.php`, `config.example.php`, `phpmailer/` y `form-config.json`, y no trae `site-config.php` ni `data/`. `form-config.json` lista los tres formularios sin `label`.
- Playwright sobre `astro preview` (2026-10-10), 31 comprobaciones en verde:
  - Contacto: vacío no hace la petición y marca 7 campos con `aria-invalid`, con el foco en el primero y el error enlazado por `aria-describedby`; mensajes propios de correo y teléfono; sin consentimiento no envía; sin backend muestra la alerta con WhatsApp y conserva lo escrito; "Enviando…" con `aria-disabled`; éxito con endpoint simulado y "Enviar otro mensaje" vuelve limpio.
  - Sin scroll horizontal a 320, 360, 768, 1024 y 1440 px en el estado de error, y a 320 y 1440 px en el de éxito.
  - Servicio técnico: vacío marca 10 campos; sin backend, alerta con WhatsApp.
  - Cotización ("Cotiza aquí"): consentimiento con enlace a `/politicas-de-privacidad`, línea `recipientNote`, 5 errores al enviar vacío, reabre limpio, éxito con "Cerrar" y payload con `product`, `productUrl`, `consent` y honeypot vacío.
  - Sin `PUBLIC_TURNSTILE_SITE_KEY`, ninguna petición a `challenges.cloudflare.com`.
- **Sin verificar:**
  - Los criterios del backend: no hay PHP en el entorno local y no se tocó el servidor.
  - La edición en `/admin`.
  - Las fichas de producto con catálogo real (el build local va sin Woo).

