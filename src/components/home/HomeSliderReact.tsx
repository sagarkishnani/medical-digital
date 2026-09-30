import { useTina, tinaField } from "tinacms/dist/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useSlider } from "../../hooks/useSlider";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function HomeSliderReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const slides = (data?.home?.slides || []).filter(Boolean);
  const slider = useSlider({ loop: slides.length > 1, active: slides.length > 1 });

  if (slides.length === 0) return <div hidden />;

  return (
    <section
      className="relative overflow-hidden bg-gradient-primary"
      aria-roledescription="carrusel"
      aria-label="Destacados de Medical Digital"
    >
      <div ref={slider.viewportRef} className="overflow-hidden" tabIndex={0} onKeyDown={slider.onKeyDown}>
        <div className="flex">
          {slides.map((slide: any, index: number) => (
            <div
              key={index}
              className="relative flex min-h-[520px] min-w-0 flex-[0_0_100%] items-center md:min-h-[640px]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${slides.length}`}
              aria-hidden={index !== slider.activeIndex}
            >
              {slide.image && (
                <>
                  <img
                    src={mediaUrl(slide.image)}
                    alt={slide.imageAlt || ""}
                    width={1440}
                    height={640}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover object-right"
                    data-tina-field={tinaField(slide, "image")}
                  />
                  <div className="absolute inset-0 bg-gradient-overlay" />
                </>
              )}
              <div className="container-xl relative py-24 md:px-20 lg:px-28">
                <div className="flex max-w-[620px] flex-col gap-5 text-white">
                  {slide.eyebrow && (
                    <p className="text-body-md text-brand-tertiary-lightest md:text-body-lg" data-tina-field={tinaField(slide, "eyebrow")}>
                      {slide.eyebrow}
                    </p>
                  )}
                  {index === 0 ? (
                    <h1 className="text-heading-h1 text-balance md:text-display" data-tina-field={tinaField(slide, "title")}>
                      {slide.title}
                    </h1>
                  ) : (
                    <h2 className="text-heading-h1 text-balance md:text-display" data-tina-field={tinaField(slide, "title")}>
                      {slide.title}
                    </h2>
                  )}
                  {slide.text && (
                    <p className="max-w-[500px] text-body-md text-brand-tertiary-lightest md:text-body-lg" data-tina-field={tinaField(slide, "text")}>
                      {slide.text}
                    </p>
                  )}
                  {slide.ctaLabel && slide.ctaUrl && (
                    <div className="mt-2">
                      <a
                        href={slide.ctaUrl}
                        className="btn-primary"
                        tabIndex={index === slider.activeIndex ? 0 : -1}
                        data-tina-field={tinaField(slide, "ctaLabel")}
                      >
                        {slide.ctaLabel}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={slider.prev}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-pill border border-white/40 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-secondary-dark md:flex lg:left-7"
          >
            <FaChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={slider.next}
            aria-label="Slide siguiente"
            className="absolute right-4 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-pill border border-white/40 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-secondary-dark md:flex lg:right-7"
          >
            <FaChevronRight aria-hidden="true" />
          </button>
          <div className="absolute inset-x-0 bottom-8 flex justify-center gap-1">
            {slider.scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => slider.goTo(index)}
                aria-label={`Ir al slide ${index + 1}`}
                aria-current={index === slider.activeIndex}
                className="flex h-11 items-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-pill transition-all duration-300 ${
                    index === slider.activeIndex ? "w-8 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
