import { PiXLight } from "react-icons/pi";

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

interface Props {
  total: number;
  filters: ActiveFilter[];
  canClear: boolean;
  onClear: () => void;
}

const chipClassName =
  "relative inline-flex h-8 items-center gap-1.5 rounded-pill bg-brand-tertiary-lightest pl-3 pr-2.5 text-caption font-medium text-brand-tertiary-dark transition-colors hover:bg-brand-tertiary-light/40 lg:pl-3.5 lg:text-body-sm after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']";

export default function ActiveFilters({ total, filters, canClear, onClear }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
      <p aria-live="polite" className="text-body-sm text-content-subtle lg:text-body-md">
        {total} {total === 1 ? "producto" : "productos"}
      </p>
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={filter.onRemove}
          aria-label={`Quitar filtro ${filter.label}`}
          className={chipClassName}
        >
          {filter.label}
          <PiXLight aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      ))}
      {canClear && (
        <button
          type="button"
          onClick={onClear}
          className="min-h-11 px-1 text-caption text-content-subtle underline underline-offset-2 hover:text-brand-secondary-dark lg:text-body-sm"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
