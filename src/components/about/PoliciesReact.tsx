import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { FaCircleCheck, FaFilePdf } from "react-icons/fa6";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function PoliciesReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  const policies = data?.about?.policies;
  const items = (policies?.items || []).filter((item: any) => item?.title);
  if (!policies || items.length === 0) return <div hidden />;

  const activeIndex = Math.min(selected, items.length - 1);
  const active = items[activeIndex];
  const points = (active.points || []).filter(Boolean);

  const focusTab = (index: number) => {
    const next = (index + items.length) % items.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, number> = {
      ArrowDown: activeIndex + 1,
      ArrowRight: activeIndex + 1,
      ArrowUp: activeIndex - 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusTab(moves[event.key]);
    }
  };

  return (
    <section id="politicas" className="bg-surface-raised">
      <div className="container-xl grid items-start gap-10 py-16 md:py-24 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col gap-6 lg:sticky lg:top-[120px]">
          {policies.title && (
            <h2 className="text-heading-h2 text-brand-secondary-dark lg:text-heading-h1" data-tina-field={tinaField(policies, "title")}>
              {policies.title}
            </h2>
          )}
          <div role="tablist" aria-orientation="vertical" aria-label={policies.title || "Políticas"} className="flex flex-col gap-2">
            {items.map((item: any, index: number) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={index}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${index}`}
                  aria-selected={isActive}
                  aria-controls={`${id}-panel`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setSelected(index)}
                  onKeyDown={onKeyDown}
                  className={`flex min-h-14 items-center rounded-xl border px-5 text-left text-subtitle transition-colors ${
                    isActive
                      ? "border-brand-secondary-dark bg-brand-secondary-dark text-white"
                      : "border-line bg-surface text-brand-secondary-dark hover:border-brand-secondary-dark"
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${activeIndex}`}
          className="flex flex-col gap-6 rounded-2xl bg-surface p-6 md:p-12"
        >
          <h3 className="text-heading-h3 text-brand-secondary-dark" data-tina-field={tinaField(active, "title")}>
            {active.title}
          </h3>
          {active.intro && (
            <p className="text-body-lg text-content-muted" data-tina-field={tinaField(active, "intro")}>
              {active.intro}
            </p>
          )}
          {points.length > 0 && (
            <ul className="flex flex-col border-t border-line">
              {points.map((point: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-4 border-b border-line py-4 text-body-md text-brand-secondary-dark"
                  data-tina-field={tinaField(active, "points", index)}
                >
                  <FaCircleCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-tertiary-dark" />
                  {point}
                </li>
              ))}
            </ul>
          )}
          {active.document && (
            <a
              href={mediaUrl(active.document)}
              download
              className="flex items-center gap-2 self-start text-link text-brand-secondary-dark hover:underline"
              data-tina-field={tinaField(active, "document")}
            >
              <FaFilePdf aria-hidden="true" className="h-5 w-5 text-brand-primary" />
              Descargar documento completo
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
