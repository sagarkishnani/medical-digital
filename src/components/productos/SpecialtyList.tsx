import type { CatalogSpecialty } from "../../utils/catalog/types";

interface Props {
  specialties: CatalogSpecialty[];
  activeSpecialty: string | null;
  productsHref: string;
  query: string;
  large?: boolean;
}

export default function SpecialtyList({ specialties, activeSpecialty, productsHref, query, large = false }: Props) {
  const links = [
    { slug: null, name: "Todos los productos", href: productsHref },
    ...specialties.map((specialty) => ({ slug: specialty.slug, name: specialty.name, href: specialty.href })),
  ];

  return (
    <ul className="flex flex-col">
      {links.map((link) => {
        const active = link.slug === activeSpecialty;
        return (
          <li key={link.href}>
            <a
              href={`${link.href}${query}`}
              aria-current={active ? "page" : undefined}
              className={`flex items-center transition-colors hover:text-brand-secondary-dark ${large ? "min-h-12 text-body-md" : "min-h-11 text-body-md"} ${active ? (link.slug ? "font-medium text-brand-secondary-dark" : "font-medium text-accent") : "text-content-muted"}`}
            >
              {link.name}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
