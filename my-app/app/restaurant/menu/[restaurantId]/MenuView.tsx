"use client";

import { useMemo, useState } from "react";
import SmartImage from "./SmartImage";
import type { MenuItem } from "../../../../lib/demo-menu-items";
import MenuItemModal from "./MenuItemModal";
import CategoryNav from "./CategoryNav";
import MenuFilters from "./MenuFilters";
import { itemMatchesFilter, itemMatchesSearch, UNCATEGORISED_KEY, type FilterKey } from "./menuFilterUtils";

type MenuViewProps = {
  menuByCategory: Record<string, MenuItem[]>;
};

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.918Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ItemRow({
  item,
  onSelect,
}: {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="flex w-full items-center gap-4 rounded-2xl py-4 text-left transition active:bg-brand-on-surface/5 sm:gap-5"
    >
      <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-brand-on-surface/10 sm:h-36 sm:w-36">
        <SmartImage
          src={item.itemImages?.[0] ?? "/img/DummyDishImage.jpg"}
          alt={`${item.itemName} thumbnail`}
          fill
          className="object-cover"
          sizes="(min-width: 640px) 9rem, 8rem"
        />
        {item.itemIsNew && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-accent-foreground shadow-sm">
            New
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-snug text-brand-on-surface sm:text-2xl">
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
          <span className="hidden flex-shrink-0 rounded-full bg-brand px-4 py-1.5 text-base font-semibold text-brand-foreground sm:inline-flex">
            ${item.itemPrice}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-brand-on-surface/70 sm:mt-2 sm:leading-6">
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
          <span className="flex-shrink-0 rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground sm:hidden">
            ${item.itemPrice}
          </span>
        </div>
      </div>
    </button>
  );
}

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

  const popularItems = useMemo(
    () =>
      Object.values(filteredMenuByCategory)
        .flat()
        .filter((item) => item.itemPopularThisWeek),
    [filteredMenuByCategory]
  );

  const allItems = useMemo(() => Object.values(menuByCategory).flat(), [menuByCategory]);

  // Uncategorised items render as a headerless card and never appear in the nav.
  const uncategorisedItems = filteredMenuByCategory[UNCATEGORISED_KEY] ?? [];

  const namedCategories = useMemo(
    () => Object.entries(filteredMenuByCategory).filter(([category]) => category !== UNCATEGORISED_KEY),
    [filteredMenuByCategory]
  );

  const navMenuByCategory = useMemo(() => {
    const named = Object.fromEntries(namedCategories);
    return popularItems.length > 0
      ? { "popular-this-week": popularItems, ...named }
      : named;
  }, [popularItems, namedCategories]);

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
        <div className="mt-4 rounded-[2rem] bg-brand-surface px-6 py-12 text-center text-brand-on-surface/70 shadow-sm shadow-black/5">
          No dishes match your search or filters.
        </div>
      )}

      {hasResults && (
        <section className="mt-4 space-y-4">
          {popularItems.length > 0 && (
            <details
              id="category-popular-this-week"
              open
              className="scroll-mt-4 overflow-hidden rounded-[2rem] bg-brand-surface text-brand-on-surface shadow-sm shadow-black/5"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 border-b border-brand-on-surface/10 px-4 py-3 text-left text-lg font-semibold text-brand-on-surface transition-opacity hover:opacity-70 sm:px-6 sm:py-5 sm:text-xl">
                <span className="flex items-center gap-2">
                  <TrendingIcon className="h-5 w-5 flex-shrink-0 text-orange-400 sm:h-6 sm:w-6" />
                  Popular this week
                </span>
                <span className="rounded-full bg-brand-secondary px-3 py-1 text-sm font-medium text-brand-secondary-foreground">
                  {popularItems.length}
                </span>
              </summary>
              <div className="divide-y divide-brand-on-surface/10 px-3 py-1 sm:px-6 sm:py-2">
                {popularItems.map((item) => (
                  <ItemRow key={item.itemId} item={item} onSelect={setSelectedItem} />
                ))}
              </div>
            </details>
          )}

          {namedCategories.map(([category, items]) => (
            <details
              key={category}
              id={`category-${category}`}
              open
              className="scroll-mt-4 overflow-hidden rounded-[2rem] bg-brand-surface text-brand-on-surface shadow-sm shadow-black/5"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 border-b border-brand-on-surface/10 px-4 py-3 text-left text-lg font-semibold text-brand-on-surface transition-opacity hover:opacity-70 sm:px-6 sm:py-5 sm:text-xl">
                <span className="capitalize">{category.replace(/-/g, " ")}</span>
                <span className="rounded-full bg-brand-secondary px-3 py-1 text-sm font-medium text-brand-secondary-foreground">
                  {items.length}
                </span>
              </summary>
              <div className="divide-y divide-brand-on-surface/10 px-3 py-1 sm:px-6 sm:py-2">
                {items.map((item) => (
                  <ItemRow key={item.itemId} item={item} onSelect={setSelectedItem} />
                ))}
              </div>
            </details>
          ))}

          {/* Uncategorised — headerless card, always last, no nav entry */}
          {uncategorisedItems.length > 0 && (
            <div className="overflow-hidden rounded-[2rem] bg-brand-surface text-brand-on-surface shadow-sm shadow-black/5">
              <div className="divide-y divide-brand-on-surface/10 px-3 py-1 sm:px-6 sm:py-2">
                {uncategorisedItems.map((item) => (
                  <ItemRow key={item.itemId} item={item} onSelect={setSelectedItem} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <MenuItemModal
        item={selectedItem}
        allItems={allItems}
        onClose={() => setSelectedItem(null)}
        onSelectItem={setSelectedItem}
      />
      <CategoryNav menuByCategory={navMenuByCategory} />
    </>
  );
}
