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
      name: "form",
      label: "Formulario",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "locations", label: "Opciones de \"Ubicación\"", type: "string", list: true },
        { name: "consentLabel", label: "Texto del consentimiento", description: "Ej.: Acepto la", type: "string" },
        { name: "privacyLabel", label: "Texto del enlace a la política", description: "Ej.: política de datos personales", type: "string" },
        { name: "privacyUrl", label: "URL de la política de datos personales", description: "Sin URL, el texto se muestra sin enlace.", type: "string" },
        { name: "submitLabel", label: "Texto del botón", type: "string" },
        { name: "successTitle", label: "Éxito: título", type: "string" },
        { name: "successText", label: "Éxito: texto", type: "string", ui: { component: "textarea" } },
        { name: "successReset", label: "Éxito: enlace para enviar otro", type: "string" },
        { name: "errorText", label: "Error: mensaje", description: "Se muestra si el envío falla, con el enlace a WhatsApp.", type: "string", ui: { component: "textarea" } },
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
