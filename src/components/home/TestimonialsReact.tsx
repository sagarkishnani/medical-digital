import { useTina, tinaField } from "tinacms/dist/react";
import { FaChevronLeft, FaChevronRight, FaQuoteLeft, FaStar } from "react-icons/fa6";
import { useSlider } from "../../hooks/useSlider";

interface Props {
  query: string;
  variables: object;
  data: any;
}

function initials(name: string): string {
  return name
    .replace(/^(dra?|lic|mg|ing|sr|sra)\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

const arrowClass =
  "flex h-12 w-12 items-center justify-center rounded-pill border transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export default function TestimonialsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const testimonials = data?.home?.testimonials;
  const items = (testimonials?.items || []).filter((item: any) => item?.text);
  const slider = useSlider({ loop: false, align: "start" });

  if (!testimonials || items.length === 0) return <div hidden />;

  const rating = testimonials.rating ? (
    <p className="flex flex-wrap items-center gap-2.5 text-body-sm text-content-muted">
      <span className="flex gap-0.5 text-semantics-alert" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <FaStar key={index} />
        ))}
      </span>
      <span className="font-medium text-brand-secondary-dark" data-tina-field={tinaField(testimonials, "rating")}>
        {testimonials.rating}
      </span>
      {testimonials.reviewsCount ? (
        <span data-tina-field={tinaField(testimonials, "reviewsCount")}>· {testimonials.reviewsCount} reseñas en Google</span>
      ) : null}
    </p>
  ) : null;

  return (
    <section className="bg-surface-raised" aria-roledescription="carrusel" aria-label="Testimonios de clientes">
      <div className="container-xl flex flex-col gap-10 py-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-[640px] flex-col gap-3">
            {testimonials.title && (
              <h2 className="text-heading-h2 text-brand-secondary-dark lg:text-heading-h1" data-tina-field={tinaField(testimonials, "title")}>
                {testimonials.title}
              </h2>
            )}
            {testimonials.reviewsUrl && rating ? (
              <a href={testimonials.reviewsUrl} target="_blank" rel="noopener noreferrer" className="self-start hover:underline">
                {rating}
              </a>
            ) : (
              rating
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={slider.prev}
              disabled={!slider.canPrev}
              aria-label="Testimonio anterior"
              className={`${arrowClass} border-line bg-surface text-brand-secondary-dark hover:border-brand-secondary-dark`}
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={slider.next}
              disabled={!slider.canNext}
              aria-label="Testimonio siguiente"
              className={`${arrowClass} border-brand-secondary-dark bg-brand-secondary-dark text-white hover:bg-brand-tertiary-dark`}
            >
              <FaChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div ref={slider.viewportRef} className="overflow-hidden" tabIndex={0} onKeyDown={slider.onKeyDown}>
          <ul className="-ml-6 flex">
            {items.map((item: any, index: number) => (
              <li
                key={index}
                className="min-w-0 flex-[0_0_100%] pl-6 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${items.length}`}
              >
                <figure className="flex h-full min-h-[300px] flex-col justify-between gap-7 rounded-2xl bg-surface p-8">
                  <div className="flex flex-col gap-4">
                    <FaQuoteLeft aria-hidden="true" className="h-8 w-8 text-brand-tertiary-light" />
                    <blockquote className="text-body-lg text-brand-secondary-dark text-pretty" data-tina-field={tinaField(item, "text")}>
                      {item.text}
                    </blockquote>
                  </div>
                  <figcaption className="flex items-center gap-3.5 border-t border-line pt-5">
                    <span
                      aria-hidden="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-pill bg-brand-tertiary-lightest text-subtitle text-brand-tertiary-dark"
                    >
                      {initials(item.name || "")}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-subtitle text-brand-secondary-dark" data-tina-field={tinaField(item, "name")}>
                        {item.name}
                      </span>
                      {item.role && (
                        <span className="text-body-sm text-content-subtle" data-tina-field={tinaField(item, "role")}>
                          {item.role}
                        </span>
                      )}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
