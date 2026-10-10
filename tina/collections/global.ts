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
      description: "Sin archivo, los enlaces al catálogo se muestran pero no descargan nada.",
      fields: [
        { name: "label", label: "Texto del enlace en el menú de productos", type: "string" },
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
        { name: "catalogTitle", label: "Título del banner del catálogo", description: "El archivo es el del bloque \"Catálogo PDF\".", type: "string" },
        { name: "catalogButtonLabel", label: "Texto del botón del catálogo", type: "string" },
        {
          type: "object",
          name: "columns",
          label: "Columnas",
          description: "Una categoría de productos se enlaza con su slug de WooCommerce, por ejemplo /productos/categoria/cardiologia. Si el slug cambia en Woo, hay que actualizarlo aquí.",
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
        { name: "contactTitle", label: "Título de la columna de contacto", description: "Los datos salen de \"Datos de la empresa\".", type: "string" },
        { name: "certificationsTitle", label: "Título de las certificaciones", type: "string" },
        {
          type: "object",
          name: "certifications",
          label: "Certificaciones",
          description: "Sin certificaciones, el bloque no se muestra.",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.code || "Certificación" }) },
          fields: [
            { name: "code", label: "Código", description: "Ej.: ISO 9001:2015", type: "string" },
            { name: "name", label: "Nombre", description: "Ej.: Sistema de Gestión de Calidad", type: "string" },
          ],
        },
        {
          type: "object",
          name: "complaintsBook",
          label: "Libro de Reclamaciones",
          description: "Sin URL, el enlace no se muestra.",
          fields: [
            { name: "label", label: "Texto", type: "string" },
            { name: "url", label: "URL", type: "string" },
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
        { name: "legal", label: "Línea legal", description: "Sin © ni año: se agregan solos.", type: "string" },
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
      name: "quote",
      label: "Modal \"Solicitar cotización\"",
      fields: [
        { name: "recipientNote", label: "Línea de destino", description: "Ej.: Tu solicitud llegará a ventas@… Vacía, no se muestra.", type: "string" },
        { name: "consentLabel", label: "Texto del consentimiento", description: "Ej.: Acepto la", type: "string" },
        { name: "privacyLabel", label: "Texto del enlace a la política", description: "Ej.: política de datos personales", type: "string" },
        { name: "privacyUrl", label: "URL de la política de datos personales", description: "Sin URL, el texto se muestra sin enlace.", type: "string" },
        { name: "successTitle", label: "Éxito: título", type: "string" },
        { name: "successText", label: "Éxito: texto", type: "string", ui: { component: "textarea" } },
        { name: "closeLabel", label: "Éxito: botón para cerrar", type: "string" },
        { name: "errorText", label: "Error: mensaje", type: "string", ui: { component: "textarea" } },
      ],
    },
    {
      type: "object",
      name: "company",
      label: "Datos de la empresa",
      description: "Los usan la página de Contacto, el panel del menú y el footer.",
      fields: [
        { name: "address", label: "Dirección", type: "string", ui: { component: "textarea" } },
        { name: "phone", label: "Teléfono", description: "Con código de país, tal como se muestra. Ej.: (+51) 1 222-0571", type: "string" },
        { name: "emails", label: "Correos", type: "string", list: true },
        { name: "hours", label: "Horario", type: "string" },
        { name: "serviceEmail", label: "Correo de servicio técnico", description: "Lo usa la página de Servicio técnico. Vacío, no se muestra.", type: "string" },
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
