import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tinaDirective from './astro-tina-directive/index.mjs';

// Base path per environment. Empty (or unset) serves the site at the root; set
// DEPLOY_BASE=/subpath when the site lives in a subdirectory. Every runtime path
// in the project reads import.meta.env.BASE_URL, so this is the only knob.
const base = process.env.DEPLOY_BASE || '/';

const wooStoreUrl =
  process.env.WOO_STORE_URL || loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '').WOO_STORE_URL || '';
const wooImageDomains = wooStoreUrl.trim() ? [new URL(wooStoreUrl.trim()).hostname] : [];

export default defineConfig({
  // Dominio final. Sin `site`, @astrojs/sitemap no puede generar URLs absolutas
  // y las canonicals caen al fallback del layout.
  site: 'https://medicaldigitalperu.com',
  base,
  image: {
    domains: wooImageDomains,
  },
  // Prefetch: hovering an internal link downloads its HTML, so navigation with
  // View Transitions feels instant. Opt out per link with data-astro-prefetch="false".
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    mdx(),
    tailwind(),
    react(),
    // Genera sitemap-index.xml + sitemap-0.xml. Excluye el panel del CMS, que
    // es privado y no debe indexarse.
    sitemap({ filter: (page) => !page.includes('/admin') }),
    tinaDirective(),
  ],
});
