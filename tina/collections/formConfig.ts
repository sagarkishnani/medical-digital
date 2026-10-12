import type { Collection } from "tinacms";

export const formConfigCollection: Collection = {
  name: "formConfig",
  label: "Formularios: destinatarios",
  path: "src/content/form-config",
  format: "json",
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: "object",
      name: "forms",
      label: "Formularios",
      description: "Los cambios llegan al sitio con el próximo deploy.",
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.label || item?.formType }),
      },
      fields: [
        {
          name: "formType",
          label: "Formulario",
          type: "string",
          options: [
            { value: "contacto", label: "Contacto" },
            { value: "cotizacion", label: "Cotización" },
            { value: "servicio-tecnico", label: "Servicio técnico" },
          ],
        },
        { name: "label", label: "Nombre en el panel", type: "string" },
        {
          name: "enabled",
          label: "Recibir envíos",
          description: "Apagado, el formulario muestra el mensaje de error.",
          type: "boolean",
        },
        {
          name: "recipients",
          label: "Correos que reciben el formulario",
          description: "Vacío, se usa el correo de respaldo del servidor.",
          type: "string",
          list: true,
        },
      ],
    },
  ],
};
