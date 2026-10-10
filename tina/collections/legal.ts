import type { Collection, TinaField } from "tinacms";

const legalDocumentFields: TinaField[] = [
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
    name: "updatedAt",
    label: "Última actualización",
    description: "Opcional. Vacío, no se muestra la fecha.",
    type: "datetime",
  },
  { name: "body", label: "Contenido", type: "rich-text" },
  {
    name: "document",
    label: "Documento PDF",
    description: "Opcional. Sin documento no se muestra el botón de descarga.",
    type: "image",
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
];

export const legalCollection: Collection = {
  name: "legal",
  label: "Legales",
  path: "src/content/legal",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "object", name: "terms", label: "Términos y condiciones", fields: legalDocumentFields },
    { type: "object", name: "privacy", label: "Políticas de privacidad", fields: legalDocumentFields },
  ],
};
