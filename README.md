# Medical Digital

Medical Digital cuida la salud del Perú con tecnología médica de marcas líderes en diagnóstico y soporte vital.

Sitio estático construido con **Astro 5** (islas de **React 19**) y **TinaCMS 2**
como CMS sobre git: el contenido son archivos versionados en `src/content/`, así
que cada edición desde el panel es un commit.

## Requisitos

- Node 20 o superior

## Empezar

```bash
cp .env.example .env     # deja TINA_CLIENT_ID/TOKEN vacíos para modo local
npm install
npm run dev              # sitio en :4321 y panel del CMS en /admin
```

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | TinaCMS + Astro juntos (el panel necesita ambos) |
| `npm run build` | `tinacms build` y luego `astro build` → `dist/` |
| `npm run build:local` | Build sin credenciales de TinaCloud, para verificar |
| `npm run preview` | Sirve el build de producción |
| `npm run typecheck` | `tsc --noEmit` — va **después** de un build |
| `npm run check:standard` | Audita `dist/` contra el Estándar de desarrollo web |

### Antes de mergear a `main`

```bash
npm run build          # de producción: build:local infla el peso del JS
npm run typecheck
npm run check:standard
```

`check:standard` revisa secretos en el build, `.env` versionado, el SEO
obligatorio y los presupuestos de peso. **Los errores bloquean**; los avisos se
revisan. El aviso de `og:image` es esperado hasta que subas una imagen de
1200×630 desde el panel.

Lo mismo corre solo en GitHub: en cada PR hacia `main` (¿se puede mergear?) y en
cada push a `main` (¿se puede desplegar?). Ver `.github/workflows/estandar.yml`.

## Estructura

```
src/
  components/     # una pareja Componente.astro + ComponenteReact.tsx por sección
  content/        # el contenido editable (JSON/MDX) — esto es lo que edita el CMS
  layouts/        # BaseLayout.astro: <head>, header, footer, SEO
  pages/          # una ruta por archivo
  styles/         # global.css (Tailwind + clases reutilizables)
  utils/          # helpers de i18n, media y formularios
tina/
  config.ts       # schema del CMS (índice de colecciones)
  collections/    # una colección por archivo
public/           # assets servidos tal cual
```

## Editar contenido

Con `npm run dev` corriendo, entra a `/admin`. Cada cambio guardado escribe el
archivo correspondiente en `src/content/` y queda como commit en la rama activa.


## Flujo de trabajo

Ramas desde `staging`: `feat/`, `fix/`, `chore/` + descripción corta en
minúsculas y con guiones. Commits en formato Conventional Commits
(`feat: agrega formulario de contacto`). Detalle completo en `CLAUDE.md`.
