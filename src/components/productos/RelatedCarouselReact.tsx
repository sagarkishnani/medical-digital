import { useEffect, useState, type ReactNode } from "react";
import { useSlider } from "../../hooks/useSlider";

const DESKTOP_QUERY = "(min-width: 1024px)";

interface Props {
  children: ReactNode;
}

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return desktop;
}

export default function RelatedCarouselReact({ children }: Props) {
  const desktop = useIsDesktop();
  const slider = useSlider({ loop: false, active: !desktop, container: "[data-related-track]" });

  return (
    <div ref={slider.viewportRef} className="-mx-5 overflow-hidden px-5 md:-mx-8 md:px-8 lg:mx-0 lg:overflow-visible lg:px-0">
      {children}
    </div>
  );
}
