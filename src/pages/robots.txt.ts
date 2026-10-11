import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL(`${import.meta.env.BASE_URL.replace(/\/?$/, "/")}sitemap-index.xml`, site).href;
  const lines = import.meta.env.SITE_INDEXABLE
    ? ["# El panel del CMS es privado: no se indexa.", "User-agent: *", "Disallow: /admin/", "", `Sitemap: ${sitemapUrl}`, ""]
    : ["# Entorno de pruebas: no se indexa.", "User-agent: *", "Disallow: /", ""];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
