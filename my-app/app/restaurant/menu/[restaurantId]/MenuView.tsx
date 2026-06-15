"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuItem } from "../../../../lib/demo-menu-items";
import MenuItemModal from "./MenuItemModal";
import CategoryNav from "./CategoryNav";

type MenuViewProps = {
  menuByCategory: Record<string, MenuItem[]>;
};

export default function MenuView({ menuByCategory }: MenuViewProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  return (
    <>
      <section className="space-y-4">
        {Object.entries(menuByCategory).map(([category, items]) => (
          <details
            key={category}
            id={`category-${category}`}
            open
            className="scroll-mt-4 overflow-hidden rounded-[2rem] bg-white shadow-sm shadow-slate-200"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 text-left text-xl font-semibold text-slate-900 transition-colors hover:text-slate-700">
              <span className="capitalize">{category.replace(/-/g, " ")}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {items.length}
              </span>
            </summary>
            <div className="space-y-4 px-6 py-6">
              {items.map((item) => (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="w-full overflow-hidden rounded-[1.75rem] bg-slate-50 p-6 text-left transition active:scale-[0.99] active:bg-slate-100"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="relative h-32 w-full overflow-hidden rounded-[1.75rem] bg-slate-100 sm:h-32 sm:w-40 sm:flex-shrink-0">
                      <Image
                        src={item.itemImages?.[0] ?? "/img/DummyDishImage.jpg"}
                        alt={`${item.itemName} thumbnail`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
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
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {item.itemDescription}
                          </p>
                        </div>
                        <div className="inline-flex self-start rounded-full bg-slate-900 px-4 py-2 text-md font-semibold text-white">
                          ${item.itemPrice}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
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

      <MenuItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <CategoryNav menuByCategory={menuByCategory} />
    </>
  );
}
