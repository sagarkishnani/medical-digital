import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL(`${import.meta.env.BASE_URL.replace(/\/?$/, "/")}sitemap-index.xml`, site).href;
  const body = ["# El panel del CMS es privado: no se indexa.", "User-agent: *", "Disallow: /admin/", "", `Sitemap: ${sitemapUrl}`, ""].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
