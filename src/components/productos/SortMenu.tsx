import { useEffect, useId, useRef, useState } from "react";
import { PiCaretDownLight, PiCheckLight } from "react-icons/pi";
import { SORT_OPTIONS } from "../../utils/catalog/types";
import type { SortKey } from "../../utils/catalog/types";

interface Props {
  value: SortKey;
  onChange: (value: SortKey) => void;
}

export default function SortMenu({ value, onChange }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = SORT_OPTIONS.find((option) => option.key === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex min-h-11 items-center gap-2 text-body-sm font-medium text-brand-secondary-dark lg:text-body-md"
      >
        <span className="sr-only">Ordenar por: </span>
        {current.label}
        <PiCaretDownLight
          aria-hidden="true"
          className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      <ul
        id={`${id}-options`}
        className={`absolute right-0 top-[calc(100%+4px)] z-20 w-[210px] rounded-xl border border-line bg-surface p-1.5 shadow-lg motion-reduce:transition-none ${open ? "visible translate-y-0 opacity-100 transition-[opacity,transform] duration-300 ease-out" : "pointer-events-none invisible -translate-y-1.5 opacity-0 transition-[opacity,transform,visibility] duration-300 ease-out"}`}
      >
        {SORT_OPTIONS.map((option) => {
          const selected = option.key === value;
          return (
            <li key={option.key}>
              <button
                type="button"
                aria-current={selected ? "true" : undefined}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-body-sm hover:bg-surface-raised ${selected ? "font-medium text-accent" : "text-brand-secondary-dark"}`}
              >
                {option.label}
                {selected && <PiCheckLight aria-hidden="true" className="h-4 w-4" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
