import { useSlider } from "../../hooks/useSlider";

export interface GalleryImage {
  src: string;
  thumbSrc: string;
  width: number;
  height: number;
  alt: string;
}

interface Props {
  images: GalleryImage[];
}

export default function ProductGalleryReact({ images }: Props) {
  const hasThumbnails = images.length > 1;
  const slider = useSlider({ loop: false, active: hasThumbnails });

  if (images.length === 0) {
    return <div className="aspect-square rounded-3xl bg-surface-raised" />;
  }

  return (
    <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-[96px_minmax(0,1fr)] lg:gap-4">
      <div ref={slider.viewportRef} className="overflow-hidden rounded-3xl bg-surface-raised lg:order-2">
        <ul className="flex touch-pan-y">
          {images.map((image, index) => (
            <li
              key={image.src}
              className="flex aspect-square min-w-0 flex-[0_0_100%] items-center justify-center"
              aria-hidden={hasThumbnails && index !== slider.activeIndex ? true : undefined}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="h-[78%] w-[78%] object-contain mix-blend-multiply"
              />
            </li>
          ))}
        </ul>
      </div>

      {hasThumbnails && (
        <ul className="flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:gap-3 lg:overflow-visible">
          {images.map((image, index) => {
            const active = index === slider.activeIndex;
            return (
              <li key={image.src} className="shrink-0">
                <button
                  type="button"
                  onClick={() => slider.goTo(index)}
                  aria-label={`Ver foto ${index + 1} de ${images.length}`}
                  aria-current={active ? "true" : undefined}
                  className={`flex h-[72px] w-[72px] items-center justify-center rounded-xl border-[1.5px] bg-surface-raised transition-colors duration-300 motion-reduce:transition-none lg:h-24 lg:w-24 ${
                    active ? "border-brand-secondary-dark" : "border-line can-hover:hover:border-greyscale-medium"
                  }`}
                >
                  <img
                    src={image.thumbSrc}
                    alt=""
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="h-[78%] w-[78%] object-contain mix-blend-multiply"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
