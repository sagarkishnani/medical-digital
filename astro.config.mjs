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

const PRODUCTION_SITE = 'https://medicaldigitalperu.com';

// Dominio absoluto del build: alimenta canonicals, sitemap, robots.txt, JSON-LD y
// los enlaces que salen del sitio (WhatsApp). Amplify no avisa del dominio que
// va a servir, pero sí expone con qué se arma: pr-<n>.<app>.amplifyapp.com en
// los previews y <rama>.<app>.amplifyapp.com en las ramas, con "/" → "-".
function resolveSite() {
  const explicit =
    process.env.SITE_URL || loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '').SITE_URL;
  if (explicit?.trim()) return explicit.trim().replace(/\/+$/, '');

  const { AWS_APP_ID, AWS_BRANCH, AWS_PULL_REQUEST_ID } = process.env;
  if (AWS_APP_ID && AWS_PULL_REQUEST_ID) return `https://pr-${AWS_PULL_REQUEST_ID}.${AWS_APP_ID}.amplifyapp.com`;
  if (AWS_APP_ID && AWS_BRANCH) return `https://${AWS_BRANCH.replace(/\//g, '-')}.${AWS_APP_ID}.amplifyapp.com`;

  return PRODUCTION_SITE;
}

export default defineConfig({
  // Sin `site`, @astrojs/sitemap no puede generar URLs absolutas y las
  // canonicals caen al fallback del layout.
  site: resolveSite(),
  base,
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
