import { useEffect, useRef, useState } from "react";
import type { AnimationEvent } from "react";
import { PiCaretLeftLight, PiCaretRightLight, PiMagnifyingGlassPlusLight, PiXLight } from "react-icons/pi";
import { useSlider } from "../../hooks/useSlider";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";

export interface GalleryImage {
  src: string;
  thumbSrc: string;
  zoomSrc: string;
  width: number;
  height: number;
  alt: string;
}

interface Props {
  images: GalleryImage[];
}

const roundButtonClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-brand-secondary-dark transition-colors duration-200 can-hover:hover:bg-greyscale-lightest";

function ZoomDialog({
  images,
  index,
  onNavigate,
  onClose,
}: {
  images: GalleryImage[];
  index: number | null;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const open = index !== null;
  const shownIndex = useRef(0);
  if (index !== null) shownIndex.current = index;
  const current = shownIndex.current;
  const image = images[current];
  const multiple = images.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setClosing(false);
      dialog.showModal();
      lockScroll();
    } else if (!open && dialog.open) {
      setClosing(true);
    }
  }, [open]);

  useEffect(() => () => unlockScroll(), []);

  const finishClosing = (event: AnimationEvent<HTMLDialogElement>) => {
    if (!closing || event.target !== dialogRef.current) return;
    dialogRef.current.close();
    unlockScroll();
    setClosing(false);
  };

  const step = (direction: 1 | -1) => onNavigate((current + direction + images.length) % images.length);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Fotos del producto"
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (!multiple) return;
        if (event.key === "ArrowRight") step(1);
        if (event.key === "ArrowLeft") step(-1);
      }}
      onAnimationEnd={finishClosing}
      className={`m-0 h-full max-h-none w-full max-w-none bg-surface-raised p-0 text-brand-secondary-dark backdrop:bg-transparent ${
        closing ? "animate-fade-out" : "open:animate-fade-in"
      }`}
    >
      {image && (
        <div className="flex h-full flex-col">
          <div className="flex justify-end p-4">
            <button type="button" onClick={onClose} aria-label="Cerrar" className={`${roundButtonClass} h-12 w-12`}>
              <PiXLight aria-hidden="true" className="h-[22px] w-[22px]" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-3 sm:px-[clamp(12px,6vw,96px)]">
            <img
              key={image.zoomSrc}
              src={image.zoomSrc}
              alt={image.alt}
              width={image.width}
              height={image.height}
              decoding="async"
              className="h-full max-h-full w-full animate-modal-in object-contain mix-blend-multiply"
            />
          </div>
          <div className="flex items-center justify-center gap-3.5 p-5">
            {multiple && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Foto anterior" className={roundButtonClass}>
                  <PiCaretLeftLight aria-hidden="true" className="h-4 w-4" />
                </button>
                <p aria-live="polite" className="min-w-[3.5rem] text-center text-body-sm tabular-nums">
                  {current + 1} / {images.length}
                </p>
                <button type="button" onClick={() => step(1)} aria-label="Foto siguiente" className={roundButtonClass}>
                  <PiCaretRightLight aria-hidden="true" className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

export default function ProductGalleryReact({ images }: Props) {
  const hasThumbnails = images.length > 1;
  const slider = useSlider({ loop: false, active: hasThumbnails });
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return <div className="aspect-square rounded-3xl bg-surface-raised" />;
  }

  const navigateZoom = (index: number) => {
    setZoomIndex(index);
    slider.goTo(index);
  };

  return (
    <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-[96px_minmax(0,1fr)] lg:gap-4">
      <div className="relative lg:order-2">
        <div ref={slider.viewportRef} className="overflow-hidden rounded-3xl">
          <ul className="flex touch-pan-y">
            {images.map((image, index) => (
              <li
                key={image.src}
                className="flex aspect-square min-w-0 flex-[0_0_100%] items-center justify-center bg-surface-raised"
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
        <button
          type="button"
          onClick={() => setZoomIndex(hasThumbnails ? slider.activeIndex : 0)}
          aria-label="Ampliar foto"
          aria-haspopup="dialog"
          className="absolute bottom-3.5 right-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand-secondary-dark shadow-sm transition-transform duration-200 can-hover:hover:scale-[1.08] lg:bottom-[18px] lg:right-[18px]"
        >
          <PiMagnifyingGlassPlusLight aria-hidden="true" className="h-[22px] w-[22px]" />
        </button>
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

      <ZoomDialog images={images} index={zoomIndex} onNavigate={navigateZoom} onClose={() => setZoomIndex(null)} />
    </div>
  );
}
