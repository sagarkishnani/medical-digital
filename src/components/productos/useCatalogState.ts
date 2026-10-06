import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CATALOG_STATE } from "../../utils/catalog/types";
import type { CatalogState } from "../../utils/catalog/types";
import { parseCatalogUrl, serializeCatalogUrl } from "../../utils/catalog/urlState";

const SEARCH_DEBOUNCE_MS = 300;

export type HistoryMode = "push" | "replace" | "debounce";

interface Options {
  brandSlugs: string[];
  specialtySlugs: string[];
  implicitSpecialty: string | null;
  productsHref: string;
}

export function useCatalogState({ brandSlugs, specialtySlugs, implicitSpecialty, productsHref }: Options) {
  const knownBrands = useMemo(() => new Set(brandSlugs), [brandSlugs]);
  const knownSpecialties = useMemo(() => new Set(specialtySlugs), [specialtySlugs]);
  const [state, setState] = useState<CatalogState>({ ...DEFAULT_CATALOG_STATE, especialidad: implicitSpecialty });
  const [ready, setReady] = useState(false);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const readUrl = () =>
      setState(parseCatalogUrl(window.location.search, { knownBrands, knownSpecialties, implicitSpecialty }));
    readUrl();
    setReady(true);
    window.addEventListener("popstate", readUrl);
    return () => {
      window.removeEventListener("popstate", readUrl);
      window.clearTimeout(debounceRef.current);
    };
  }, [knownBrands, knownSpecialties, implicitSpecialty]);

  const writeUrl = useCallback(
    (next: CatalogState, mode: "push" | "replace") => {
      const query = serializeCatalogUrl(next, { omitSpecialty: implicitSpecialty !== null });
      const url = `${window.location.pathname}${query}${window.location.hash}`;
      if (url === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
      window.history[mode === "push" ? "pushState" : "replaceState"]({ catalog: true }, "", url);
    },
    [implicitSpecialty],
  );

  const update = useCallback(
    (next: CatalogState, mode: HistoryMode = "push") => {
      window.clearTimeout(debounceRef.current);
      if (implicitSpecialty !== null && next.especialidad !== implicitSpecialty) {
        window.location.assign(`${productsHref}${serializeCatalogUrl({ ...next, pagina: 1 })}`);
        return;
      }
      setState(next);
      if (mode === "debounce") {
        debounceRef.current = window.setTimeout(() => writeUrl(next, "replace"), SEARCH_DEBOUNCE_MS);
      } else {
        writeUrl(next, mode);
      }
    },
    [implicitSpecialty, productsHref, writeUrl],
  );

  return { state, update, ready };
}
