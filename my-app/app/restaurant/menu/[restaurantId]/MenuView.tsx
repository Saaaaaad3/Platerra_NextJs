"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuItem } from "../../../../lib/demo-menu-items";
import MenuItemModal from "./MenuItemModal";

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
            open
            className="overflow-hidden rounded-[2rem] bg-white shadow-sm shadow-slate-200"
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
                          <h2 className="text-2xl font-semibold text-slate-900">{item.itemName}</h2>
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
                    {item.itemBestSeller && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                        Bestseller
                      </span>
                    )}
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
    </>
  );
}
