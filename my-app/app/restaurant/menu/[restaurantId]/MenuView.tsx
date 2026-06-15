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
            <div className="space-y-3 px-3 py-3 sm:space-y-4 sm:px-6 sm:py-6">
              {items.map((item) => (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="w-full overflow-hidden rounded-[1.75rem] bg-slate-50 p-3 text-left transition active:scale-[0.99] active:bg-slate-100 sm:p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                    <div className="relative h-28 w-full overflow-hidden rounded-[1.75rem] bg-slate-100 sm:h-32 sm:w-40 sm:flex-shrink-0">
                      <Image
                        src={item.itemImages?.[0] ?? "/img/DummyDishImage.jpg"}
                        alt={`${item.itemName} thumbnail`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div>
                          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-2xl">
                            {item.itemName}
                            {item.itemBestSeller && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-5 w-5 flex-shrink-0 text-amber-400"
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
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600 sm:mt-2">
                            {item.itemDescription}
                          </p>
                        </div>
                        <div className="inline-flex self-start rounded-full bg-slate-900 px-4 py-2 text-md font-semibold text-white">
                          ${item.itemPrice}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 sm:mt-5">
                    {item.itemIsVeg && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                        Veg
                      </span>
                    )}
                    {item.itemSpicy && (
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                        Spicy
                      </span>
                    )}
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
