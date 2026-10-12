# SPEC 16 — Pase a producción en la raíz compartida con WordPress

> **Status:** Aprobado
> **Depends on:** SPEC 01 (catálogo de Woo), SPEC 11 (envío de formularios), SPEC 14 (indexación por entorno)
> **Date:** 2026-10-11
> **Objective:** Publicar el sitio Astro en `medicaldigitalperu.com`, en la misma carpeta `httpdocs` que WordPress, con deploy automático en cada push a `main`, en cada cambio de producto en WooCommerce y una vez al día.

## Por qué existe esta spec

- **Cambia dónde vive producción.** `CLAUDE.md` y SPEC 14 asumen la rama `main` de Amplify. Amplify no ejecuta PHP y los formularios de SPEC 11 lo necesitan: producción pasa al Plesk del cliente.
- **La raíz se comparte con WordPress.** `WOO_STORE_URL` es `https://medicaldigitalperu.com`: `httpdocs` ya contiene el WordPress del que sale el catálogo. Astro pasa a servir el sitio público. WordPress queda para `wp-admin`, `wp-json` y `wp-content`.
- **Hoy un cambio en Woo no llega al sitio sin un redeploy manual.** El webhook de productos lo automatiza.
- **No existe workflow de deploy.** Solo `estandar.yml`. `main` está 44 commits detrás de `staging`.
- **El servidor no es el de ERES.** Es Plesk con nginx delante y PHP 8.2, no Hostinger con LiteSpeed. El patrón se mantiene; las reglas del servidor se verifican antes de pegarlas.
- **No hay checkout.** Medical Digital no vende en línea: no hay `woo-api.php`, carrito, Culqi ni página de gracias. Todo lo de ERES que existe por el checkout queda fuera.

La referencia es `specs/21-pase-a-produccion.md` del repo `eres-skin-studio`.

Lo que se verificó antes de escribirla (2026-10-11):

- `https://medicaldigitalperu.com/` lo responde WordPress (`server: nginx`, `x-powered-by: PleskLin`, PHP 8.2.34). `www` redirige con `301` al dominio sin `www`.
- WordPress publica `/producto/<slug>/` (46 productos), `/categoria-producto/<slug>/` (7 categorías) y `/marca/<slug>/`.
- Sus páginas `/productos/`, `/marcas/`, `/nosotros/`, `/contacto/`, `/terminos-y-condiciones/` y `/politicas-de-privacidad/` tienen la misma ruta que las de Astro.
- `robots.txt` y `sitemap_index.xml` los genera Yoast.
- La ficha de Astro usa el `slug` de Woo (`src/pages/productos/[slug].astro`): la redirección de `/producto/<slug>/` no necesita tabla de equivalencias.
- `staging.medicaldigitalperu.com` tiene carpeta en el Plesk y no resuelve por DNS.
- El repo no tiene `public/.htaccess`, `rebuild-hook.php` ni workflow de deploy.

Lo que **no** se pudo verificar y es el primer paso de la guía:

- Si el usuario del dominio tiene acceso SSH y si `rsync` existe en su shell.
- Si nginx trabaja en modo proxy delante de Apache (el `.htaccess` manda) o solo (no hay `.htaccess`).
- Si WordPress tiene un plugin de caché de página.

## Topología

| Ruta | Quién la sirve |
|---|---|
| `/`, `/nosotros/`, `/contacto/`, `/marcas/`, `/servicio-tecnico/`, `/productos/…`, `/noticias/…`, `/terminos-y-condiciones/`, `/politicas-de-privacidad/`, `/admin/` (Tina), `/_astro/`, `/uploads/`, `/robots.txt`, `/sitemap-index.xml`, `/search-index.json`, `/form-config.json` | Astro (archivos estáticos) |
| `/send-email.php`, `/rebuild-hook.php`, `/phpmailer/` | PHP del sitio Astro |
| `/wp-admin/`, `/wp-login.php`, `/wp-json/…`, `/wp-content/…`, `/wp-includes/…`, `/wp-cron.php`, `/xmlrpc.php` | WordPress |
| `/?rest_route=…`, `/?p=…`, `/?page_id=…`, `/?preview=…` | WordPress |
| `/producto/<slug>/`, `/categoria-producto/<slug>/`, `/marca/<slug>/`, `/sitemap_index.xml` | Redirección `301` a su equivalente en Astro |
| Cualquier otra URL que no exista | `404.html` de Astro |

Una carpeta real de Astro (`nosotros/`) gana sola a la página de WordPress del mismo nombre: la regla de WordPress solo actúa si la ruta no existe en disco.

Entornos después del pase:

| Entorno | Dónde | Rama | Indexable |
|---|---|---|---|
| Producción | Plesk, `httpdocs` de `medicaldigitalperu.com` | `main` | Sí |
| Staging y previews de PR | Amplify | `staging` y PRs | No |

## Scope

**Entra:**

- Archivo nuevo `.github/workflows/deploy.yml`: build de `main`, verificación de nombres protegidos, `rsync` por SSH y prueba de humo.
- Archivo nuevo `public/rebuild-hook.php`: recibe los webhooks de producto de WooCommerce y dispara el deploy en GitHub Actions.
- En `public/config.example.php`: las claves `webhook_secret`, `github_repo` y `github_token`.
- Archivo nuevo `wordpress/htaccess-astro.conf`: el bloque que se pega a mano en el `.htaccess` del servidor, en dos partes.
- Archivo nuevo `wordpress/htaccess-reversa.conf`: el bloque que devuelve el sitio de WordPress sin borrar archivos.
- Archivo nuevo `wordpress/nginx-astro.conf`: las mismas reglas como directivas de nginx, para el caso de que el modo proxy esté apagado.
- Archivo nuevo `wordpress/README.md`: la guía escrita del pase, paso a paso, con las fases de esta spec.
- Actualización de `CLAUDE.md`: producción en Plesk, el webhook, y la nota de `SITE_URL` en la rama `main` de Amplify.
- Actualización del comentario de `SITE_URL` en `.env.example`.
- Orden del pase en tres fases (preparación, pase, cierre) y reversa.

**Fuera de alcance (para futuras specs):**

- Limpieza de WordPress: desactivar o borrar Elementor, los plugins Jet, Yoast, páginas, entradas y temas. WordPress queda intacto e invisible.
- Checkout, carrito, `woo-api.php`, mu-plugins y página de gracias. Medical Digital no vende en línea.
- Activar Turnstile. Sigue programado y apagado.
- Mover staging a `staging.medicaldigitalperu.com`. Staging sigue en Amplify.
- Que el workflow edite el `.htaccess` o la configuración de nginx del servidor.
- Deploy por FTP.
- Alta en Search Console y envío del sitemap (SPEC 14 ya lo lista como tarea manual).
- Actualizar WordPress, WooCommerce o sus plugins.
- Reescribir SPEC 01, 11 y 14. Quedan como registro histórico.

## Data model

Esta spec no cambia el contenido de Tina ni los tipos de `src/lib/woo/types.ts`. Introduce configuración de servidor y de CI.

### `site-config.php` (claves nuevas)

`rebuild-hook.php` lee el mismo `site-config.php` que `send-email.php`. Se agregan a `public/config.example.php`:

```php
// Rebuild por webhook de WooCommerce (rebuild-hook.php). Con alguna vacía, el relevo responde 503.
'webhook_secret' => '',                              // openssl rand -hex 32; el mismo que va en los webhooks de Woo
'github_repo'    => 'sagarkishnani/medical-digital',
'github_token'   => '',                              // token fine-grained: Contents read and write, solo este repo
```

### `rebuild-hook.php`

| Petición | Respuesta |
|---|---|
| Método distinto de `POST` | `405` |
| Falta `site-config.php` o alguna de las tres claves | `503` "Rebuild no configurado." |
| Cuerpo mayor de 262144 bytes | `413` |
| Ping de Woo al guardar el webhook (`webhook_id=N`, sin tema) | `200` "pong", sin llamar a GitHub |
| Firma `X-WC-Webhook-Signature` inválida (HMAC-SHA256 del cuerpo, en base64) | `401` |
| Tema que no empieza con `product.` | `200` "Tema ignorado." |
| Tema `product.*` con firma válida | `POST https://api.github.com/repos/<github_repo>/dispatches` con `event_type: "woo-catalog-changed"` y `client_payload: { topic, id }`. Responde `200` "Rebuild disparado." |
| GitHub no responde `204` | `error_log` y `200` "Rebuild no disparado." (Woo desactiva el webhook tras varias entregas fallidas) |

El cuerpo siempre es JSON: `{ "ok": boolean, "message": string }`. No escribe nada en disco.

### `deploy.yml`

Nombre: "Deploy a producción". Disparadores:

| Evento | Cuándo |
|---|---|
| `push` a `main` | Cada merge |
| `repository_dispatch` con tipo `woo-catalog-changed` | Cada webhook de producto |
| `schedule` `0 9 * * *` | 04:00 de Lima, por si se pierde un webhook |
| `workflow_dispatch` | A mano |

`concurrency: { group: deploy, cancel-in-progress: true }`. Siempre compila `ref: main`.

Variables del build:

| Variable | Valor |
|---|---|
| `TINA_CLIENT_ID`, `TINA_TOKEN` | Secrets |
| `TINA_BRANCH` | `main` (fijo en el workflow) |
| `SITE_URL` | `https://medicaldigitalperu.com` (fijo en el workflow) |
| `WOO_STORE_URL`, `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET` | Secrets |
| `PUBLIC_FORMS_ENDPOINT`, `PUBLIC_TURNSTILE_SITE_KEY`, `DEPLOY_BASE` | No se definen |

Secrets de GitHub nuevos:

| Nombre | Valor |
|---|---|
| `WOO_STORE_URL` | `https://medicaldigitalperu.com` |
| `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET` | Clave de solo lectura de Woo |
| `PLESK_SSH_HOST` | Host o IP del servidor |
| `PLESK_SSH_PORT` | Puerto SSH (normalmente `22`) |
| `PLESK_SSH_USER` | Usuario del sistema del dominio |
| `PLESK_SSH_KEY` | Clave privada creada solo para el deploy |
| `PLESK_DEPLOY_PATH` | Ruta absoluta de `httpdocs`, por ejemplo `/var/www/vhosts/medicaldigitalperu.com/httpdocs` |

`TINA_CLIENT_ID` y `TINA_TOKEN` ya existen en Amplify; se copian a los Secrets de GitHub si no están.

### Nombres protegidos

El workflow falla, sin subir nada, si `dist/` contiene en su raíz alguno de estos nombres:

```
wp-admin  wp-content  wp-includes  index.php  xmlrpc.php  wp-*.php  .well-known  cgi-bin
```

### Qué sube el `rsync`

- **Raíz:** `dist/` completo, **sin** `--delete`. Excluye `/.htaccess`, `/*.example.php`, `site-config.php` y `/data/`.
- **Carpetas de Astro:** un `rsync --delete` por cada carpeta de primer nivel de `dist/` (`_astro/`, `admin/`, `uploads/`, `productos/`, `noticias/`, `phpmailer/`…), para retirar las páginas que ya no existen. `data/` se salta.

Nunca se borra nada en la raíz de `httpdocs`. `site-config.php`, `data/` y el `.htaccess` se mantienen a mano en el servidor.

### Prueba de humo

Contra `https://medicaldigitalperu.com`, al final del workflow:

| Petición | Resultado esperado |
|---|---|
| `GET /` | `200` y el HTML contiene `/_astro/` |
| `GET /robots.txt` | `200` y contiene `sitemap-index.xml` |
| `GET /wp-json/` | `200` con `Content-Type: application/json` |
| `GET /rebuild-hook.php` | `405` |
| `GET /producto/prueba-de-humo/` | `301` con `Location` a `/productos/prueba-de-humo/` |
| `GET /ruta-que-no-existe-md/` | `404` |

Si una falla, el job termina en rojo. No hay reversa automática.

### Bloque de Astro en el `.htaccess`

Va **arriba** de `# BEGIN WordPress`, entre sus propios marcadores.

```apache
# BEGIN Medical Digital Astro
# --- Parte previa ---
DirectoryIndex index.html index.php

<IfModule mod_rewrite.c>
RewriteEngine On

# WordPress usa la raíz con estos parámetros; la raíz ahora es el index.html de Astro.
RewriteCond %{QUERY_STRING} (^|&)(rest_route|p|page_id|preview)= [NC]
RewriteRule ^$ /index.php [L]
</IfModule>

# --- Parte definitiva ---
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteRule ^producto/([^/]+)/?$ /productos/$1/ [R=301,L]
RewriteRule ^categoria-producto/(?:.+/)?([^/]+)/?$ /productos/categoria/$1/ [R=301,L]
RewriteRule ^marca/([^/]+)/?$ /productos/?marca=$1 [R=301,L]
RewriteRule ^sitemap_index\.xml$ /sitemap-index.xml [R=301,L]

# Lo que no existe y no es de WordPress responde el 404 de Astro, no el del tema.
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(wp-json|wp-admin|wp-content|wp-includes)(/|$)
RewriteRule . - [R=404,L]
</IfModule>
# END Medical Digital Astro
```

- **Parte previa:** es inerte mientras no exista `index.html`. Se pega antes del primer deploy.
- **Parte definitiva:** se pega cuando el primer deploy terminó. Antes rompería las páginas de WordPress.

`wordpress/nginx-astro.conf` expresa las mismas reglas (índice, parámetros de la raíz, cuatro redirecciones y 404) para "Directivas adicionales de nginx" de Plesk. Solo se usa si el modo proxy está apagado.

### Bloque de reversa

Reemplaza al bloque de Astro. Fuerza `index.php` en la raíz y en las carpetas que Astro creó:

```apache
# BEGIN Medical Digital Reversa
DirectoryIndex index.php index.html
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule ^(nosotros|contacto|marcas|productos|noticias|servicio-tecnico|terminos-y-condiciones|politicas-de-privacidad)(/.*)?$ /index.php [L]
</IfModule>
# END Medical Digital Reversa
```

### Webhooks en WooCommerce

Cuatro, en WooCommerce → Ajustes → Avanzado → Webhooks:

| Nombre | Tema | URL de entrega | Secreto | Versión |
|---|---|---|---|---|
| Astro · producto creado | Producto creado | `https://medicaldigitalperu.com/rebuild-hook.php` | `webhook_secret` | WP REST API Integration v3 |
| Astro · producto actualizado | Producto actualizado | ídem | ídem | ídem |
| Astro · producto eliminado | Producto eliminado | ídem | ídem | ídem |
| Astro · producto restaurado | Producto restaurado | ídem | ídem | ídem |

## Implementation plan

### Parte A — Cambios en el repo

Rama `feat/spec-16-pase-a-produccion` desde `staging`, con PR contra `staging`.

1. Agregar `webhook_secret`, `github_repo` y `github_token` a `public/config.example.php`.
2. Crear `public/rebuild-hook.php` según la tabla del modelo de datos. Prueba manual con `php -S`: un `GET` responde `405`; un `POST` sin `site-config.php` responde `503`; con un `site-config.php` local, un `POST` con firma inválida responde `401` y el cuerpo `webhook_id=1` responde `200` "pong".
3. Crear `.github/workflows/deploy.yml` con los disparadores, el build y la verificación de nombres protegidos. Todavía sin subir.
4. Agregar a `deploy.yml` los pasos "Configurar SSH" y "Subir a Plesk" con las exclusiones del modelo de datos.
5. Agregar a `deploy.yml` el paso "Prueba de humo".
6. Crear `wordpress/htaccess-astro.conf` con las dos partes señaladas por comentarios.
7. Crear `wordpress/htaccess-reversa.conf`.
8. Crear `wordpress/nginx-astro.conf`.
9. Escribir `wordpress/README.md`: la guía numerada con las Partes B, C y D y la reversa de esta spec, más las tablas de Secrets y de webhooks. Cada paso dice en qué pantalla de Plesk, GitHub o WordPress se hace y cómo comprobarlo.
10. Actualizar `CLAUDE.md`: sección nueva "Producción" (Plesk, raíz compartida, `deploy.yml`, webhook y cron), la viñeta "Un cambio en Woo no aparece hasta el siguiente deploy", la viñeta "Endpoint" de Formularios y el párrafo de `SITE_URL` en la rama `main` de Amplify.
11. Actualizar el comentario de `SITE_URL` en `.env.example`.

### Parte B — Preparación (días antes, sin efecto visible)

1. Respaldo completo desde Plesk: archivos de `httpdocs` y base de datos.
2. Verificar el servidor web: Plesk → Sitios web y dominios → Configuración de Apache y nginx → "Modo proxy". Activo: se usa `htaccess-astro.conf`. Apagado: se usa `nginx-astro.conf`.
3. Habilitar SSH: Plesk → Acceso a hosting web → Acceso SSH → `/bin/bash`. Crear un par de claves solo para el deploy y autorizar la pública en `.ssh/authorized_keys`.
4. Comprobar desde la máquina local `ssh <usuario>@<host> "rsync --version && pwd"`. Si `rsync` no existe, el pase se detiene aquí (ver Riesgos).
5. Anotar la ruta absoluta de `httpdocs` y listar su raíz. Si aparece un nombre que no esté en la lista de protegidos y pueda chocar con una ruta de Astro, se agrega a la lista antes de seguir.
6. Crear en WooCommerce la clave REST de solo lectura para el deploy, si no se reutiliza la del `.env`.
7. Crear el token fine-grained de GitHub: solo `sagarkishnani/medical-digital`, permiso Contents read and write, vencimiento a 1 año.
8. Cargar los Secrets de GitHub del modelo de datos.
9. Crear `site-config.php` en `httpdocs` desde `public/config.example.php`: SMTP de Microsoft 365, `fallback_email` y las tres claves del webhook.
10. Confirmar que TinaCloud indexa la rama `main` y que `https://medicaldigitalperu.com` está entre las URLs del proyecto.
11. Revisar en WordPress si hay un plugin de caché de página. Si lo hay, se desactiva la caché de página antes del pase.
12. Copiar el `.htaccess` actual como `.htaccess.pre-astro-<fecha>`.
13. Pegar la **parte previa** del bloque de Astro. El sitio de WordPress sigue igual: comprobar la home y una ficha de producto.

### Parte C — Pase (hora de poco tráfico)

1. PR de `staging` a `main` y merge. El push dispara "Deploy a producción".
2. El primer deploy sube los archivos; la prueba de humo falla en la redirección y en el 404, porque falta la parte definitiva. Es lo esperado.
3. Pegar la **parte definitiva** del bloque en el `.htaccess`.
4. Purgar la caché de nginx de Plesk y la del plugin de caché, si existen.
5. Relanzar "Deploy a producción" a mano: la prueba de humo tiene que pasar completa.
6. Crear los cuatro webhooks de producto. Cada uno debe quedar "Activo" después del ping.
7. Editar el nombre de un producto en Woo, comprobar que se dispara el workflow con evento `repository_dispatch` y deshacer el cambio.
8. Enviar los tres formularios (Contacto, Cotización y Servicio técnico) y comprobar el correo al equipo y la confirmación.
9. Entrar a `/admin/`, guardar un cambio menor y comprobar que el commit en `main` dispara el deploy.
10. Recorrer los criterios de aceptación.

### Parte D — Cierre (7 días después, con el pase confirmado)

1. Desactivar el build de la rama `main` en Amplify. Staging y los previews de PR siguen.
2. Borrar `.htaccess.pre-astro-<fecha>` del servidor después de guardar una copia fuera de él.
3. Anotar en el calendario el vencimiento del token de GitHub.

### Reversa

1. Desactivar el workflow "Deploy a producción" en GitHub (Actions → Disable workflow).
2. Reemplazar el bloque de Astro por el de `wordpress/htaccess-reversa.conf`.
3. Purgar las cachés. El sitio de WordPress vuelve a verse sin borrar ningún archivo.
4. Desactivar los cuatro webhooks.

## Acceptance criteria

- [ ] `https://medicaldigitalperu.com/` muestra la home de Astro.
- [ ] `/nosotros/`, `/contacto/`, `/marcas/`, `/productos/`, `/terminos-y-condiciones/` y `/politicas-de-privacidad/` muestran la versión de Astro, no la de WordPress.
- [ ] El HTML de la home no trae `<meta name="robots" content="noindex…">`.
- [ ] `/robots.txt` es el de Astro: no contiene `YOAST` y apunta a `sitemap-index.xml`.
- [ ] `/wp-admin/` abre el login de WordPress y se puede iniciar sesión.
- [ ] `/wp-json/` responde `200` con JSON.
- [ ] `curl -I /producto/<slug-real>/` responde `301` a `/productos/<slug-real>/`, y esa ficha existe.
- [ ] `curl -I /categoria-producto/cardiologia/` responde `301` a `/productos/categoria/cardiologia/`.
- [ ] `curl -I /marca/<slug-real>/` responde `301` a `/productos/?marca=<slug-real>`.
- [ ] `curl -I /sitemap_index.xml` responde `301` a `/sitemap-index.xml`.
- [ ] `curl -I /ruta-que-no-existe/` responde `404` y el cuerpo es el 404 de Astro.
- [ ] `/?utm_source=prueba` muestra la home de Astro.
- [ ] Las imágenes de una ficha de producto cargan desde `/_astro/`.
- [ ] `curl -I /site-config.php` no devuelve su contenido y `/data/` responde `403` o `404`.
- [ ] `/config.example.php` responde `404`.
- [ ] Cada uno de los tres formularios envía el correo y muestra su correlativo (`CON-`, `COT-`, `SVT-`).
- [ ] Guardar un producto en WooCommerce dispara "Deploy a producción" con evento `repository_dispatch`, y el cambio se ve en el sitio cuando termina.
- [ ] Un `POST` a `/rebuild-hook.php` sin firma responde `401` y no dispara ningún workflow.
- [ ] Los cuatro webhooks figuran "Activo" en WooCommerce.
- [ ] Un push a `main` dispara "Deploy a producción" y la prueba de humo pasa.
- [ ] El workflow corre solo a las 04:00 de Lima.
- [ ] Guardar un cambio en `/admin/` de producción crea un commit en `main` y dispara el deploy.
- [ ] Después de dos deploys seguidos, `site-config.php`, el `.htaccess` de la raíz y `data/` conservan su contenido.
- [ ] Después de un deploy, `wp-admin/`, `wp-content/` y `wp-includes/` conservan su número de archivos.
- [ ] Con una carpeta `wp-content` en `dist/`, el workflow falla antes de subir.
- [ ] El sitio de staging en Amplify sigue respondiendo con `noindex`.
- [ ] `wordpress/README.md` permite hacer las Partes B, C, D y la reversa sin abrir esta spec.
- [ ] `CLAUDE.md` ya no dice que producción es la rama `main` de Amplify.

## Decisions

- **Sí:** WordPress y Astro en la misma carpeta `httpdocs`. Es el patrón de ERES, evita migrar WordPress y mantiene los formularios PHP en el mismo origen.
- **No:** mover WordPress a un subdominio. Obliga a migrar la base de datos, cambiar `WOO_STORE_URL` y rehacer las URLs de imágenes.
- **No:** producción en Amplify con el PHP en Plesk. Suma CORS entre dominios y dos lugares que mantener.
- **Sí:** deploy con `rsync` por SSH desde GitHub Actions. Usa clave en vez de contraseña y solo borra dentro de las carpetas de Astro. El acceso SSH se habilita en la Parte B.
- **No:** FTP. Es más lento, viaja con contraseña y obliga a reescribir la protección de archivos.
- **No:** compilar en el servidor con el Node.js de Plesk. El build depende de TinaCloud y de Woo, y un fallo dejaría el sitio a medias.
- **Sí:** secrets `PLESK_*` en vez de `HOSTINGER_*`. El hosting es otro; el nombre no debe mentir.
- **Sí:** `SITE_URL` fija en el workflow. El build de producción no depende de que nadie recuerde definirla.
- **Sí:** las claves del webhook en `site-config.php`. Ya existe, está fuera de git y el deploy no lo sobrescribe; un segundo archivo de secretos no aporta nada sin `woo-api.php`.
- **Sí:** `rebuild-hook.php` como relevo. WooCommerce no puede mandar el header `Authorization` que pide la API de GitHub.
- **No:** huella por producto para saltarse los cambios de solo existencias, como en ERES. Aquí no hay ventas ni se muestra el stock: todo cambio de producto merece rebuild, y `concurrency` colapsa las ráfagas.
- **Sí:** rebuild diario a las 04:00 de Lima. Cubre un webhook perdido o desactivado.
- **No:** encadenar `deploy.yml` con `estandar.yml`. Un deploy por webhook o por cron no debe bloquearse por una imagen pesada subida desde Tina; `estandar.yml` sigue siendo la puerta del PR a `main`.
- **Sí:** el `.htaccess` del servidor se edita a mano y el bloque se versiona en el repo. Un error automático ahí tumba también el WordPress.
- **Sí:** bloque en dos partes. La parte definitiva rompería las páginas de WordPress si se pega antes del primer deploy.
- **Sí:** variante en nginx escrita de antemano. No se sabe si el modo proxy está activo, y descubrirlo el día del pase sin las reglas listas lo frenaría.
- **Sí:** lista corta de rutas de WordPress y 404 de Astro para el resto. El sitio público de WordPress deja de existir.
- **Sí:** `301` para `/producto/`, `/categoria-producto/`, `/marca/` y `sitemap_index.xml`. Son las URLs que Google ya tiene indexadas.
- **No:** limpieza de WordPress en esta spec. Sin checkout nada depende de ella, y JetEngine tiene que quedarse porque alimenta la ficha (`src/lib/woo/extras.ts`).
- **Sí:** staging sigue en Amplify. No hay motivo para moverlo y los previews de PR ya funcionan ahí.
- **Sí:** Turnstile apagado. Quedan el honeypot y el límite por IP; se activa después sin tocar código.
- **Sí:** la guía vive en `wordpress/README.md`, como en ERES, junto a los bloques de configuración.
- **Sí:** prueba de humo sin reversa automática. Avisa en minutos; deshacer un deploy sobre una raíz compartida a ciegas es más riesgoso que el fallo.
- **Definición rápida:** las secciones posteriores a la cabecera se escribieron sin confirmación una por una, a pedido del usuario. Se revisan en una sola pasada antes de aprobar.

## Risks

| Riesgo | Mitigación |
|---|---|
| El plan de Plesk no permite SSH, o el shell es enjaulado y no trae `rsync` | Se comprueba en la Parte B, paso 4, antes de tocar nada. Si falla, el pase se detiene y el deploy por FTPS se define en una spec aparte. |
| nginx sin modo proxy: el `.htaccess` no se lee | Parte B, paso 2. Se usa `wordpress/nginx-astro.conf`. |
| nginx sirve los estáticos directo y no aplica el `ErrorDocument` de Apache a un archivo inexistente | La prueba de humo pide una ruta sin extensión. Si un `.png` inexistente muestra el 404 de nginx, se acepta: no es una página. |
| Apache del servidor no acepta `[R=404]` | Se comprueba en la Parte C, paso 5. Alternativa: `RewriteRule . /404.html [L]` (responde `200`, se corrige después). |
| Un plugin de caché de página o la caché de nginx sirve la home vieja de WordPress | Parte B, paso 11, y purga en la Parte C, paso 4. |
| Un plugin de WordPress usa una URL pública fuera de la lista (`/wp-json/`, `/?rest_route=`) | Se agrega la ruta a la condición del 404. El build avisa si los campos de JetEngine dejan de llegar. |
| El build lee Woo del mismo dominio que está desplegando | `/wp-json/` y `/wp-content/` nunca pasan por las reglas de Astro. La prueba de humo lo comprueba en cada deploy. |
| `cancel-in-progress` corta un `rsync` a la mitad | El deploy que lo canceló sube el árbol completo enseguida. Los assets de `/_astro/` llevan hash y no se pisan. |
| Guardar varios productos seguidos dispara muchos workflows | `concurrency` deja vivo solo el último. |
| GitHub desactiva el `schedule` tras 60 días sin actividad en el repo | Los webhooks y los push siguen funcionando. La guía indica cómo reactivarlo. |
| `repository_dispatch` y `schedule` solo corren con el `deploy.yml` de la rama por defecto | `main` es la rama por defecto; el workflow llega con el merge del pase. |
| El token de GitHub vence y los webhooks dejan de redesplegar | `rebuild-hook.php` lo registra con `error_log`; el cron diario mantiene el catálogo al día. Vencimiento anotado en la Parte D. |
| El buzón de Microsoft 365 no tiene SMTP AUTH habilitado | Se prueba en la Parte C, paso 8. El formulario muestra el error con WhatsApp mientras tanto. |
| Una editora publica desde `/admin/` durante el pase | El pase se hace en hora de poco tráfico y se avisa antes. |
| Una actualización de WordPress reescribe el `.htaccess` | Solo toca su bloque. El de Astro tiene marcadores propios y hay copia en el repo. |
| Google conserva las URLs viejas de WordPress | Las cuatro redirecciones `301` y el sitemap nuevo. Search Console queda como tarea manual de SPEC 14. |

## Lo que **no** entra en esta spec

- Limpieza de plugins, páginas y temas de WordPress.
- Checkout, carrito, `woo-api.php` y mu-plugins.
- Turnstile activo.
- Staging en `staging.medicaldigitalperu.com`.
- Edición automática del `.htaccess` o de nginx.
- Deploy por FTP.
- Alta en Search Console.
- Actualizaciones de WordPress y plugins.

Cada una, si llega, va en su propia spec.
