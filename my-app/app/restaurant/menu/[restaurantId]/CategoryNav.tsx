"use client";

import { useState } from "react";
import type { MenuItem } from "../../../../lib/demo-menu-items";

type CategoryNavProps = {
  menuByCategory: Record<string, MenuItem[]>;
};

export default function CategoryNav({ menuByCategory }: CategoryNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const categories = Object.entries(menuByCategory);

  if (categories.length <= 1) return null;

  const scrollToCategory = (category: string) => {
    document.getElementById(`category-${category}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-6 right-6 z-40">
        {isOpen && (
          <div
            role="menu"
            aria-label="Jump to category"
            className="absolute bottom-16 right-0 mb-2 max-h-[60vh] w-64 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl shadow-slate-300/60 ring-1 ring-slate-100 animate-fade-in"
          >
            {categories.map(([category, items]) => (
              <button
                key={category}
                type="button"
                role="menuitem"
                onClick={() => scrollToCategory(category)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <span className="capitalize">{category.replace(/-/g, " ")}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {items.length}
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close category menu" : "Open category menu"}
          aria-expanded={isOpen}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-400/50 transition hover:bg-slate-800 active:scale-95"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
              <path d="M10 8.586 4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 0 1 2.75 4h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75ZM7 4.75A.75.75 0 0 1 7.75 4h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 7 4.75ZM7 10a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 7 10Zm0 5.25a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
