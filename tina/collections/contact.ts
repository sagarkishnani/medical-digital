import type { Collection } from "tinacms";

export const contactCollection: Collection = {
  name: "contact",
  label: "Contacto",
  path: "src/content/contact",
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
      name: "map",
      label: "Mapa",
      fields: [
        {
          name: "embedUrl",
          label: "Código del mapa de Google",
          description:
            "En Google Maps: busca la sede › Compartir › Insertar un mapa › Copiar HTML, y pégalo aquí tal cual.",
          type: "string",
          ui: { component: "textarea" },
        },
        { name: "directionsUrl", label: "Enlace \"Cómo llegar\"", type: "string" },
        { name: "title", label: "Descripción del mapa", description: "La leen los lectores de pantalla.", type: "string" },
      ],
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
