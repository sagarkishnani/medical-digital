import { useCallback, useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";

export interface UseSliderOptions {
  loop?: boolean;
  align?: "start" | "center";
  slidesToScroll?: number | "auto";
  active?: boolean;
}

export interface Slider {
  viewportRef: (node: HTMLElement | null) => void;
  activeIndex: number;
  scrollSnaps: number[];
  canPrev: boolean;
  canNext: boolean;
  reducedMotion: boolean;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function useSlider(options: UseSliderOptions = {}): Slider {
  const { loop = true, align = "start", slidesToScroll = 1, active = true } = options;

  const reducedMotion = usePrefersReducedMotion();
  const [viewportRef, embla] = useEmblaCarousel({ loop, align, slidesToScroll, active });

  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setActiveIndex(embla.selectedScrollSnap());
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    const syncSnaps = () => setScrollSnaps(embla.scrollSnapList());
    syncSnaps();
    onSelect();
    embla.on("select", onSelect);
    embla.on("reInit", syncSnaps);
    embla.on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect);
      embla.off("reInit", syncSnaps);
      embla.off("reInit", onSelect);
    };
  }, [embla, onSelect]);

  const next = useCallback(() => embla?.scrollNext(reducedMotion), [embla, reducedMotion]);
  const prev = useCallback(() => embla?.scrollPrev(reducedMotion), [embla, reducedMotion]);
  const goTo = useCallback(
    (index: number) => embla?.scrollTo(index, reducedMotion),
    [embla, reducedMotion]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    },
    [next, prev]
  );

  return {
    viewportRef,
    activeIndex,
    scrollSnaps,
    canPrev,
    canNext,
    reducedMotion,
    next,
    prev,
    goTo,
    onKeyDown,
  };
}
