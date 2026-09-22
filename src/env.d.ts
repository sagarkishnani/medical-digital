/// <reference types="astro/client" />

/**
 * Tipos del entorno de Astro.
 *
 * Sin este archivo, TypeScript no conoce `import.meta.env` y marca
 * "Property 'env' does not exist on type 'ImportMeta'" en todo lo que lea
 * `BASE_URL` — que en este proyecto es cualquier cosa que construya una ruta.
 * El build de Astro funciona igual porque lo resuelve Vite, así que el error
 * solo aparece al correr `tsc --noEmit`.
 *
 * Las variables sin prefijo PUBLIC_ NO se declaran aquí: viven en process.env
 * durante el build y no deben ser visibles para el código del cliente.
 */
interface ImportMetaEnv {
  /** Prefijo de despliegue. Lo controla DEPLOY_BASE en .env. */
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
