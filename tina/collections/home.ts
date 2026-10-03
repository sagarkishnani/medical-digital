import type { Collection } from "tinacms";
import { ICON_OPTIONS } from "../../src/lib/icons";

export const homeCollection: Collection = {
  name: "home",
  label: "Home",
  path: "src/content/home",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "slides",
      label: "Slider principal",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.title || "Slide" }) },
      fields: [
        { name: "eyebrow", label: "Antetítulo", type: "string" },
        { name: "title", label: "Título", type: "string", required: true },
        { name: "text", label: "Texto", type: "string", ui: { component: "textarea" } },
        { name: "image", label: "Imagen de fondo", description: "Sin imagen se muestra el degradado de marca.", type: "image" },
        { name: "imageAlt", label: "Texto alternativo de la imagen", type: "string" },
        { name: "ctaLabel", label: "Texto del botón", type: "string" },
        { name: "ctaUrl", label: "URL del botón", type: "string" },
      ],
    },
    {
      type: "object",
      name: "featured",
      label: "Equipos destacados",
      description: "Los productos se marcan como \"Destacado\" en WooCommerce.",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "linkLabel", label: "Texto del enlace", type: "string" },
        { name: "limit", label: "Cantidad de productos", type: "number" },
      ],
    },
    {
      type: "object",
      name: "specialties",
      label: "Especialidades",
      description: "Las categorías y sus conteos vienen de WooCommerce.",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "linkLabel", label: "Texto del enlace", type: "string" },
        { name: "catalogLabel", label: "Texto de la tarjeta final", type: "string" },
      ],
    },
    {
      type: "object",
      name: "about",
      label: "Conoce más",
      fields: [
        { name: "image", label: "Imagen", type: "image" },
        { name: "imageAlt", label: "Texto alternativo de la imagen", type: "string" },
        { name: "text", label: "Texto", type: "string", ui: { component: "textarea" } },
        { name: "buttonLabel", label: "Texto del botón", type: "string" },
        { name: "buttonUrl", label: "URL del botón", type: "string" },
        {
          type: "object",
          name: "stats",
          label: "Cifras",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.label || "Cifra" }) },
          fields: [
            { name: "icon", label: "Ícono", type: "string", options: ICON_OPTIONS },
            { name: "prefix", label: "Prefijo", description: "Ej.: +", type: "string" },
            { name: "value", label: "Valor", type: "string" },
            { name: "label", label: "Descripción", type: "string" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "brands",
      label: "Marcas",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.name || "Marca" }) },
      fields: [
        { name: "name", label: "Nombre", type: "string", required: true },
        { name: "logo", label: "Logo", description: "Sin logo se muestra el nombre.", type: "image" },
        { name: "url", label: "URL", type: "string" },
      ],
    },
    {
      type: "object",
      name: "testimonials",
      label: "Testimonios",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "rating", label: "Calificación en Google", type: "number" },
        { name: "reviewsCount", label: "Cantidad de reseñas", type: "number" },
        { name: "reviewsUrl", label: "URL de las reseñas", type: "string" },
        {
          type: "object",
          name: "items",
          label: "Testimonios",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.name || "Testimonio" }) },
          fields: [
            { name: "text", label: "Testimonio", type: "string", ui: { component: "textarea" } },
            { name: "name", label: "Nombre", type: "string" },
            { name: "role", label: "Cargo e institución", type: "string" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "news",
      label: "Noticias",
      description: "Muestra los 3 artículos más recientes del blog.",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "linkLabel", label: "Texto del enlace", type: "string" },
      ],
    },
    {
      type: "object",
      name: "seo",
      label: "SEO de la home",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
      ],
    },
  ],
};
