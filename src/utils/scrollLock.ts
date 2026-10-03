interface SmoothScroller {
  stop: () => void;
  start: () => void;
}

function smoothScroller(): SmoothScroller | undefined {
  return (window as unknown as { lenis?: SmoothScroller }).lenis;
}

export function lockScroll(): void {
  document.documentElement.style.overflow = "hidden";
  smoothScroller()?.stop();
}

export function unlockScroll(): void {
  document.documentElement.style.overflow = "";
  smoothScroller()?.start();
}
