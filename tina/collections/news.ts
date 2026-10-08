import type { Collection } from "tinacms";

export const newsCollection: Collection = {
  name: "news",
  label: "Noticias (listado)",
  path: "src/content/news",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { name: "title", label: "Título", type: "string", required: true },
    { name: "intro", label: "Bajada", description: "Solo se muestra en desktop y tablet.", type: "string", ui: { component: "textarea" } },
    { name: "emptyText", label: "Texto sin noticias", description: "Se muestra cuando una categoría no tiene noticias.", type: "string" },
    {
      type: "object",
      name: "newsletter",
      label: "Boletín",
      fields: [
        { name: "enabled", label: "Mostrar el boletín", description: "Muestra el bloque de suscripción en el listado. El envío se conecta en la SPEC 12.", type: "boolean" },
        { name: "title", label: "Título", type: "string" },
        { name: "text", label: "Texto", type: "string" },
      ],
    },
    {
      type: "object",
      name: "seo",
      label: "SEO",
      fields: [
        { name: "title", label: "Título (50–60 caracteres)", type: "string" },
        { name: "description", label: "Descripción (140–160 caracteres)", type: "string", ui: { component: "textarea" } },
      ],
    },
  ],
};
