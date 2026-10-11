# SPEC 15 — Íconos de especialidades

> **Status:** Implementado
> **Depends on:** SPEC 03 (mega menú y panel ☰), SPEC 12 (ajustes visuales)
> **Date:** 2026-10-11
> **Objective:** Mostrar en el header y en la Home los íconos que entregó diseño para Cardiología, Emergencia y Diagnóstico respiratorio.

## Por qué existe esta spec

- Diseño entregó tres íconos de especialidad en `~/code/twnstudios/iconitos/` (SVG de 32×32, trazo fino como Phosphor Light).
- Diagnóstico respiratorio usa la opción `lungs`, que hoy dibuja `PiWindLight`, un ícono de viento: Phosphor en `react-icons` 5 no tiene pulmones.
- Emergencia usa `PiAmbulanceLight`, sin la sirena del diseño, y Cardiología usa `PiHeartLight`, un corazón sin pulso.

## Ajustes

| Especialidad | Hoy | Después |
|---|---|---|
| Cardiología (`cardiologia`) | `heart` → `PiHeartLight` | `heart-pulse` → `HeartPulseIcon` (corazón con pulso) |
| Emergencia (`emergencia`) | `ambulance` → `PiAmbulanceLight` | `ambulance-siren` → `AmbulanceSirenIcon` (ambulancia con sirena) |
| Diagnóstico respiratorio (`diagnostico-respiratorio`) | `lungs` → `PiWindLight` | `lungs` → `LungsIcon` (pulmones) |

## Scope

**In:**

- `src/components/shared/designIcons.ts`: los tres SVG como `IconType` con `GenIcon` de `react-icons`.
- `src/components/shared/Icon.tsx`: `heart-pulse` y `lungs` pasan a los íconos de diseño; se suma `ambulance-siren`.
- `src/lib/icons.ts`: opción "Ambulancia con sirena"; "Pulso" pasa a "Corazón con pulso" y "Respiración" a "Pulmones".
- `src/content/global/index.json` (`categoryIcons`): cardiología y emergencia con los valores nuevos.

**Fuera de alcance:**

- Íconos del resto de especialidades, de "Conoce más", de `/nosotros` y de la ficha.
- Subir íconos desde Tina (campo `image` por categoría).

## Modelo de datos

Sin cambios de schema. `categoryIcons[].icon` sigue siendo un `string` con las opciones de `ICON_OPTIONS`; se agrega el valor `ambulance-siren`.

## Plan de implementación

1. Generar `designIcons.ts` con un script temporal fuera del repo que copia los `d` de cada SVG sin modificarlos.
2. Registrar los íconos en `Icon.tsx` y la opción nueva en `src/lib/icons.ts`.
3. Cambiar `cardiologia` y `emergencia` en `global/index.json`.
4. Documentar en `CLAUDE.md` (sección de íconos).

## Criterios de aceptación

- [ ] El mega menú, el panel ☰ (desktop y mobile) y Especialidades de la Home muestran los tres íconos de diseño en `text-brand-primary`, al mismo tamaño que los demás.
- [ ] Los íconos se ven nítidos a 24, 32 y 48 px y no se recortan.
- [ ] En Tina, "Íconos por categoría de productos" ofrece "Corazón con pulso", "Ambulancia con sirena" y "Pulmones".
- [ ] Las demás categorías no cambian.
- [ ] `npm run build` pasa sin errores ni warnings nuevos.

## Decisiones

- **Sí:** usar los SVG de diseño, porque Phosphor no tiene pulmones y su ambulancia no tiene sirena. Mismo criterio que Eres (SPEC 15 de Eres): SVG inline cuando diseño lo entrega, `react-icons` parecido cuando no.
- **Sí:** el corazón de diseño en vez de `PiHeartbeatLight`, para que las tres especialidades usen el dibujo que entregó diseño.
- **Sí:** `GenIcon` de `react-icons`, porque los íconos se comportan igual que los de Phosphor (`1em`, `currentColor`, `className`) sin dependencia nueva ni cambios en los componentes que los usan.
- **Sí:** `fill="currentColor"` en vez del `fill="black"` del SVG, para que tomen el color de la clase.
- **Sí:** reusar `heart-pulse` y `lungs` en vez de crear valores nuevos: `heart-pulse` no se usaba y `lungs` dibujaba un ícono equivocado.
- **No:** los SVG en `public/` con `<img>`, porque no heredan el color y suman un pedido por ícono.
- **No:** `react-icons/tb` u otra familia con pulmones, porque el UI Kit usa Phosphor Light y el trazo no coincide.
- **No:** subir los íconos desde Tina, porque cambia el schema y el editor ya elige de una lista.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Otro bloque usa `heart-pulse` o `lungs` y cambia sin querer | `grep` en `src/content/`: solo `categoryIcons` los usa |
| El trazo de diseño se ve distinto al de Phosphor junto a otros íconos | Diseño los dibujó a 32 px con trazo de Phosphor Light; se revisa en el preview |

## Lo que **no** entra en esta spec

- Rediseño de los íconos del resto de especialidades.
- Íconos subidos por el editor.

## Notas de implementación

- **`clipRule` y `fillRule` en `evenodd`.** Se copian del SVG de diseño: los íconos son contornos rellenos con huecos.
- **`npm install` antes del build.** `staging` sumó `@fontsource-variable/rubik` (ya en el lockfile).

## QA realizada

- `npm run build:local` con `WOO_STORE_URL=` vacía (sin claves de Woo en local): build completo, sin errores. Con el catálogo vacío no se dibujan las categorías.
- `renderToStaticMarkup` de los tres íconos: `<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">`, igual que los de Phosphor.
- `npm run typecheck` sin errores.
- `check:standard`: 0 errores. Avisos ajenos a esta spec: páginas sin `og:image` (build sin catálogo) y JS de la home sobre 150 KB.
- Pendiente en el preview de Amplify (con el catálogo real): los tres íconos en el mega menú, el panel ☰ y la Home, a 360 px y en desktop.
