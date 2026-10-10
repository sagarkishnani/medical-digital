import type { Collection } from "tinacms";

export const serviceCollection: Collection = {
  name: "service",
  label: "Servicio técnico",
  path: "src/content/service",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "hero",
      label: "Cabecera",
      fields: [
        { name: "title", label: "Título", type: "string", required: true },
        { name: "text", label: "Bajada", type: "string", ui: { component: "textarea" } },
      ],
    },
    {
      type: "object",
      name: "form",
      label: "Formulario",
      fields: [
        { name: "incidentHint", label: "Nota del mensaje (**)", description: "Vacía, no se muestra.", type: "string", ui: { component: "textarea" } },
        { name: "requiredNote", label: "Nota de campos obligatorios (*)", description: "Vacía, no se muestra.", type: "string" },
        { name: "consentLabel", label: "Texto del consentimiento", description: "Ej.: He leído y acepto la", type: "string" },
        { name: "privacyLabel", label: "Texto del enlace a la política", description: "Ej.: Política de uso de datos personales", type: "string" },
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
      name: "seo",
      label: "SEO",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
      ],
    },
  ],
};
