import type { Collection } from "tinacms";

export const promoPopupCollection: Collection = {
  name: "promoPopup",
  label: "Popup de promoción",
  path: "src/content/promo-popup",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/" },
  fields: [
    {
      name: "enabled",
      label: "Mostrar el popup",
      type: "boolean",
      description: "Se aplica en el próximo deploy. Aparece en todo el sitio, una vez por visitante.",
    },
    {
      name: "campaign",
      label: "Identificador de la promoción",
      type: "string",
      description:
        "Quien cerró el popup no lo vuelve a ver mientras este valor no cambie. Cámbialo (p. ej. 'navidad-2026') para mostrar una promoción nueva a todos.",
    },
    {
      name: "delaySeconds",
      label: "Segundos antes de aparecer",
      type: "number",
      description: "Vacío: 5 segundos.",
    },
    {
      name: "image",
      label: "Imagen",
      type: "image",
      description: "Opcional. WebP, máximo 1440 px de ancho y menos de 300 KB, en /uploads/promo/.",
    },
    { name: "imageAlt", label: "Texto alternativo de la imagen", type: "string" },
    { name: "title", label: "Título", type: "string" },
    { name: "text", label: "Texto", type: "string", ui: { component: "textarea" } },
    { name: "buttonLabel", label: "Texto del botón", type: "string", description: "Vacío: no se muestra el botón." },
    { name: "buttonUrl", label: "Enlace del botón", type: "string" },
  ],
};
