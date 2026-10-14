import type { APIRoute } from "astro";
import client from "../../tina/__generated__/client";
import { getCategories } from "../lib/woo/store";
import { withBase } from "../utils/url";

const PAGES: [label: string, path: string, note: string][] = [
  ["Productos", "/productos/", "Catálogo de equipos médicos, con filtros por especialidad y marca."],
  ["Marcas", "/marcas/", "Marcas que Medical Digital representa en el Perú."],
  ["Servicio técnico", "/servicio-tecnico/", "Mantenimiento y soporte de equipos médicos."],
  ["Nosotros", "/nosotros/", "La empresa y sus políticas."],
  ["Noticias", "/noticias/", "Productos, actividades y capacitaciones."],
  ["Contacto", "/contacto/", "Dirección, teléfono, horario y formulario."],
];

const LEGAL: [label: string, path: string][] = [
  ["Términos y condiciones", "/terminos-y-condiciones/"],
  ["Políticas de privacidad", "/politicas-de-privacidad/"],
];

export const GET: APIRoute = async ({ site }) => {
  const [global, categories] = await Promise.all([
    client.queries.global({ relativePath: "index.json" }),
    getCategories(),
  ]);
  const seo = global.data.global.seo;
  const link = (label: string, path: string, note?: string) =>
    `- [${label}](${new URL(withBase(path), site).href})${note ? `: ${note}` : ""}`;

  const specialties = categories
    .filter((category) => category.count > 0)
    .map((category) => link(category.name, `/productos/categoria/${category.slug}/`));

  const lines = [
    `# ${seo?.title?.trim() || "Medical Digital"}`,
    "",
    ...(seo?.description?.trim() ? [`> ${seo.description.trim()}`, ""] : []),
    "## Páginas principales",
    "",
    ...PAGES.map(([label, path, note]) => link(label, path, note)),
    "",
    ...(specialties.length ? ["## Especialidades", "", ...specialties, ""] : []),
    "## Legal",
    "",
    ...LEGAL.map(([label, path]) => link(label, path)),
    "",
  ];

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
