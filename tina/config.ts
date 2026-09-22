import { defineConfig } from "tinacms";
import { globalCollection } from "./collections/global";
import { homeCollection } from "./collections/home";
import { postCollection } from "./collections/post";
import { maintenanceCollection } from "./collections/maintenance";
import { cookieConsentCollection } from "./collections/cookieConsent";

/**
 * TinaCMS schema — the single source of truth for the shape of the content.
 * Types, GraphQL queries and the typed client are generated into
 * tina/__generated__/ by `tinacms build` / `tinacms dev`; never edit those.
 *
 * Each collection lives in its own file under tina/collections/ so this file
 * stays a table of contents. Adding a collection = one file + one line here.
 */
export default defineConfig({
  // Baked into the generated client at build time; NOT read at runtime.
  branch: process.env.TINA_BRANCH || "staging",
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",

  build: {
    outputFolder: "admin",   // CMS panel served at /admin
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      globalCollection,
      homeCollection,
      postCollection,
      maintenanceCollection,
      cookieConsentCollection,
    ],
  },
});
