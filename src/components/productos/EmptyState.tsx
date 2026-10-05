import { PiMagnifyingGlassLight } from "react-icons/pi";

interface Props {
  onClear: () => void;
}

export default function EmptyState({ onClear }: Props) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-brand-secondary-light px-4 py-10 text-center lg:gap-3.5 lg:p-16">
      <PiMagnifyingGlassLight aria-hidden="true" className="hidden h-12 w-12 text-brand-secondary-light lg:block" />
      <p className="text-subtitle text-brand-secondary-dark lg:text-heading-h4">No hay productos con estos filtros</p>
      <button
        type="button"
        onClick={onClear}
        className="min-h-11 px-2 text-body-sm font-medium text-accent hover:underline lg:text-body-md"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
