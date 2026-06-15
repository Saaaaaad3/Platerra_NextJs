type GalleryControlsProps = {
  itemName: string;
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function GalleryControls({
  itemName,
  images,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}: GalleryControlsProps) {
  if (images.length <= 1) return null;

  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous photo"
        className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white sm:flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next photo"
        className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white sm:flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show photo ${index + 1} of ${itemName}`}
            onClick={() => onSelect(index)}
            className={`h-2 w-2 rounded-full transition ${
              index === activeIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </>
  );
}
