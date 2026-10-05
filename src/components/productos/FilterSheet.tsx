import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AnimationEvent, ReactNode } from "react";
import { PiXLight } from "react-icons/pi";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";

const CLOSE_FALLBACK_MS = 300;

interface Props {
  open: boolean;
  total: number;
  onClose: () => void;
  onClear: () => void;
  children: ReactNode;
}

export default function FilterSheet({ open, total, onClose, onClear, children }: Props) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setClosing(false);
      if (!dialog.open) {
        dialog.showModal();
        dialog.focus();
        lockScroll();
      }
    } else if (dialog.open) {
      setClosing(true);
    }
  }, [open]);

  useEffect(() => () => unlockScroll(), []);

  const finishClosing = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
    setClosing(false);
    unlockScroll();
  }, []);

  useEffect(() => {
    if (!closing) return;
    // Safari no siempre emite animationend al cerrar: sin este respaldo la hoja queda abierta e invisible.
    const timer = window.setTimeout(finishClosing, CLOSE_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [closing, finishClosing]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDialogElement>) => {
    if (closing && event.target === dialogRef.current && !event.pseudoElement) finishClosing();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onAnimationEnd={handleAnimationEnd}
      tabIndex={-1}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className={`mb-0 mt-auto max-h-[86vh] outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full max-w-full flex-col overflow-hidden rounded-t-2xl bg-surface p-0 text-brand-secondary-dark backdrop:bg-brand-secondary-darkest/50 open:flex md:mx-auto md:max-w-lg lg:hidden ${closing ? "animate-sheet-out backdrop:animate-fade-out" : "open:animate-sheet-in backdrop:animate-fade-in"}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
        <h2 id={`${id}-title`} className="text-heading-h4">
          Filtros
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar filtros"
          className="flex h-11 w-11 items-center justify-center rounded-pill bg-greyscale-lightest transition-colors hover:bg-greyscale-light"
        >
          <PiXLight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <div data-lenis-prevent className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pb-5 pt-3">
        {children}
      </div>
      <div className="flex shrink-0 gap-2.5 border-t border-line px-4 pb-5 pt-3.5">
        <button
          type="button"
          onClick={onClear}
          className="btn border-line bg-surface px-6 text-brand-secondary-dark hover:bg-surface-raised"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn flex-1 bg-brand-secondary-dark text-white hover:bg-brand-tertiary-dark"
        >
          Ver {total} {total === 1 ? "producto" : "productos"}
        </button>
      </div>
    </dialog>
  );
}
