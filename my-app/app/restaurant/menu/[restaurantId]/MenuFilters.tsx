"use client";

import { useEffect, useRef, useState } from "react";
import { FILTERS, type FilterKey } from "./menuFilterUtils";

type MenuFiltersProps = {
  searchText: string;
  onSearchChange: (value: string) => void;
  activeFilters: FilterKey[];
  onToggleFilter: (filter: FilterKey) => void;
};

export default function MenuFilters({
  searchText,
  onSearchChange,
  activeFilters,
  onToggleFilter,
}: MenuFiltersProps) {
  const chipsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollFades = () => {
    const el = chipsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollFades();
    window.addEventListener("resize", updateScrollFades);
    return () => window.removeEventListener("resize", updateScrollFades);
  }, []);

  return (
    <div className="sticky top-0 z-20 space-y-3 bg-brand-surface p-3 text-brand-on-surface shadow-sm shadow-black/5 sm:space-y-4 sm:p-4">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-on-surface/40"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          inputMode="search"
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search dishes, ingredients..."
          aria-label="Search menu"
          className="w-full rounded-full border border-brand-on-surface/15 bg-brand-on-surface/5 py-2.5 pl-12 pr-12 text-sm text-brand-on-surface placeholder:text-brand-on-surface/40 focus:border-brand-on-surface/40 focus:outline-none sm:py-3"
        />
        {searchText && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-brand-on-surface/40 transition hover:bg-brand-on-surface/10 hover:text-brand-on-surface"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10 8.586 4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586Z" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative -mx-3 sm:-mx-4">
        <div
          ref={chipsRef}
          onScroll={updateScrollFades}
          className="flex gap-2 overflow-x-auto px-3 sm:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilters.includes(filter.key);
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => onToggleFilter(filter.key)}
                aria-pressed={isActive}
                className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 ${
                  isActive
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-brand-on-surface/15 bg-brand-surface text-brand-on-surface/70 hover:border-brand-on-surface/30"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {canScrollLeft && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand-surface to-transparent sm:w-10"
          />
        )}
        {canScrollRight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-surface to-transparent sm:w-10"
          />
        )}
      </div>
    </div>
  );
}
