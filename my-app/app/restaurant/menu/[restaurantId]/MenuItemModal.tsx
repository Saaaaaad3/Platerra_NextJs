"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MenuItem } from "../../../../lib/demo-menu-items";
import { useSwipeNavigation } from "./useSwipeNavigation";
import GalleryControls from "./GalleryControls";
import FullScreenMediaViewer from "./FullScreenMediaViewer";

type MenuItemModalProps = {
  item: MenuItem | null;
  allItems: MenuItem[];
  onClose: () => void;
  onSelectItem: (item: MenuItem) => void;
};

type AllergenStyle = {
  label: string;
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  renderIcon: (cls: string) => React.ReactNode;
};

const ALLERGEN_CONFIG: Record<string, AllergenStyle> = {
  dairy: {
    label: "Dairy",
    bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", iconBg: "bg-sky-100",
    renderIcon: (cls) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
        <path d="M10 2.5c-.38 0-.7.32-1 .88C7.53 5.5 6 8.6 6 11.5a4 4 0 0 0 8 0c0-2.9-1.53-6-3-8.12-.3-.56-.62-.88-1-.88Z" />
      </svg>
    ),
  },
  gluten: {
    label: "Gluten",
    bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-100",
    renderIcon: (cls) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
        <path fillRule="evenodd" d="M10.75 18a.75.75 0 0 1-1.5 0V8.2C7.6 7.8 6.5 6.5 6.5 5c0-1.9 2.3-3.5 3.5-3.5S13.5 3.1 13.5 5c0 1.5-1.1 2.8-2.75 3.2v2.5c1.65.4 2.75 1.7 2.75 3.2 0 1.9-2.3 3.5-3.5 3.5S6.5 15.8 6.5 13.9c0-1.5 1.1-2.8 2.75-3.2V8.2C7.6 7.8 6.5 6.5 6.5 5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  nuts: {
    label: "Nuts",
    bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", iconBg: "bg-orange-100",
    renderIcon: (cls) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
        <path d="M10 2.5a3.5 3 0 1 0 0 6 3.5 3 0 0 0 0-6Zm0 7a3.5 3 0 1 0 0 6 3.5 3 0 0 0 0-6Z" />
      </svg>
    ),
  },
  eggs: {
    label: "Eggs",
    bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", iconBg: "bg-yellow-100",
    renderIcon: (cls) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
        <path d="M10 2c-2.8 0-4.5 3-4.5 7.5C5.5 14 7.5 18 10 18s4.5-4 4.5-8.5C14.5 5 12.8 2 10 2Z" />
      </svg>
    ),
  },
  soy: {
    label: "Soy",
    bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700", iconBg: "bg-lime-100",
    renderIcon: (cls) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
        <path d="M10 2C6.7 2 4 5 4 10c0 4.4 2.2 8 6 8 2 0 3.5-1 4.5-2.8C15.5 14 16 12 16 10c0-5-2.7-8-6-8Zm-1 13.8C6.5 14.8 6 12.5 6 10c0-3.3 1.5-6 3-7.8v13.6Z" />
      </svg>
    ),
  },
  sesame: {
    label: "Sesame",
    bg: "bg-green-50", border: "border-green-200", text: "text-green-700", iconBg: "bg-green-100",
    renderIcon: (cls) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
        <ellipse cx="10" cy="5" rx="2.2" ry="1.4" />
        <ellipse cx="6" cy="13" rx="2.2" ry="1.4" transform="rotate(-25 6 13)" />
        <ellipse cx="14" cy="13" rx="2.2" ry="1.4" transform="rotate(25 14 13)" />
      </svg>
    ),
  },
  fish: {
    label: "Fish",
    bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", iconBg: "bg-cyan-100",
    renderIcon: (cls) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
        <path d="M17 10c-1.5-2.5-4.5-4-7-4S3.5 7.5 2 10c1.5 2.5 4.5 4 8 4s5.5-1.5 7-4Zm-4.5 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
      </svg>
    ),
  },
  shellfish: {
    label: "Shellfish",
    bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", iconBg: "bg-rose-100",
    renderIcon: (cls) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
        <path d="M10 3C6.7 3 4 8 4 17h12C16 8 13.3 3 10 3Zm-3.5 14c.5-3.5 1.8-8 3.5-10 1.7 2 3 6.5 3.5 10H6.5Z" />
      </svg>
    ),
  },
};

const DEFAULT_ALLERGEN_STYLE: AllergenStyle = {
  label: "",
  bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", iconBg: "bg-slate-100",
  renderIcon: (cls) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  ),
};

function ScrollRow({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    update();
  });

  return (
    <div className="relative -mx-6">
      <div
        ref={scrollRef}
        onScroll={update}
        className="flex gap-3 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {canScrollLeft && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
      )}
      {canScrollRight && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
      )}
    </div>
  );
}

export default function MenuItemModal({ item, allItems, onClose, onSelectItem }: MenuItemModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const isViewerOpenRef = useRef(false);
  isViewerOpenRef.current = isViewerOpen;

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;
    setActiveImage(0);
    setIsViewerOpen(false);
    if (modalRef.current) modalRef.current.scrollTop = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isViewerOpenRef.current) {
          setIsViewerOpen(false);
        } else {
          onClose();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  const images = item?.itemImages?.length ? item.itemImages : ["/img/DummyDishImage.jpg"];

  const goToImage = (index: number) => {
    setActiveImage(((index % images.length) + images.length) % images.length);
  };
  const showPrevImage = () => goToImage(activeImage - 1);
  const showNextImage = () => goToImage(activeImage + 1);
  const { onTouchStart, onTouchEnd } = useSwipeNavigation(showPrevImage, showNextImage);

  if (!item) return null;

  const alsoTry = allItems.filter((i) => i.itemId !== item.itemId);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          className="relative flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl animate-modal-panel sm:max-w-lg sm:rounded-[2rem]"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-item-modal-title"
        >
          {/* Close button */}
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

          {/* Hero image */}
          <div
            className="relative h-72 w-full flex-shrink-0 touch-pan-y bg-slate-100 sm:h-96"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={images[activeImage]}
              alt={`${item.itemName} photo ${activeImage + 1}`}
              fill
              sizes="(min-width: 640px) 32rem, 100vw"
              className="cursor-pointer object-cover"
              priority
              onClick={() => setIsViewerOpen(true)}
            />
            <GalleryControls
              itemName={item.itemName}
              images={images}
              activeIndex={activeImage}
              onSelect={goToImage}
              onPrev={showPrevImage}
              onNext={showNextImage}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 px-6 py-8">

            {/* Title + price + pills grouped tightly */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <h2 id="menu-item-modal-title" className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
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
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L10 18.354l-4.626 2.81c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006Z" clipRule="evenodd" />
                    </svg>
                  )}
                </h2>
                <span className="inline-flex flex-shrink-0 rounded-full bg-slate-900 px-4 py-2 text-base font-semibold text-white">
                  ${item.itemPrice}
                </span>
              </div>

              {/* Quick-attribute pills */}
              <div className="flex flex-wrap gap-2 text-xs">
              {item.itemIsVeg ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">Veg</span>
              ) : (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-medium text-rose-700">Non-Veg</span>
              )}
              {item.itemIsJain && (
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-medium text-violet-700">Jain</span>
              )}
              {item.itemSweet && (
                <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 font-medium text-pink-700">Sweet</span>
              )}
              {item.itemSpicy && (
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-700">
                  {"🌶️".repeat(Math.max(1, item.itemSpiceLevel))}
                </span>
              )}
            </div>
            </div>

            {/* Description */}
            <p className="text-base leading-7 text-slate-600">{item.itemDescription}</p>

            {/* Contains / allergens */}
            {(item.allergens?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Contains</h3>
                <ScrollRow>
                  {item.allergens!.map((allergen) => {
                    const cfg = ALLERGEN_CONFIG[allergen] ?? { ...DEFAULT_ALLERGEN_STYLE, label: allergen };
                    return (
                      <div
                        key={allergen}
                        className={`flex flex-shrink-0 flex-col items-center gap-2 rounded-2xl border px-5 py-3 ${cfg.bg} ${cfg.border}`}
                      >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.iconBg}`}>
                          {cfg.renderIcon(`h-5 w-5 ${cfg.text}`)}
                        </span>
                        <span className={`whitespace-nowrap text-xs font-semibold ${cfg.text}`}>
                          {cfg.label || allergen}
                        </span>
                      </div>
                    );
                  })}
                </ScrollRow>
              </div>
            )}

            {/* Ingredients */}
            {(item.ingredients ?? []).length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {(item.ingredients ?? []).map((ingredient) => (
                    <span key={ingredient} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Also Try */}
            {alsoTry.length > 0 && (
              <>
                <hr className="border-slate-100" />
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Also Try</h3>
                  <ScrollRow>
                    {alsoTry.map((related) => (
                      <button
                        key={related.itemId}
                        type="button"
                        onClick={() => onSelectItem(related)}
                        className="flex flex-shrink-0 flex-col gap-2 text-left active:opacity-70"
                      >
                        <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-slate-100">
                          <Image
                            src={related.itemImages?.[0] ?? "/img/DummyDishImage.jpg"}
                            alt={related.itemName}
                            fill
                            className="object-cover"
                            sizes="6rem"
                          />
                        </div>
                        <div className="w-24">
                          <p className="truncate text-xs font-semibold leading-snug text-slate-800">{related.itemName}</p>
                          <p className="mt-0.5 text-xs text-slate-400">${related.itemPrice}</p>
                        </div>
                      </button>
                    ))}
                  </ScrollRow>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {isViewerOpen && (
        <FullScreenMediaViewer
          images={images}
          activeIndex={activeImage}
          itemName={item.itemName}
          onIndexChange={setActiveImage}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
}
