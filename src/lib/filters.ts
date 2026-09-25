import { type Artwork, getTypeLabel } from "@/lib/api";

export const FILTER_KEYS = ["movement", "type"] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Partial<Record<FilterKey, string>>;

export type FilterGroup = {
  key: FilterKey;
  label: string;
  value?: string;
  options: { value: string; label: string; count: number }[];
};

const groupLabels: Record<FilterKey, string> = {
  movement: "Movement",
  type: "Type",
};

const optionLabel = (key: FilterKey, value: string) =>
  key === "type" ? (getTypeLabel(value) ?? value) : value;

const matches = (artwork: Artwork, filters: Filters, ignored?: FilterKey) =>
  FILTER_KEYS.every(
    (key) => key === ignored || !filters[key] || artwork[key] === filters[key],
  );

export function parseFilters(
  artworks: Artwork[],
  searchParams: Record<string, string | string[] | undefined>,
): Filters {
  const filters: Filters = {};

  for (const key of FILTER_KEYS) {
    const param = searchParams[key];
    const value = Array.isArray(param) ? param[0] : param;
    if (value && artworks.some((artwork) => artwork[key] === value)) {
      filters[key] = value;
    }
  }

  return filters;
}

export function filterArtworks(artworks: Artwork[], filters: Filters) {
  return artworks.filter((artwork) => matches(artwork, filters));
}

export function getFilterGroups(
  artworks: Artwork[],
  filters: Filters,
): FilterGroup[] {
  return FILTER_KEYS.map((key) => {
    const values = new Set(
      artworks.flatMap((artwork) => (artwork[key] ? [artwork[key]] : [])),
    );

    const options = [...values]
      .map((value) => ({
        value,
        label: optionLabel(key, value),
        count: artworks.filter(
          (artwork) => artwork[key] === value && matches(artwork, filters, key),
        ).length,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));

    return { key, label: groupLabels[key], value: filters[key], options };
  });
}

export function describeFilters(filters: Filters) {
  return FILTER_KEYS.flatMap((key) => {
    const value = filters[key];
    return value ? [optionLabel(key, value)] : [];
  }).join(", ");
}
