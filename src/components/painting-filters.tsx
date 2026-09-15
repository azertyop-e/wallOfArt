"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import type { FilterGroup } from "@/lib/filters";

type PaintingFiltersProps = {
  groups: FilterGroup[];
  className?: string;
};

export function PaintingFilters({ groups, className }: PaintingFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useOptimistic(
    Object.fromEntries(groups.map((group) => [group.key, group.value ?? ""])),
  );

  const update = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    const params = new URLSearchParams(
      Object.entries(next).filter(([, entry]) => entry !== ""),
    );
    const query = params.toString();

    startTransition(() => {
      setValues(next);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <form
      aria-label="Filter paintings"
      aria-busy={pending}
      className={`flex flex-wrap items-center justify-center gap-x-gutter gap-y-2 transition-opacity duration-300 aria-busy:opacity-60 ${className ?? ""}`}
      onSubmit={(event) => event.preventDefault()}
    >
      {groups.map((group) => (
        <label key={group.key} className="flex items-center gap-2">
          <span className="text-muted">{group.label}</span>
          <span className="relative flex items-center">
            <select
              name={group.key}
              value={values[group.key]}
              onChange={(event) => update(group.key, event.target.value)}
              className="field-sizing-content cursor-pointer appearance-none bg-transparent pr-3 uppercase outline-offset-4 [&_option]:text-black [&_option]:normal-case"
            >
              <option value="">All</option>
              {group.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.count === 0}
                >
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute right-0">
              ↓
            </span>
          </span>
        </label>
      ))}
    </form>
  );
}
