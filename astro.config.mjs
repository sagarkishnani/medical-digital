import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tinaDirective from './astro-tina-directive/index.mjs';

const base = process.env.DEPLOY_BASE || '/';

const wooStoreUrl =
  process.env.WOO_STORE_URL || loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '').WOO_STORE_URL || '';
const wooImageDomains = wooStoreUrl.trim() ? [new URL(wooStoreUrl.trim()).hostname] : [];

export default defineConfig({
  site: 'https://medicaldigitalperu.com',
  base,
  image: {
    domains: wooImageDomains,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    mdx(),
    tailwind(),
    react(),
    sitemap({ filter: (page) => !page.includes('/admin') }),
    tinaDirective(),
  ],
});
