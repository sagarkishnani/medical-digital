export interface WooImage {
  src: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand: string | null;
  brandSlug: string | null;
  brandLogo: WooImage | null;
  shortDescription: string;
  description: string;
  images: WooImage[];
  categories: Pick<WooCategory, "id" | "name" | "slug">[];
  crossSellIds: number[];
  upsellIds: number[];
}

export type WooVideo = { kind: "youtube"; id: string } | { kind: "file"; src: string };

export interface WooProductExtras {
  datasheetUrl: string | null;
  specifications: string;
  accessories: string;
  video: WooVideo | null;
}
