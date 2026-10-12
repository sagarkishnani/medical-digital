import type { Collection } from "tinacms";
import { ICON_OPTIONS } from "../../src/lib/icons";

export const aboutCollection: Collection = {
  name: "about",
  label: "Nosotros",
  path: "src/content/about",
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
      name: "intro",
      label: "Quiénes somos",
      fields: [
        { name: "eyebrow", label: "Antetítulo", type: "string" },
        { name: "title", label: "Título", type: "string" },
        { name: "paragraphs", label: "Párrafos", type: "string", list: true, ui: { component: "textarea" } },
        { name: "image", label: "Imagen", type: "image" },
        { name: "imageAlt", label: "Texto alternativo de la imagen", type: "string" },
      ],
    },
    {
      type: "object",
      name: "visionMission",
      label: "Visión y misión",
      fields: [
        { name: "image", label: "Imagen", type: "image" },
        { name: "imageAlt", label: "Texto alternativo de la imagen", type: "string" },
        { name: "visionTitle", label: "Título de la visión", type: "string" },
        { name: "vision", label: "Visión", type: "string", ui: { component: "textarea" } },
        { name: "missionTitle", label: "Título de la misión", type: "string" },
        { name: "mission", label: "Misión", type: "string", ui: { component: "textarea" } },
      ],
    },
    {
      type: "object",
      name: "values",
      label: "Valores",
      fields: [
        { name: "title", label: "Título", type: "string" },
        {
          type: "object",
          name: "items",
          label: "Valores",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.name || "Valor" }) },
          fields: [
            { name: "icon", label: "Ícono", type: "string", options: ICON_OPTIONS },
            { name: "name", label: "Nombre", type: "string" },
            { name: "text", label: "Descripción", type: "string", ui: { component: "textarea" } },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "policies",
      label: "Políticas",
      fields: [
        { name: "title", label: "Título", type: "string" },
        {
          type: "object",
          name: "items",
          label: "Políticas",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.title || "Política" }) },
          fields: [
            { name: "title", label: "Título", type: "string" },
            {
              name: "slug",
              label: "Identificador",
              type: "string",
              description: "Para enlazar la pestaña: /nosotros?politica=<identificador>#politicas. Minúsculas y guiones.",
            },
            { name: "intro", label: "Introducción", type: "string", ui: { component: "textarea" } },
            { name: "points", label: "Puntos", type: "string", list: true },
            { name: "document", label: "Documento PDF", description: "Opcional. Sin documento no se muestra el botón de descarga.", type: "image" },
          ],
        },
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
