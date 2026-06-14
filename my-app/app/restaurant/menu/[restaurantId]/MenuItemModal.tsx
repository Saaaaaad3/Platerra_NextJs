"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MenuItem } from "../../../../lib/demo-menu-items";

type MenuItemModalProps = {
  item: MenuItem | null;
  onClose: () => void;
};

export default function MenuItemModal({ item, onClose }: MenuItemModalProps) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!item) return;
    setActiveImage(0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const images = item.itemImages?.length ? item.itemImages : ["/img/DummyDishImage.jpg"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl animate-modal-panel sm:max-w-lg sm:rounded-[2rem]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-item-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M10 8.586 4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586Z" />
          </svg>
        </button>

        <div className="relative h-64 w-full flex-shrink-0 bg-slate-100 sm:h-80">
          <Image
            src={images[activeImage]}
            alt={`${item.itemName} photo ${activeImage + 1}`}
            fill
            sizes="(min-width: 640px) 32rem, 100vw"
            className="object-cover"
            priority
          />

          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show photo ${index + 1} of ${item.itemName}`}
                  onClick={() => setActiveImage(index)}
                  className={`h-2 w-2 rounded-full transition ${
                    index === activeImage ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="menu-item-modal-title" className="text-2xl font-semibold text-slate-900">
              {item.itemName}
            </h2>
            <span className="inline-flex flex-shrink-0 rounded-full bg-slate-900 px-4 py-2 text-md font-semibold text-white">
              ${item.itemPrice}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {item.itemBestSeller && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-700">
                Bestseller
              </span>
            )}
            {item.itemIsVeg ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                Veg
              </span>
            ) : (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-medium text-rose-700">
                Non-Veg
              </span>
            )}
            {item.itemIsJain && (
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-medium text-violet-700">
                Jain
              </span>
            )}
            {item.itemSweet && (
              <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 font-medium text-pink-700">
                Sweet
              </span>
            )}
            {item.itemSpicy && (
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-700">
                {"🌶️".repeat(Math.max(1, item.itemSpiceLevel))} Spicy
              </span>
            )}
          </div>

          <p className="text-base leading-7 text-slate-600">{item.itemDescription}</p>

          {item.ingredients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Ingredients
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
