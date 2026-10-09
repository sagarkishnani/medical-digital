import type { Collection } from "tinacms";

export const NEWS_CATEGORIES = ["Productos", "Actividades", "Capacitaciones", "Noticias"] as const;

export const postCollection: Collection = {
  name: "post",
  label: "Noticias",
  path: "src/content/blog",
  format: "mdx",
  fields: [
    {
      name: "title",
      label: "Título",
      type: "string",
      required: true,
      isTitle: true,
    },
    {
      name: "excerpt",
      label: "Extracto",
      description: "Se usa como lead del artículo y en las tarjetas.",
      type: "string",
      required: true,
      ui: { component: "textarea" },
    },
    {
      name: "category",
      label: "Categoría",
      type: "string",
      required: true,
      options: [...NEWS_CATEGORIES],
    },
    {
      name: "author",
      label: "Autor",
      description: "Vacío muestra «Equipo Medical Digital».",
      type: "string",
    },
    {
      name: "coverImage",
      label: "Imagen de portada",
      description: "Horizontal, mínimo 1200×630. También es la imagen al compartir en redes.",
      type: "image",
    },
    { name: "date", label: "Fecha", type: "datetime", required: true },
    {
      name: "featured",
      label: "Destacado",
      description: "El más reciente marcado aparece arriba del listado en «Todos».",
      type: "boolean",
    },
    {
      name: "seo",
      label: "SEO",
      type: "object",
      fields: [
        {
          name: "title",
          label: "Título (50–60 caracteres)",
          description: "Vacío usa «{título} | Medical Digital».",
          type: "string",
        },
        {
          name: "description",
          label: "Descripción (140–160 caracteres)",
          description: "Vacía usa el extracto.",
          type: "string",
          ui: { component: "textarea" },
        },
      ],
    },
    { name: "body", label: "Contenido", type: "rich-text", isBody: true },
  ],
};
