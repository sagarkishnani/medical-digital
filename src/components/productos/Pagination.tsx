import { PiArrowRightLight } from "react-icons/pi";

interface Props {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  onChange: (page: number) => void;
}

const itemClassName = "flex h-11 min-w-11 items-center justify-center rounded-pill px-3 text-body-md transition-colors";

export default function Pagination({ page, totalPages, hrefFor, onChange }: Props) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const isLast = page === totalPages;

  const go = (event: React.MouseEvent<HTMLAnchorElement>, target: number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onChange(target);
  };

  return (
    <nav aria-label="Paginación del catálogo" className="mt-6 flex justify-center lg:mt-10">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        {pages.map((target) => (
          <li key={target}>
            <a
              href={hrefFor(target)}
              onClick={(event) => go(event, target)}
              aria-current={target === page ? "page" : undefined}
              aria-label={`Página ${target}`}
              className={`${itemClassName} ${target === page ? "bg-brand-secondary-dark font-medium text-white" : "text-brand-secondary-dark hover:bg-surface-raised"}`}
            >
              {target}
            </a>
          </li>
        ))}
        <li>
          {isLast ? (
            <span aria-disabled="true" className={`${itemClassName} gap-2 text-content-subtle`}>
              Siguiente
              <PiArrowRightLight aria-hidden="true" className="h-4 w-4" />
            </span>
          ) : (
            <a
              href={hrefFor(page + 1)}
              onClick={(event) => go(event, page + 1)}
              rel="next"
              className={`${itemClassName} gap-2 font-medium text-brand-secondary-dark hover:bg-surface-raised`}
            >
              Siguiente
              <PiArrowRightLight aria-hidden="true" className="h-4 w-4" />
            </a>
          )}
        </li>
      </ul>
    </nav>
  );
}
