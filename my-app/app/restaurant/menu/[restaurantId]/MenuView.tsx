"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { MenuItem } from "../../../../lib/demo-menu-items";
import MenuItemModal from "./MenuItemModal";
import CategoryNav from "./CategoryNav";
import MenuFilters from "./MenuFilters";
import { itemMatchesFilter, itemMatchesSearch, type FilterKey } from "./menuFilterUtils";

type MenuViewProps = {
  menuByCategory: Record<string, MenuItem[]>;
};

export default function MenuView({ menuByCategory }: MenuViewProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);

  const toggleFilter = (filter: FilterKey) => {
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((f) => f !== filter) : [...current, filter]
    );
  };

  const filteredMenuByCategory = useMemo(() => {
    const result: Record<string, MenuItem[]> = {};
    for (const [category, items] of Object.entries(menuByCategory)) {
      const matches = items.filter(
        (item) =>
          itemMatchesSearch(item, searchText) &&
          activeFilters.every((filter) => itemMatchesFilter(item, filter))
      );
      if (matches.length > 0) result[category] = matches;
    }
    return result;
  }, [menuByCategory, searchText, activeFilters]);

  const hasResults = Object.keys(filteredMenuByCategory).length > 0;

  return (
    <>
      <MenuFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
      />

      {!hasResults && (
        <div className="mt-4 rounded-[2rem] bg-white px-6 py-12 text-center text-slate-500 shadow-sm shadow-slate-200">
          No dishes match your search or filters.
        </div>
      )}

      {hasResults && (
      <section className="mt-4 space-y-4">
        {Object.entries(filteredMenuByCategory).map(([category, items]) => (
          <details
            key={category}
            id={`category-${category}`}
            open
            className="scroll-mt-4 overflow-hidden rounded-[2rem] bg-white shadow-sm shadow-slate-200"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 text-left text-lg font-semibold text-slate-900 transition-colors hover:text-slate-700 sm:px-6 sm:py-5 sm:text-xl">
              <span className="capitalize">{category.replace(/-/g, " ")}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {items.length}
              </span>
            </summary>
            <div className="divide-y divide-slate-100 px-3 py-1 sm:px-6 sm:py-2">
              {items.map((item) => (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="flex w-full items-center gap-4 rounded-2xl py-4 text-left transition active:bg-slate-50 sm:gap-5"
                >
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-36 sm:w-36">
                    <Image
                      src={item.itemImages?.[0] ?? "/img/DummyDishImage.jpg"}
                      alt={`${item.itemName} thumbnail`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 640px) 9rem, 8rem"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold leading-snug text-slate-900 sm:text-2xl">
                      <span
                        className={`mr-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border align-middle ${
                          item.itemIsVeg ? "border-emerald-600" : "border-rose-700"
                        }`}
                        aria-label={item.itemIsVeg ? "Vegetarian" : "Non-vegetarian"}
                      >
                        {item.itemIsVeg ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        ) : (
                          <span className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-rose-700" />
                        )}
                      </span>
                      {item.itemName}
                      {item.itemBestSeller && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="ml-1.5 inline h-4 w-4 align-middle text-amber-400 sm:h-5 sm:w-5"
                          aria-label="Bestseller"
                          role="img"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L10 18.354l-4.626 2.81c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </h2>
                    <span className="hidden flex-shrink-0 rounded-full bg-slate-900 px-4 py-1.5 text-base font-semibold text-white sm:inline-flex">
                      ${item.itemPrice}
                    </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600 sm:mt-2 sm:leading-6">
                      {item.itemDescription}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {item.itemSpicy && (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs text-rose-700">
                            Spicy
                          </span>
                        )}
                      </div>
                      <span className="flex-shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white sm:hidden">
                        ${item.itemPrice}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </details>
        ))}
      </section>
      )}

      <MenuItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <CategoryNav menuByCategory={filteredMenuByCategory} />
    </>
  );
}
