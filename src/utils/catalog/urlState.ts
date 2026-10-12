import { CATALOG_PARAM_KEYS, DEFAULT_CATALOG_STATE, SORT_OPTIONS } from "./types";
import type { CatalogState, SortKey } from "./types";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const SORT_KEYS = new Set<string>(SORT_OPTIONS.map((option) => option.key));

interface ParseOptions {
  knownBrands?: ReadonlySet<string>;
  knownSpecialties?: ReadonlySet<string>;
  implicitSpecialty?: string | null;
}

export function parseCatalogUrl(search: string, options: ParseOptions = {}): CatalogState {
  const { knownBrands, knownSpecialties, implicitSpecialty } = options;
  const params = new URLSearchParams(search);
  const especialidad = (params.get("especialidad") || "").trim();
  const orden = params.get("orden") || "";
  const pagina = Number.parseInt(params.get("pagina") || "", 10);
  const marca = (params.get("marca") || "")
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug, index, all) => SLUG_PATTERN.test(slug) && all.indexOf(slug) === index)
    .filter((slug) => !knownBrands || knownBrands.has(slug));

  return {
    especialidad:
      implicitSpecialty ??
      (SLUG_PATTERN.test(especialidad) && (!knownSpecialties || knownSpecialties.has(especialidad)) ? especialidad : null),
    q: (params.get("q") || "").trim().slice(0, 100),
    marca,
    orden: SORT_KEYS.has(orden) ? (orden as SortKey) : DEFAULT_CATALOG_STATE.orden,
    pagina: Number.isFinite(pagina) && pagina >= 2 ? pagina : 1,
  };
}

export function serializeCatalogUrl(
  state: CatalogState,
  options: { keepPage?: boolean; omitSpecialty?: boolean } = {},
): string {
  const params = new URLSearchParams();
  if (state.especialidad && !options.omitSpecialty) params.set("especialidad", state.especialidad);
  if (state.q) params.set("q", state.q);
  if (state.marca.length > 0) params.set("marca", state.marca.join(","));
  if (state.orden !== DEFAULT_CATALOG_STATE.orden) params.set("orden", state.orden);
  if ((options.keepPage ?? true) && state.pagina > 1) params.set("pagina", String(state.pagina));
  const query = params.toString().replace(/%2C/g, ",");
  return query ? `?${query}` : "";
}

export function hasCatalogParams(search: string): boolean {
  const params = new URLSearchParams(search);
  return CATALOG_PARAM_KEYS.some((key) => params.has(key));
}
