import { useEffect } from "react";

type SwipeListeners = {
    onSwipeRight?: () => void
}

const MIN_SWIPE_DISTANCE = 50;

export function useSwipe(componentRef: React.RefObject<HTMLDivElement | null>, {
    onSwipeRight
}: SwipeListeners) {

  useEffect(() => {
    const container = componentRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchEndX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX) return;
      
      touchEndX = e.changedTouches[0].clientX;
      const distance = touchEndX - touchStartX;

      if (distance > MIN_SWIPE_DISTANCE) {
        onSwipeRight?.();
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
}