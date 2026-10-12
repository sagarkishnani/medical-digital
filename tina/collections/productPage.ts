import type { Collection } from "tinacms";
import { ICON_OPTIONS } from "../../src/lib/icons";

export const productPageCollection: Collection = {
  name: "productPage",
  label: "Ficha de producto",
  path: "src/content/product-page",
  format: "json",
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: "object",
      name: "tag",
      label: "Etiqueta",
      description: "Aparece sobre el nombre en todas las fichas, junto a la especialidad.",
      fields: [
        { name: "label", label: "Texto", type: "string" },
        { name: "icon", label: "Ícono", type: "string", options: ICON_OPTIONS },
      ],
    },
    {
      type: "object",
      name: "badges",
      label: "Sellos",
      description: "Se muestran en todas las fichas, en escritorio, antes de \"Ficha técnica\". Quita un sello si no aplica a todo el catálogo.",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.label || "Sello" }) },
      fields: [
        { name: "label", label: "Texto", type: "string" },
        { name: "icon", label: "Ícono", type: "string", options: ICON_OPTIONS },
      ],
    },
  ],
};
