import type { Collection } from "tinacms";

/* Shared tag list: the blog filter and the post field read the same array, so a
   new tag is added here once. Plain readable values — they are rendered as-is. */
export const BLOG_TAG_OPTIONS = [
  "Novedades",
  "Tecnología médica",
  "Marcas",
];

export const postCollection: Collection = {
  name: "post",
  label: "Blog",
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
    { name: "title_en", label: "Título (EN)", type: "string" },
    {
      name: "excerpt",
      label: "Extracto",
      type: "string",
      ui: { component: "textarea" },
    },
    { name: "excerpt_en", label: "Extracto (EN)", type: "string", ui: { component: "textarea" } },
    { name: "body_en", label: "Contenido (EN)", type: "rich-text" },
    { name: "coverImage", label: "Imagen de portada", type: "image" },
    { name: "date", label: "Fecha", type: "datetime" },
    { name: "readTime", label: "Tiempo de lectura", type: "string" },
    {
      name: "tags",
      label: "Etiquetas",
      description:
        "Uno o varios temas del post. Se usan para filtrar el listado del blog.",
      type: "string",
      list: true,
      options: BLOG_TAG_OPTIONS,
    },
    { name: "featured", label: "Destacado", type: "boolean" },
    { name: "body", label: "Contenido", type: "rich-text", isBody: true },
  ],
};
