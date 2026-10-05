import { useId } from "react";
import { PiMagnifyingGlassLight } from "react-icons/pi";

interface Props {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export default function SearchField({ value, onChange, compact = false }: Props) {
  const id = useId();
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        Buscar producto
      </label>
      <PiMagnifyingGlassLight
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-subtle"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar producto…"
        autoComplete="off"
        enterKeyHint="search"
        className={`w-full rounded-xl border border-line bg-surface pl-12 pr-4 text-brand-secondary-dark placeholder:text-content-subtle transition-colors focus:border-brand-secondary-dark focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${compact ? "h-12 text-body-md" : "h-12 text-body-md"}`}
      />
    </div>
  );
}
