# SPEC 18 — Validaciones y placeholders de formularios

> **Status:** Aprobado
> **Depends on:** SPEC 01 (catálogo de Woo), SPEC 08 (servicio técnico), SPEC 11 (envío de formularios)
> **Date:** 2026-10-24
> **Objective:** Agregar placeholders, límites de longitud y formato, y una lista de marcas de WooCommerce a los formularios de Contacto, Servicio técnico y Cotización.

## Por qué existe esta spec

- Hoy todos los campos de texto comparten un máximo de 120 caracteres y el mensaje uno de 3000. No hay mínimos, así que "a" pasa como nombre.
- El teléfono acepta de 7 a 15 dígitos. En Perú un número con código de país tiene como máximo 11.
- Los campos de Contacto y Servicio técnico no tienen placeholder: el usuario no ve qué formato se espera.
- La marca en Servicio técnico es texto libre. Llegan variantes de una misma marca ("Schiller", "SCHILLER", "shiller") y el equipo tiene que interpretarlas.
- El pulso del botón de WhatsApp y el pop-up de promoción se pidieron junto con esto, pero van en la SPEC 19.

## Scope

**Entra:**

- `src/utils/formValidation.ts`: mínimo y máximo por campo, el tipo `name` (solo letras), teléfono de 7 a 11 dígitos sin otros caracteres, mensajes de error nuevos y una función para validar un solo campo.
- `public/send-email.php`: las mismas reglas en `FORMS` y en `validateSubmission`. `FORM_FIELDS` y `FORMS` cambian juntos.
- `src/hooks/useFormSubmission.ts`: revalidación al salir de un campo (*blur*) después del primer intento de envío, y la composición del valor de "Otra marca".
- `src/components/contact/ContactFormReact.tsx`: placeholders, `maxLength`, `inputMode="numeric"` en el teléfono y el mensaje de 160 px con contador `0/500`.
- `src/components/service/ServiceFormReact.tsx`: lo mismo, más la marca como `<select>` con "Otra marca".
- `src/lib/woo/store.ts`: `getBrands()` con todas las marcas de `products/brands`.
- `src/components/service/ServiceForm.astro` y `src/pages/servicio-tecnico.astro`: pasan la lista de marcas a la isla.
- `src/components/shared/QuoteModal.tsx`: las validaciones nuevas, `maxLength` e `inputMode`, sin cambiar su diseño ni sus placeholders.
- `src/components/shared/FormStatus.tsx`: el contador de caracteres, reutilizable.
- `CLAUDE.md`: la sección **Formularios** con las reglas y dónde viven.

**Fuera de alcance (para specs futuras):**

- Pulso del botón de WhatsApp (SPEC 19).
- Pop-up de promoción (SPEC 19).
- Etiquetas visibles en el modal de cotización: sigue usando el placeholder como etiqueta.
- Validación en vivo mientras se escribe.
- Validar en el PHP que la marca exista en Woo: el servidor solo valida el largo.
- Teléfonos internacionales de más de 11 dígitos.
- El envío de correos en producción, bloqueado por el MFA del buzón (decisión pendiente aparte).

## Modelo de datos

### Reglas por campo

```ts
// src/utils/formValidation.ts
interface FieldRule {
  required?: boolean;
  kind?: "name" | "email" | "phone" | "message";
  minLength?: number; // solo aplica si el campo tiene valor
  maxLength: number;
}
```

| Formulario | Campo | Obligatorio | Tipo | Mín. | Máx. |
|---|---|---|---|---|---|
| Contacto | `firstName` | Sí | `name` | 3 | 50 |
| Contacto | `lastName` | Sí | `name` | 3 | 100 |
| Contacto | `phone` | Sí | `phone` | 7 dígitos | 11 dígitos |
| Contacto | `email` | Sí | `email` | — | 100 |
| Contacto | `position` | No | — | 3 | 50 |
| Contacto | `institution` | Sí | — | 3 | 100 |
| Contacto | `location`, `specialty` | Sin cambios (select) | | | |
| Contacto | `message` | No | `message` | 10 | 500 |
| Servicio técnico | `firstName` | Sí | `name` | 3 | 50 |
| Servicio técnico | `lastName` | Sí | `name` | 3 | 100 |
| Servicio técnico | `email` | Sí | `email` | — | 100 |
| Servicio técnico | `phone` | Sí | `phone` | 7 dígitos | 11 dígitos |
| Servicio técnico | `institution` | Sí | — | 3 | 100 |
| Servicio técnico | `brand` | Sí | — | 2 | 50 |
| Servicio técnico | `model` | Sí | — | 1 | 50 |
| Servicio técnico | `serial` | Sí | — | 1 | 50 |
| Servicio técnico | `message` | Sí | `message` | 10 | 500 |
| Cotización | `name` | Sí | `name` | 3 | 100 |
| Cotización | `institution` | Sí | — | 3 | 100 |
| Cotización | `email` | Sí | `email` | — | 100 |
| Cotización | `phone` | Sí | `phone` | 7 dígitos | 11 dígitos |
| Cotización | `message` | No | `message` | 10 | 500 |
| Cotización | `product`, `productUrl` | Sin cambios (no los escribe el usuario) | | | |

Formatos:

- `name`: letras Unicode (tildes y ñ incluidas), espacios, apóstrofo y guion. Patrón `^[\p{L}\s'-]+$` con la bandera `u`.
- `phone`: solo dígitos, de 7 a 11. Patrón `^\d{7,11}$`. Sin `+`, espacios ni guiones.
- `email`: el patrón actual (`EMAIL_PATTERN`).
- Los mínimos y máximos se cuentan sobre el valor sin espacios al inicio ni al final.

### Mensajes de error

```ts
export const ERROR_MESSAGES = {
  required: "Este campo es obligatorio.",
  tooShort: (min: number) => `Escribe al menos ${min} caracteres.`,
  tooLong: (max: number) => `Escribe como máximo ${max} caracteres.`,
  name: "Usa solo letras, espacios, apóstrofo o guion.",
  email: "Ingresa un correo válido, por ejemplo nombre@institucion.com.",
  phone: "Ingresa un teléfono válido, solo números, de 7 a 11 dígitos.",
  brandOther: "Escribe la marca del equipo.",
  consent: "Debes aceptar la política de datos personales.",
};
```

El PHP usa los mismos textos.

### Marcas

```ts
// src/lib/woo/types.ts
export interface WooBrand {
  slug: string;
  name: string; // decodificado, el que llega al correo
}
```

- `getBrands(): Promise<WooBrand[]>` en `store.ts`, ordenadas por `name` con `localeCompare("es")`.
- Comparte la descarga de `products/brands` que hoy usa `loadBrandLogos`: una sola petición en el build.
- Con `WOO_STORE_URL` vacía devuelve `[]`.
- En el `<select>` el valor de cada opción es el `name`. La última opción es "Otra marca", con valor `otra`.
- Con `otra` elegida aparece el campo `brandOther` (placeholder `Escribe la marca`). Antes de validar y enviar, `useFormSubmission` reemplaza `brand` por el texto de `brandOther`. Al PHP siempre llega un solo campo `brand` con texto.
- Si `brand` es `otra` y `brandOther` está vacío, el error va en `brandOther`.

### Placeholders

| Campo | Placeholder |
|---|---|
| Nombre(s) | `Ej. María` |
| Apellidos | `Ej. Pérez García` |
| Teléfono | `Ej. 987654321` |
| Correo | `nombre@institucion.com` |
| Cargo | `Ej. Jefe de compras` |
| Institución | `Nombre de la institución` |
| Modelo | `Ej. AT-102` |
| Serie | `Ej. 1234567` |
| Mensaje (Contacto) | `Cuéntanos en qué podemos ayudarte` |
| Mensaje (Servicio técnico) | `Describe la falla del equipo` |
| Marca (select) | Primera opción deshabilitada: `Selecciona la marca` |

Viven en el código, junto a la definición de los campos. No van a Tina. El modal de cotización conserva los suyos.

## Plan de implementación

1. **Reglas en el cliente.** En `formValidation.ts`: `FieldRule` con `minLength`, `maxLength` y el tipo `name`; la tabla de reglas; el teléfono de 7 a 11 dígitos; los mensajes nuevos; y `validateField(formType, name, value)`, que reutiliza `validateForm`. Se eliminan `MAX_TEXT_LENGTH` y `MAX_MESSAGE_LENGTH`. Prueba manual: `npm run build` sin errores de tipos.
2. **Reglas en el servidor.** En `send-email.php`: `FORMS` con `min`, `max` y `kind => 'name'`; `validateSubmission` con `mb_strlen`, el patrón de nombre y el de teléfono; y los mismos textos de error. Se eliminan `MAX_TEXT_LENGTH` y `MAX_MESSAGE_LENGTH`; se mantiene `MAX_LINK_LENGTH` para `product` y `productUrl`. Prueba manual: `php -l` sin errores.
3. **Hook.** En `useFormSubmission.ts`: tras el primer intento de envío, `handleBlur` revalida el campo que se dejó con `validateField` y actualiza solo su error. `readValues` reemplaza `brand` por `brandOther` cuando `brand` es `otra`. El contador de caracteres se agrega a `FormStatus.tsx` como `CharacterCount` (`value.length/max`, con `aria-live="polite"`).
4. **Contacto.** En `ContactFormReact.tsx`: placeholders, `maxLength` de la tabla, `inputMode="numeric"` y `pattern="[0-9]*"` en el teléfono, el mensaje de 160 px con `CharacterCount` y `onBlur` en el `<form>`. Prueba manual en `/contacto`.
5. **Marcas desde Woo.** `WooBrand` en `types.ts`, `getBrands()` en `store.ts` sobre la misma descarga que los logos. `servicio-tecnico.astro` la llama y `ServiceForm.astro` pasa `brands` a la isla. Prueba manual: el build lista las marcas en el HTML de `/servicio-tecnico`.
6. **Servicio técnico.** En `ServiceFormReact.tsx`: `brand` pasa a `<select>` con las marcas y "Otra marca"; `brandOther` aparece solo con `otra`; placeholders, `maxLength`, `inputMode` en el teléfono, el mensaje con `CharacterCount` y `onBlur`. Prueba manual en `/servicio-tecnico`.
7. **Cotización.** En `QuoteModal.tsx`: `maxLength` de la tabla, `inputMode="numeric"` en el teléfono, `onBlur` y `maxLength={500}` en el mensaje. Sin cambios visuales.
8. **Documentación.** `CLAUDE.md`, sección **Formularios**: las reglas viven en `FORM_FIELDS` y en `FORMS` del PHP; la marca de Servicio técnico sale de `getBrands()`; y "Otra marca" llega como texto en `brand`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores y `php -l public/send-email.php` no reporta errores.
- [ ] En Contacto, "Ma" en Nombre muestra "Escribe al menos 3 caracteres." al enviar.
- [ ] En Contacto, no se pueden escribir más de 50 caracteres en Nombre ni más de 100 en Apellidos.
- [ ] En Contacto, "María José" y "O'Connor-Díaz" son nombres válidos, y "María2" muestra el error de solo letras.
- [ ] El teléfono `987654321` es válido. `123456`, `123456789012` y `+51 987654321` muestran el error de teléfono.
- [ ] En mobile, el teléfono abre el teclado numérico.
- [ ] Cargo vacío pasa, y "ab" en Cargo muestra el error de mínimo.
- [ ] El mensaje de Contacto vacío pasa, "Hola" muestra el error de mínimo, y no se pueden escribir más de 500 caracteres.
- [ ] El contador del mensaje muestra `0/500` al cargar y se actualiza al escribir.
- [ ] Después del primer envío fallido, corregir un campo y salir de él borra su error sin volver a enviar.
- [ ] Antes del primer envío, salir de un campo vacío no muestra errores.
- [ ] Todos los campos de texto de Contacto y Servicio técnico muestran el placeholder de la tabla.
- [ ] En Servicio técnico, la marca es un `<select>` con las marcas de Woo en orden alfabético y "Otra marca" al final.
- [ ] Al elegir "Otra marca" aparece "Escribe la marca"; si se envía vacío, el error aparece en ese campo.
- [ ] Con "Otra marca" y el texto "Mindray", el correo interno muestra `Marca: Mindray`.
- [ ] Con una marca de la lista, el correo interno muestra su nombre, no el slug.
- [ ] Con `WOO_STORE_URL` vacía, el `<select>` muestra solo "Otra marca" y el build no falla.
- [ ] En el modal de cotización, "Al" en Nombre y apellido muestra el error de mínimo, y el diseño no cambia.
- [ ] Un `POST` directo a `send-email.php` con `firstName: "a"` responde `400` con el error en `fields.firstName`, sin enviar correo.
- [ ] Un `POST` directo con `phone: "+51 987654321"` responde `400` con el error en `fields.phone`.
- [ ] `CLAUDE.md` describe las reglas y el origen de las marcas.

## Decisiones

- **Sí:** las mismas reglas por tipo de campo en los tres formularios. Un nombre es un nombre en cualquier formulario.
- **Sí:** el mínimo solo aplica si el campo tiene valor. Cargo y Mensaje siguen siendo opcionales donde ya lo eran.
- **Sí:** teléfono solo con dígitos, de 7 a 11. Lo pidió el cliente; el placeholder y el teclado numérico guían al usuario.
- **No:** aceptar `+`, espacios o guiones en el teléfono. Se descartó a pedido del cliente, aunque era más tolerante.
- **Sí:** validar al enviar y, después del primer intento, al salir de cada campo. Muestra errores cuando el usuario ya intentó enviar, sin interrumpirlo antes.
- **No:** validación en vivo mientras se escribe. Marca errores antes de que el usuario termine de escribir.
- **Sí:** `maxLength` en el HTML. Impide escribir de más en vez de avisar después.
- **Sí:** el PHP repite las reglas. El cliente se puede saltar; el servidor es la única validación confiable.
- **Sí:** todas las marcas de `products/brands`, aunque no tengan productos publicados. El servicio técnico atiende equipos que quizá ya no se venden.
- **No:** solo las marcas con productos, como el filtro del catálogo. Dejaría fuera equipos que el cliente sí repara.
- **No:** las marcas de la Home en Tina. Son una selección curada para mostrar, no el universo de marcas que se atienden.
- **Sí:** "Otra marca" con un campo de texto. Ninguna lista cubre todos los equipos.
- **Sí:** al correo llega el nombre de la marca, no el slug. El equipo lee el correo, no el catálogo.
- **No:** validar en el PHP que la marca exista en Woo. "Otra marca" acepta cualquier texto, y el PHP no tiene acceso al catálogo del build.
- **Sí:** solo letras, espacios, apóstrofo y guion en nombres. Filtra "123" o "asdf@@" sin molestar a usuarios reales.
- **Sí:** placeholders en el código, no en Tina. Los campos ya son fijos en el código (SPEC 11).
- **Sí:** el modal de cotización conserva el placeholder como etiqueta. Es compacto a propósito; un placeholder de ejemplo no puede reemplazar a la etiqueta.
- **Sí:** "Nombre de la institución" como placeholder. Sirve igual para un hospital, una clínica o una empresa.
- **Sí:** el mensaje pasa a 160 px con contador. Se nota que es multilínea y que tiene límite.
- **Sí:** separar el pulso de WhatsApp y el pop-up en la SPEC 19. Tocan otras áreas y el pop-up necesita sus propias decisiones.
- **Sí:** definición rápida a partir de la sección de cabecera. El usuario pidió asumir el resto de las secciones después de aclarar las preguntas.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Las reglas del cliente y del PHP se desincronizan. | Las dos tablas se editan en el mismo commit. `CLAUDE.md` y un comentario en cada archivo lo recuerdan, y dos criterios de aceptación prueban el PHP directo. |
| Un nombre con punto ("Ma. José") o con caracteres no latinos raros falla. | Se acepta. El usuario puede escribir "María José". Si llegan quejas, se agrega el punto al patrón. |
| Un cliente del extranjero tiene un número de más de 11 dígitos. | Le queda el WhatsApp del mensaje de error. Teléfonos internacionales quedan fuera de alcance. |
| `products/brands` falla en el build. | Es la misma petición que ya hace `loadBrandLogos`: si falla, el build ya falla hoy por diseño (SPEC 01). |
| El envío de correos en producción sigue bloqueado por el MFA del buzón. | No depende de esta spec. Las validaciones se prueban con respuestas `400`, que no envían correo. |

## Lo que **no** entra en esta spec

- Pulso del botón de WhatsApp y pop-up de promoción (SPEC 19).
- Etiquetas visibles en el modal de cotización.
- Validación en vivo mientras se escribe.
- Validar la marca contra Woo en el servidor.
- Teléfonos internacionales de más de 11 dígitos.
- La solución al envío de correos bloqueado por MFA.
