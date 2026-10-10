/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly PUBLIC_FORMS_ENDPOINT?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly WOO_STORE_URL?: string;
    readonly WOO_CONSUMER_KEY?: string;
    readonly WOO_CONSUMER_SECRET?: string;
  }
}
