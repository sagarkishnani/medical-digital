import { useTina, tinaField } from "tinacms/dist/react";
import { PiCaretLeftLight, PiCaretRightLight } from "react-icons/pi";
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
      {data?.home?.seo?.title && <h1 className="sr-only">{data.home.seo.title}</h1>}
      <div ref={slider.viewportRef} className="overflow-hidden">
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
                    fetchPriority={index === 0 ? "high" : "low"}
                    className="absolute inset-0 h-full w-full object-cover object-center md:object-right"
                    data-tina-field={tinaField(slide, "image")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary-dark/90 via-brand-secondary-dark/60 to-brand-secondary-dark/35 md:bg-gradient-overlay" />
                </>
              )}
              <div className="container-xl relative px-10 pb-20 pt-24 md:px-20 md:py-24 lg:px-28">
                <div className="flex max-w-[320px] flex-col gap-3.5 text-white md:max-w-[620px] md:gap-5">
                  {slide.eyebrow && (
                    <p className="text-body-sm text-brand-tertiary-lightest md:text-body-lg" data-tina-field={tinaField(slide, "eyebrow")}>
                      {slide.eyebrow}
                    </p>
                  )}
                  <h2 className="text-heading-h2 text-balance md:text-display" data-tina-field={tinaField(slide, "title")}>
                    {slide.title}
                  </h2>
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
            className="absolute left-0 top-[calc(50%-50px)] flex h-11 w-11 items-center justify-center text-white md:left-4 md:top-1/2 md:h-14 md:w-14 md:-translate-y-1/2 md:rounded-pill md:border md:border-white/40 md:bg-white/10 md:backdrop-blur md:transition-colors md:hover:bg-white md:hover:text-brand-secondary-dark lg:left-7"
          >
            <PiCaretLeftLight aria-hidden="true" className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={slider.next}
            aria-label="Slide siguiente"
            className="absolute right-0 top-[calc(50%-50px)] flex h-11 w-11 items-center justify-center text-white md:right-4 md:top-1/2 md:h-14 md:w-14 md:-translate-y-1/2 md:rounded-pill md:border md:border-white/40 md:bg-white/10 md:backdrop-blur md:transition-colors md:hover:bg-white md:hover:text-brand-secondary-dark lg:right-7"
          >
            <PiCaretRightLight aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 md:bottom-8">
            {slider.scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => slider.goTo(index)}
                aria-label={`Ir al slide ${index + 1}`}
                aria-current={index === slider.activeIndex}
                className="flex h-11 items-center"
              >
                <span
                  className={`block h-1.5 rounded-pill transition-all duration-300 ${
                    index === slider.activeIndex ? "w-10 bg-white" : "w-2.5 bg-white/45"
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
