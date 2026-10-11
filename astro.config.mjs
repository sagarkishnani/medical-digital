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

const PRODUCTION_SITE = 'https://medicaldigitalperu.com';

function resolveSite() {
  const explicit =
    process.env.SITE_URL || loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '').SITE_URL;
  if (explicit?.trim()) return explicit.trim().replace(/\/+$/, '');

  const { AWS_APP_ID, AWS_BRANCH, AWS_PULL_REQUEST_ID } = process.env;
  if (AWS_APP_ID && AWS_PULL_REQUEST_ID) return `https://pr-${AWS_PULL_REQUEST_ID}.${AWS_APP_ID}.amplifyapp.com`;
  if (AWS_APP_ID && AWS_BRANCH) return `https://${AWS_BRANCH.replace(/\//g, '-')}.${AWS_APP_ID}.amplifyapp.com`;

  return PRODUCTION_SITE;
}

const site = resolveSite();
const indexable = site === PRODUCTION_SITE;

if (!indexable) console.warn(`Build no indexable (site: ${site}). Define SITE_URL para producción.`);

export default defineConfig({
  site,
  base,
  vite: {
    define: { 'import.meta.env.SITE_INDEXABLE': JSON.stringify(indexable) },
  },
  image: {
    domains: [...wooImageDomains, 'i.ytimg.com'],
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
