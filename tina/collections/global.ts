import type { Collection } from "tinacms";
import { ICON_OPTIONS } from "../../src/lib/icons";

/**
 * Site-wide content: navigation, footer, SEO defaults and code injection.
 * A single file (src/content/global/index.json) — creating or deleting
 * documents is disabled so an editor cannot leave the site without a nav.
 */
export const globalCollection: Collection = {
  name: "global",
  label: "Global (nav / footer / SEO)",
  path: "src/content/global",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "nav",
      label: "Navegación",
      fields: [
        { name: "logo", label: "Logo", type: "image" },
        { name: "logoAlt", label: "Texto alternativo del logo", type: "string" },
        {
          type: "object",
          name: "links",
          label: "Enlaces",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.label || "Enlace" }) },
          fields: [
            { name: "label", label: "Texto", type: "string" },
            { name: "url", label: "URL", type: "string" },
            { name: "external", label: "Abre en otra pestaña", type: "boolean" },
            {
              name: "productsMenu",
              label: "Abre el mega-menú de productos",
              description: "Activarlo solo en \"Productos\": muestra las categorías de WooCommerce.",
              type: "boolean",
            },
          ],
        },
        {
          type: "object",
          name: "cta",
          label: "Botón \"Cotiza aquí\"",
          description: "Abre el modal de cotización.",
          fields: [{ name: "label", label: "Texto", type: "string" }],
        },
        {
          type: "object",
          name: "panel",
          label: "Panel del menú ☰",
          fields: [
            {
              type: "object",
              name: "cards",
              label: "Tarjetas con imagen",
              list: true,
              ui: { itemProps: (item) => ({ label: item?.title || "Tarjeta" }) },
              fields: [
                { name: "image", label: "Imagen", type: "image" },
                { name: "imageAlt", label: "Texto alternativo de la imagen", type: "string" },
                { name: "title", label: "Título", type: "string" },
                { name: "text", label: "Texto", type: "string" },
                { name: "url", label: "URL", type: "string" },
              ],
            },
            {
              type: "object",
              name: "columns",
              label: "Columnas de enlaces",
              list: true,
              ui: { itemProps: (item) => ({ label: item?.title || "Columna" }) },
              fields: [
                { name: "title", label: "Título", type: "string" },
                {
                  type: "object",
                  name: "links",
                  label: "Enlaces",
                  list: true,
                  ui: { itemProps: (item) => ({ label: item?.label || "Enlace" }) },
                  fields: [
                    { name: "label", label: "Texto", type: "string" },
                    { name: "url", label: "URL", type: "string" },
                  ],
                },
              ],
            },
            { name: "contactTitle", label: "Título de la columna de contacto", type: "string" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "search",
      label: "Búsqueda",
      fields: [{ name: "placeholder", label: "Texto del campo de búsqueda", type: "string" }],
    },
    {
      type: "object",
      name: "whatsappButton",
      label: "Botón flotante de WhatsApp",
      fields: [{ name: "enabled", label: "Mostrar el botón", type: "boolean" }],
    },
    {
      type: "object",
      name: "catalog",
      label: "Catálogo PDF",
      description: "Sin archivo, los enlaces al catálogo no se muestran.",
      fields: [
        { name: "label", label: "Texto del enlace", type: "string" },
        { name: "file", label: "Archivo PDF", type: "image" },
      ],
    },
    {
      type: "object",
      name: "categoryIcons",
      label: "Íconos por categoría de productos",
      description: "Los usan el menú de productos y la sección de especialidades de la Home.",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.categorySlug || "Categoría" }) },
      fields: [
        { name: "categorySlug", label: "Slug de la categoría en WooCommerce", type: "string" },
        { name: "icon", label: "Ícono", type: "string", options: ICON_OPTIONS },
      ],
    },
    {
      type: "object",
      name: "footer",
      label: "Footer",
      fields: [
        { name: "tagline", label: "Frase", type: "string" },
        {
          type: "object",
          name: "columns",
          label: "Columnas",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.title || "Columna" }) },
          fields: [
            { name: "title", label: "Título", type: "string" },
            {
              type: "object",
              name: "links",
              label: "Enlaces",
              list: true,
              ui: { itemProps: (item) => ({ label: item?.label || "Enlace" }) },
              fields: [
                { name: "label", label: "Texto", type: "string" },
                { name: "url", label: "URL", type: "string" },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "social",
          label: "Redes sociales",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.network || "Red" }) },
          fields: [
            {
              name: "network",
              label: "Red",
              type: "string",
              options: ["linkedin", "instagram", "facebook", "x", "youtube", "tiktok", "whatsapp"],
            },
            { name: "url", label: "URL", type: "string" },
          ],
        },
        { name: "legal", label: "Línea legal", type: "string" },
      ],
    },
    {
      name: "whatsapp",
      label: "WhatsApp comercial (solo dígitos, con código de país)",
      description: "Lo usa el botón \"Solicitar cotización\" de cada producto. Ej.: 51983511262",
      type: "string",
    },
    {
      type: "object",
      name: "company",
      label: "Datos de la empresa",
      description: "Los usan la página de Contacto y, más adelante, el footer.",
      fields: [
        { name: "address", label: "Dirección", type: "string", ui: { component: "textarea" } },
        { name: "phone", label: "Teléfono", description: "Con código de país, tal como se muestra. Ej.: (+51) 1 222-0571", type: "string" },
        { name: "emails", label: "Correos", type: "string", list: true },
        { name: "hours", label: "Horario", type: "string" },
      ],
    },
    {
      type: "object",
      name: "seo",
      label: "SEO por defecto",
      fields: [
        { name: "title", label: "Título por defecto", type: "string" },
        { name: "description", label: "Descripción por defecto", type: "string", ui: { component: "textarea" } },
        { name: "ogImage", label: "Imagen para compartir (1200×630)", type: "image" },
      ],
    },
    {
      type: "object",
      name: "codeInjection",
      label: "Código inyectado (analytics, píxeles)",
      description: "HTML crudo. Se inserta tal cual; un error aquí puede romper el sitio.",
      fields: [
        { name: "head", label: "Antes de </head>", type: "string", ui: { component: "textarea" } },
        { name: "bodyEnd", label: "Antes de </body>", type: "string", ui: { component: "textarea" } },
      ],
    },
  ],
};
