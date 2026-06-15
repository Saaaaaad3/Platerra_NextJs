"use client";

import Image from "next/image";
import { useSwipeNavigation } from "./useSwipeNavigation";
import GalleryControls from "./GalleryControls";

type FullScreenMediaViewerProps = {
  images: string[];
  activeIndex: number;
  itemName: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export default function FullScreenMediaViewer({
  images,
  activeIndex,
  itemName,
  onIndexChange,
  onClose,
}: FullScreenMediaViewerProps) {
  const goToImage = (index: number) => {
    onIndexChange(((index % images.length) + images.length) % images.length);
  };
  const showPrev = () => goToImage(activeIndex - 1);
  const showNext = () => goToImage(activeIndex + 1);
  const { onTouchStart, onTouchEnd } = useSwipeNavigation(showPrev, showNext);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black animate-fade-in"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close full screen view"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M10 8.586 4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586Z" />
        </svg>
      </button>

      <div
        className="relative h-full w-full touch-pan-y"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={images[activeIndex]}
          alt={`${itemName} photo ${activeIndex + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />

        <GalleryControls
          itemName={itemName}
          images={images}
          activeIndex={activeIndex}
          onSelect={goToImage}
          onPrev={showPrev}
          onNext={showNext}
        />
      </div>
    </div>
  );
}
