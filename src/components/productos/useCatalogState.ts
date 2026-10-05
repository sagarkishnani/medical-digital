import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CATALOG_STATE } from "../../utils/catalog/types";
import type { CatalogState } from "../../utils/catalog/types";
import { parseCatalogUrl, serializeCatalogUrl } from "../../utils/catalog/urlState";

const SEARCH_DEBOUNCE_MS = 300;

export type HistoryMode = "push" | "replace" | "debounce";

function writeUrl(state: CatalogState, mode: "push" | "replace") {
  const url = `${window.location.pathname}${serializeCatalogUrl(state)}${window.location.hash}`;
  if (url === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
}

export function useCatalogState(brandSlugs: string[]) {
  const knownBrands = useMemo(() => new Set(brandSlugs), [brandSlugs]);
  const [state, setState] = useState<CatalogState>(DEFAULT_CATALOG_STATE);
  const [ready, setReady] = useState(false);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const readUrl = () => setState(parseCatalogUrl(window.location.search, knownBrands));
    readUrl();
    setReady(true);
    window.addEventListener("popstate", readUrl);
    return () => {
      window.removeEventListener("popstate", readUrl);
      window.clearTimeout(debounceRef.current);
    };
  }, [knownBrands]);

  const update = useCallback((next: CatalogState, mode: HistoryMode = "push") => {
    setState(next);
    window.clearTimeout(debounceRef.current);
    if (mode === "debounce") {
      debounceRef.current = window.setTimeout(() => writeUrl(next, "replace"), SEARCH_DEBOUNCE_MS);
    } else {
      writeUrl(next, mode);
    }
  }, []);

  return { state, update, ready };
}
