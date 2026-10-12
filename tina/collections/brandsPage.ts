import type { Collection } from "tinacms";

export const brandsPageCollection: Collection = {
  name: "brandsPage",
  label: "Marcas y reseñas",
  path: "src/content/marcas",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "hero",
      label: "Cabecera",
      fields: [
        { name: "title", label: "Título", type: "string", required: true },
        { name: "image", label: "Imagen de fondo", description: "Sin imagen se muestra el degradado de marca.", type: "image" },
      ],
    },
    {
      type: "object",
      name: "logos",
      label: "Franja de logos",
      description: "Los logos se editan en Home → Marcas.",
      fields: [{ name: "enabled", label: "Mostrar", type: "boolean" }],
    },
    {
      type: "object",
      name: "brands",
      label: "Nuestras marcas",
      description: "Las marcas y sus descripciones se editan en Home → Marcas.",
      fields: [
        { name: "enabled", label: "Mostrar", type: "boolean" },
        { name: "title", label: "Título", type: "string" },
        { name: "linkLabel", label: "Texto del enlace", type: "string" },
      ],
    },
    {
      type: "object",
      name: "testimonials",
      label: "Reseñas",
      description: "Los testimonios se editan en Home → Testimonios.",
      fields: [{ name: "enabled", label: "Mostrar", type: "boolean" }],
    },
    {
      type: "object",
      name: "seo",
      label: "SEO",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
      ],
    },
  ],
};
