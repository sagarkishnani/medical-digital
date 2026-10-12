# Pase a producción — guía paso a paso

Esta guía lleva el sitio Astro a `https://medicaldigitalperu.com`, en la misma carpeta `httpdocs` donde hoy vive WordPress. Sigue `specs/16-pase-a-produccion.md` y se puede recorrer sin abrir la spec.

Hazla en orden. La **Parte B** no cambia nada visible y se puede hacer días antes. La **Parte C** es el pase. La **Parte D** es el cierre, una semana después.

## Cómo queda

| Ruta | Quién la sirve |
|---|---|
| `/`, `/nosotros/`, `/contacto/`, `/marcas/`, `/servicio-tecnico/`, `/productos/…`, `/noticias/…`, legales, `/admin/` (Tina), `/_astro/`, `/uploads/` | Astro (archivos estáticos) |
| `/send-email.php`, `/rebuild-hook.php` | PHP del sitio Astro |
| `/wp-admin/`, `/wp-login.php`, `/wp-json/…`, `/wp-content/…`, `/wp-includes/…` | WordPress |
| `/producto/<slug>/`, `/categoria-producto/<slug>/`, `/marca/<slug>/`, `/sitemap_index.xml` | `301` a su equivalente en Astro |
| Cualquier otra URL que no exista | `404.html` de Astro |

- **WordPress no se toca ni se borra.** Deja de verse, pero sigue siendo el origen del catálogo: los productos se editan en WooCommerce como siempre.
- **JetEngine tiene que seguir activo.** De ahí salen la ficha técnica, las especificaciones, los accesorios y el video de cada producto.
- **Staging y los previews de PR siguen en Amplify.**

El deploy lo hace el workflow "Deploy a producción" (`.github/workflows/deploy.yml`). Corre en cuatro casos:

| Disparador | Cuándo |
|---|---|
| Push a `main` | Cada merge, y cada cambio guardado en `/admin/` de producción |
| Webhook de WooCommerce | Al crear, actualizar, eliminar o restaurar un producto |
| Diario | 04:00 de Lima, por si se perdió un webhook |
| Manual | GitHub → Actions → Deploy a producción → **Run workflow** |

Archivos de esta carpeta:

| Archivo | Para qué |
|---|---|
| `htaccess-astro.conf` | Bloque que se pega en el `.htaccess` del servidor, en dos partes |
| `htaccess-reversa.conf` | Bloque que devuelve el sitio de WordPress |
| `nginx-astro.conf` | Las mismas reglas para nginx, solo si el modo proxy está apagado |

## Qué necesitas a la mano

- Acceso a Plesk del dominio `medicaldigitalperu.com`.
- Acceso de administrador al WordPress (`/wp-admin/`).
- Permiso de administrador en el repo `sagarkishnani/medical-digital`.
- Acceso al proyecto de TinaCloud y a la app de Amplify.
- Usuario y contraseña del buzón de Microsoft 365 que enviará los formularios.
- Una terminal con `ssh` y `openssl`.

---

## Parte B — Preparación

Nada de esta parte cambia lo que ve un visitante.

### B1. Respaldo completo

1. Plesk → **Sitios web y dominios** → `medicaldigitalperu.com` → **Copias de seguridad** (o "Administrador de backups").
2. Crea una copia **completa**: archivos y base de datos.
3. Descárgala a tu máquina.

Comprobación: el archivo descargado pesa más que cero y la copia aparece en la lista de Plesk.

### B2. Verificar si el dominio usa Apache o solo nginx

1. Plesk → **Sitios web y dominios** → `medicaldigitalperu.com` → **Configuración de Apache y nginx**.
2. Baja hasta **Configuración de nginx** y mira la casilla **Modo proxy**.

| Modo proxy | Qué significa | Qué archivo usas en B13 y C3 |
|---|---|---|
| Marcado | nginx reenvía a Apache y el `.htaccess` manda | `htaccess-astro.conf` |
| Desmarcado | Solo nginx; el `.htaccess` no se lee | `nginx-astro.conf` |

El resto de la guía asume **modo proxy marcado**, que es lo habitual. Donde cambia para nginx, se indica.

En la misma pantalla, anota si **Habilitar caché de nginx** está marcado: se usa en C4.

### B3. Habilitar el acceso SSH

1. Plesk → **Sitios web y dominios** → `medicaldigitalperu.com` → **Acceso a hosting web** (en algunas versiones: Hosting y DNS → Acceso a hosting).
2. En **Acceso SSH** elige `/bin/bash`. No elijas la opción "(enjaulado)" o "chrooted": normalmente no trae `rsync`.
3. Anota el **nombre de usuario** de esa pantalla. Es el mismo de la columna "Usuario" del administrador de archivos (empieza con `medicaldigitalperu.co_`).
4. Guarda.

Si solo aparece "Prohibido", el plan no permite SSH: pídele al proveedor del hosting que lo habilite. Sin SSH el pase no continúa (ver **Si algo falla**).

Crea una clave solo para el deploy, en tu máquina:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/medicaldigital_deploy -C "github-actions-deploy" -N ""
cat ~/.ssh/medicaldigital_deploy.pub
```

Autoriza la clave pública en el servidor:

1. Plesk → **Archivos** → **Directorio principal** → carpeta `.ssh`.
2. Abre `authorized_keys` (créalo si no existe) y pega al final la línea que mostró `cat`.
3. Permisos: `.ssh` en `700` (`rwx --- ---`) y `authorized_keys` en `600` (`rw- --- ---`).

Si tu Plesk tiene **Sitios web y dominios → Claves SSH**, puedes pegar ahí la clave pública en vez de editar el archivo.

### B4. Comprobar SSH y rsync

```bash
ssh -i ~/.ssh/medicaldigital_deploy -p 22 <usuario>@medicaldigitalperu.com "rsync --version | head -1 && pwd && ls httpdocs | head -20"
```

Tiene que mostrar tres cosas:

- La versión de `rsync`.
- La carpeta de inicio, por ejemplo `/var/www/vhosts/medicaldigitalperu.com`.
- El contenido de `httpdocs` (`wp-admin`, `wp-content`, `index.php`…).

Si pide contraseña, la clave pública no quedó bien autorizada (revisa B3). Si dice `rsync: command not found`, **detente aquí** (ver **Si algo falla**).

### B5. Anotar la ruta y revisar la raíz

- La ruta de deploy es la carpeta de inicio más `/httpdocs`. Ejemplo: `/var/www/vhosts/medicaldigitalperu.com/httpdocs`.
- Mira la lista de `httpdocs`. El deploy **solo borra** dentro de estas carpetas: `_astro`, `admin`, `contacto`, `marcas`, `nosotros`, `noticias`, `phpmailer`, `politicas-de-privacidad`, `productos`, `servicio-tecnico`, `terminos-y-condiciones` y `uploads`.
- Si en `httpdocs` ya existe una carpeta con uno de esos nombres y tiene archivos que quieres conservar, **no sigas**: renómbrala o muévela primero.

### B6. Clave REST de WooCommerce (solo lectura)

Puedes reutilizar la del `.env` local. Para crear una propia del deploy:

1. WordPress → **WooCommerce → Ajustes → Avanzado → API REST → Añadir clave**.
2. Descripción: `Astro deploy (solo lectura)`. Usuario: un administrador. Permisos: **Lectura**.
3. Copia `ck_…` y `cs_…`. Solo se muestran una vez.

Nunca uses una clave con permiso de escritura.

### B7. Token de GitHub para el webhook

1. GitHub → tu foto → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Nombre: `medical-digital rebuild-hook`. Expiración: 1 año.
3. Repository access: **Only select repositories** → `sagarkishnani/medical-digital`.
4. Permissions → Repository → **Contents: Read and write**. Nada más.
5. Genera y copia el token (`github_pat_…`). Solo se muestra una vez.

### B8. Secrets de GitHub

Repo → **Settings → Secrets and variables → Actions → Secrets → New repository secret**.

| Nombre | Valor |
|---|---|
| `TINA_CLIENT_ID`, `TINA_TOKEN` | Los de TinaCloud (los mismos de Amplify). Si ya existen, no los toques |
| `WOO_STORE_URL` | `https://medicaldigitalperu.com` |
| `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET` | Paso B6 |
| `PLESK_SSH_HOST` | `medicaldigitalperu.com` (o la IP del servidor) |
| `PLESK_SSH_PORT` | `22` (o el puerto que usaste en B4) |
| `PLESK_SSH_USER` | El usuario de B3 |
| `PLESK_SSH_KEY` | La clave **privada** completa: `pbcopy < ~/.ssh/medicaldigital_deploy` |
| `PLESK_DEPLOY_PATH` | La ruta de B5, sin barra final |

No hace falta ninguna **Variable**. `SITE_URL` y `TINA_BRANCH` están fijas en el workflow.

### B9. Crear `site-config.php` en el servidor

Este archivo guarda los secretos del PHP. No está en git y el deploy nunca lo sobrescribe.

1. Genera el secreto del webhook y guárdalo; lo usarás otra vez en C6:

   ```bash
   openssl rand -hex 32
   ```

2. Copia `public/config.example.php` del repo a tu máquina con el nombre `site-config.php` y complétalo:

   | Clave | Valor |
   |---|---|
   | `smtp_host`, `smtp_port` | `smtp.office365.com` y `587` (ya vienen) |
   | `smtp_user`, `smtp_pass` | Buzón de Microsoft 365 que envía y su contraseña |
   | `from_name` | `Medical Digital Web` |
   | `fallback_email` | Correo que recibe los formularios si Tina no tiene destinatarios |
   | `turnstile_secret` | Vacío. Turnstile queda apagado |
   | `allowed_origins` | `[]`. Solo se llena si un preview de Amplify va a enviar con este PHP |
   | `webhook_secret` | El valor de `openssl` |
   | `github_repo` | `sagarkishnani/medical-digital` |
   | `github_token` | El token de B7 |

3. Súbelo a `httpdocs` con Plesk → **Archivos**. Permisos `640` o `600`.

El buzón necesita **SMTP AUTH** habilitado en Microsoft 365 (Centro de administración → Usuarios → el buzón → Correo → Administrar aplicaciones de correo → "SMTP autenticado").

Comprobación: abrir `https://medicaldigitalperu.com/site-config.php` en el navegador muestra una página en blanco, nunca las claves.

### B10. TinaCloud

1. `app.tina.io` → el proyecto de Medical Digital → **Configuration**.
2. En **Site URL(s)** agrega `https://medicaldigitalperu.com`.
3. En **Branches** comprueba que `main` aparece indexada. Si no aparece, se indexa sola después del merge de C1.

### B11. Caché de página en WordPress

1. WordPress → **Plugins**. Busca un plugin de caché (WP Rocket, W3 Total Cache, WP Super Cache, LiteSpeed Cache, WP Fastest Cache…).
2. Si hay uno, desactiva su **caché de página** (o el plugin entero). Una caché de página puede seguir mostrando la home vieja de WordPress después del pase.

Si no hay ninguno, no hay nada que hacer.

### B12. Copia del `.htaccess`

1. Plesk → **Archivos** → `httpdocs`. Activa "mostrar archivos ocultos" si no ves `.htaccess`.
2. Copia `.htaccess` como `.htaccess.pre-astro-AAAAMMDD` (con la fecha de hoy).
3. Descarga también una copia a tu máquina.

### B13. Pegar la parte previa del bloque

1. Abre `wordpress/htaccess-astro.conf` del repo.
2. Copia desde `# BEGIN Medical Digital Astro` hasta el `</IfModule>` de la **parte previa**, y agrega al final la línea `# END Medical Digital Astro`.
3. En Plesk, edita `httpdocs/.htaccess` y pégalo **arriba** de `# BEGIN WordPress`.
4. Guarda.

Tiene que quedar así:

```apache
# BEGIN Medical Digital Astro

# --- Parte previa ---
DirectoryIndex index.html index.php

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{QUERY_STRING} (^|&)(rest_route|p|page_id|preview)= [NC]
RewriteRule ^$ /index.php [L]
</IfModule>

# END Medical Digital Astro

# BEGIN WordPress
…
```

Comprobación: la home, `/productos/` y la ficha de un producto de WordPress se ven igual que antes, y `/wp-admin/` abre. Si algo responde error 500, restaura la copia de B12.

**Con nginx solo:** en "Archivos índice" de la pantalla de B2 pon `index.html` antes de `index.php`, y pega la parte previa de `nginx-astro.conf` en "Directivas adicionales de nginx".

---

## Parte C — Pase

Hazlo en una hora de poco tráfico y avisa antes a quien edita contenido: nadie debe publicar desde `/admin/` durante el pase.

### C1. Merge de `staging` a `main`

1. Abre un PR de `staging` a `main` y haz el merge.
2. GitHub → **Actions**: se dispara "Deploy a producción".

### C2. Esperar el primer deploy

- Los pasos "Build" y "Subir a Plesk" tienen que terminar en verde.
- "Prueba de humo" va a **fallar** en dos líneas: la redirección de `/producto/…` y el `404`. Es lo esperado: todavía falta la parte definitiva del bloque.
- Desde este momento la home y las páginas institucionales ya son las de Astro.

Si falla "Build" o "Subir a Plesk", no sigas: mira **Si algo falla**. El sitio de WordPress sigue visible.

### C3. Pegar la parte definitiva del bloque

1. Edita `httpdocs/.htaccess` en Plesk.
2. Reemplaza todo el bloque `# BEGIN Medical Digital Astro … # END Medical Digital Astro` por el contenido completo de `wordpress/htaccess-astro.conf` (las dos partes).
3. Guarda.

**Con nginx solo:** pega la parte definitiva de `nginx-astro.conf`, reemplazando la regla de enlaces permanentes de WordPress que hubiera en ese cuadro.

### C4. Purgar las cachés

- Si en B2 estaba marcado "Habilitar caché de nginx": en esa misma pantalla, **Borrar caché**.
- Si hay un plugin de caché en WordPress: vacía su caché.

### C5. Relanzar el deploy

1. GitHub → **Actions → Deploy a producción → Run workflow** (rama `main`).
2. Esta vez "Prueba de humo" tiene que pasar completa: todas las líneas empiezan con `ok`.

Qué comprueba:

| Petición | Resultado esperado |
|---|---|
| `/` | `200` y es la home de Astro |
| `/robots.txt` | `200` y apunta a `sitemap-index.xml` |
| `/wp-json/` | `200` con JSON de WordPress |
| `/rebuild-hook.php` | `405` |
| `/producto/prueba-de-humo/` | `301` a `/productos/prueba-de-humo/` |
| `/ruta-que-no-existe-md/` | `404` |

Si solo falla el `404` (responde `200` o un error 500), mira **Si algo falla**.

### C6. Crear los webhooks de producto

WordPress → **WooCommerce → Ajustes → Avanzado → Webhooks → Añadir webhook**, cuatro veces:

| Nombre | Estado | Tema | URL de entrega | Secreto | Versión de la API |
|---|---|---|---|---|---|
| Astro · producto creado | Activo | Producto creado | `https://medicaldigitalperu.com/rebuild-hook.php` | El `webhook_secret` de B9 | WP REST API Integration v3 |
| Astro · producto actualizado | Activo | Producto actualizado | ídem | ídem | ídem |
| Astro · producto eliminado | Activo | Producto eliminado | ídem | ídem | ídem |
| Astro · producto restaurado | Activo | Producto restaurado | ídem | ídem | ídem |

Al guardar, Woo manda un ping. Comprobación: los cuatro siguen en estado **Activo** después de guardar.

Prueba de que el relevo rechaza lo que no viene de Woo:

```bash
curl -i -X POST https://medicaldigitalperu.com/rebuild-hook.php -d '{}'
```

Tiene que responder `401` con `"Firma inválida."`. Si responde `503`, a `site-config.php` le falta alguna de las tres claves del webhook.

### C7. Probar el webhook

1. Edita el nombre de un producto en WooCommerce (agrégale un punto) y guarda.
2. GitHub → **Actions**: en menos de un minuto aparece una ejecución de "Deploy a producción" con el evento `repository_dispatch`.
3. Cuando termine, la ficha del producto en el sitio muestra el nombre nuevo.
4. Deshaz el cambio en Woo. Se dispara otro deploy.

### C8. Probar los formularios

Envía uno de cada tipo desde el sitio en producción:

- `/contacto/`
- "Solicitar cotización" en una ficha de producto
- `/servicio-tecnico/`

Comprobación por cada uno: la pantalla muestra el correlativo (`CON-`, `COT-` o `SVT-`), llega el correo al equipo y llega la confirmación al correo que escribiste.

### C9. Probar Tina en producción

1. Entra a `https://medicaldigitalperu.com/admin/` e inicia sesión.
2. Cambia un texto menor y guarda.
3. Comprobación: aparece un commit nuevo en `main` y se dispara "Deploy a producción".

### C10. Recorrido final

- [ ] `/`, `/nosotros/`, `/contacto/`, `/marcas/`, `/productos/`, `/terminos-y-condiciones/` y `/politicas-de-privacidad/` muestran el sitio nuevo.
- [ ] El código fuente de la home **no** trae `noindex`.
- [ ] `/robots.txt` no menciona Yoast y apunta a `sitemap-index.xml`.
- [ ] `/wp-admin/` abre y se puede iniciar sesión.
- [ ] La ficha vieja de un producto real (`/producto/<slug>/`) redirige a `/productos/<slug>/` y la ficha existe.
- [ ] `/categoria-producto/cardiologia/` redirige a `/productos/categoria/cardiologia/`.
- [ ] `/marca/<slug>/` redirige a `/productos/?marca=<slug>`.
- [ ] `/sitemap_index.xml` redirige a `/sitemap-index.xml`.
- [ ] Una URL inventada muestra el 404 del sitio nuevo.
- [ ] `/?utm_source=prueba` muestra la home nueva.
- [ ] Las fotos de una ficha cargan.
- [ ] `/config.example.php` responde `404` y `/data/` responde `403` o `404`.
- [ ] El sitio de staging en Amplify sigue funcionando.

---

## Parte D — Cierre (7 días después)

1. **Amplify:** en la app → **Hosting → Branch settings**, desactiva el build automático de la rama `main` (o desconéctala). `staging` y los previews de PR se quedan.
2. **`.htaccess` viejo:** con la copia de B12 guardada en tu máquina, borra `.htaccess.pre-astro-AAAAMMDD` del servidor.
3. **Calendario:** anota la fecha de vencimiento del token de B7, dos semanas antes.

La limpieza de WordPress (Elementor, plugins, páginas viejas) no es parte de este pase.

---

## Reversa

Devuelve el sitio de WordPress sin borrar ningún archivo.

1. GitHub → **Actions → Deploy a producción → ⋯ → Disable workflow**. Así ni el cron ni un webhook vuelven a desplegar.
2. En `httpdocs/.htaccess`, reemplaza el bloque `Medical Digital Astro` por el contenido de `wordpress/htaccess-reversa.conf`.
3. Purga las cachés (C4).
4. WooCommerce → Webhooks: pasa los cuatro a **Desactivado**.

Comprobación: la home y `/nosotros/` vuelven a ser las de WordPress.

**Con nginx solo:** vuelve a poner `index.php` antes de `index.html` en "Archivos índice", quita las directivas de `nginx-astro.conf` y restaura la regla de enlaces permanentes de WordPress.

Para volver a Astro: pega de nuevo `htaccess-astro.conf` completo, reactiva el workflow y los webhooks, y lanza el deploy a mano.

---

## Operación diaria

### Qué pasa con cada cambio

| Cambio | Dónde se hace | Cuándo se ve |
|---|---|---|
| Producto: nombre, fotos, descripción, categoría, marca, ficha técnica, destacado | WooCommerce | Cuando termina el deploy que dispara el webhook (unos minutos) |
| Producto creado, eliminado o restaurado | WooCommerce | Ídem |
| Categoría o marca renombrada, sin tocar ningún producto | WooCommerce | En el deploy diario de las 04:00, o lanzando el deploy a mano |
| Textos, imágenes, noticias, destinatarios de formularios | `/admin/` (Tina) | Cuando termina el deploy que dispara el commit |
| Código | PR a `staging`, luego a `main` | Cuando termina el deploy del merge |

Guardar varios productos seguidos dispara varios deploys; solo el último llega a terminar, los anteriores se cancelan solos.

### Un webhook aparece "Desactivado"

Woo lo desactiva tras varias entregas fallidas seguidas.

1. WooCommerce → **Estado → Registros**, fuente `webhooks-delivery`: mira el código de respuesta.
2. `401`: el secreto del webhook no coincide con `webhook_secret`. `503`: falta una clave en `site-config.php`. `403` o `5xx`: un firewall o una regla del servidor bloquea el `POST`.
3. Corrige y vuelve a pasarlo a **Activo**.

Mientras tanto, el deploy diario mantiene el catálogo al día.

### El webhook responde 200 pero no hay deploy

`rebuild-hook.php` responde `200` aunque GitHub lo rechace, para que Woo no desactive el webhook. Mira el registro de errores de PHP en Plesk (**Registros**): la línea empieza con `[rebuild-hook] GitHub respondió`.

- `401`: el token venció o se revocó. Crea otro (B7) y cámbialo en `site-config.php`.
- `404`: `github_repo` está mal escrito o el token no tiene acceso al repo.

### El deploy diario dejó de correr

GitHub desactiva los workflows programados tras 60 días sin actividad en el repo. GitHub → **Actions → Deploy a producción → Enable workflow**.

### Renovar el token de GitHub

Repite B7 y reemplaza `github_token` en `site-config.php`. No hace falta redesplegar.

### Qué no toca nunca el deploy

- El `.htaccess` de `httpdocs`.
- `site-config.php`.
- La carpeta `data/` (contadores y límite por IP de los formularios).
- `wp-admin/`, `wp-content/`, `wp-includes/` y los `wp-*.php`. Si el build trajera uno de esos nombres, el workflow se detiene antes de subir.

Una imagen de `/uploads/` reemplazada con el mismo nombre puede tardar en refrescarse por la caché del navegador: súbela con otro nombre.

---

## Si algo falla

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| B3: no existe la opción de SSH, o B4 dice `rsync: command not found` | El plan no permite SSH o el shell es enjaulado | Pide al proveedor `/bin/bash` sin jaula. Si no es posible, el pase se detiene: el deploy por FTPS necesita su propia spec |
| B4 pide contraseña | La clave pública no está en `authorized_keys` o los permisos son abiertos | Revisa B3: `.ssh` en `700`, `authorized_keys` en `600` |
| Error 500 en todo el sitio después de editar el `.htaccess` | Error de sintaxis al pegar | Restaura la copia de B12 y vuelve a pegar con cuidado |
| "Build" falla con un error de Woo | Faltan `WOO_*` en los Secrets o la clave no es válida | Revisa B6 y B8. El build falla a propósito para no publicar un catálogo vacío |
| "Build" falla con un error de Tina | TinaCloud no tiene indexada la rama `main` o faltan `TINA_*` | Revisa B10 y B8 |
| "Configurar SSH" o "Subir a Plesk" fallan | Host, puerto, usuario, clave o ruta mal cargados | Revisa B8. La clave privada va completa, con sus líneas `BEGIN` y `END` |
| La home sigue siendo la de WordPress después del deploy | Falta la parte previa, o hay una caché de página | Revisa B13, B11 y C4 |
| Una ruta inexistente responde error 500 en vez de `404` | El Apache del servidor no acepta `[R=404]` | Cambia la última regla del bloque por `RewriteRule . /404.html [L]`. Responde `200` con la página 404; anótalo para corregirlo después |
| Una ruta inexistente muestra el 404 de WordPress | La parte definitiva no está, o quedó debajo de `# BEGIN WordPress` | Revisa C3: el bloque va arriba |
| Algo de WordPress dejó de funcionar y su URL no empieza con `/wp-` | Un plugin usa una URL pública fuera de la lista | Agrega esa ruta a la condición `!^/(wp-json|wp-admin|wp-content|wp-includes)` del bloque y avisa para actualizar `htaccess-astro.conf` en el repo |
| Los formularios muestran el error con WhatsApp | Falta `site-config.php`, el SMTP está vacío o el buzón no tiene SMTP AUTH | Revisa B9 y el registro de errores de PHP en Plesk |
| El sitio salió con `noindex` | El workflow se editó y perdió `SITE_URL` | `SITE_URL` debe ser `https://medicaldigitalperu.com` en `deploy.yml` |
