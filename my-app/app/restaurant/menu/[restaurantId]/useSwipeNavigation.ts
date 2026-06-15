import { useRef } from "react";
import type { TouchEvent } from "react";

const SWIPE_THRESHOLD = 40;

export function useSwipeNavigation(onPrev: () => void, onNext: () => void) {
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (deltaX > SWIPE_THRESHOLD) {
      onPrev();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      onNext();
    }
  };

  return { onTouchStart, onTouchEnd };
}
