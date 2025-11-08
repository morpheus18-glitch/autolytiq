let scrollLockCount = 0;
let previousOverflow: string | null = null;
let previousPaddingRight: string | null = null;

function getScrollbarWidth(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  return window.innerWidth - document.documentElement.clientWidth;
}

export function lockScroll(): void {
  if (typeof document === 'undefined') {
    return;
  }

  scrollLockCount += 1;

  if (scrollLockCount > 1) {
    return;
  }

  previousOverflow = document.body.style.overflow;
  previousPaddingRight = document.body.style.paddingRight;

  const scrollbarWidth = getScrollbarWidth();

  document.body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  document.body.dataset.scrollLocked = 'true';
}

export function unlockScroll(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (scrollLockCount === 0) {
    return;
  }

  scrollLockCount = Math.max(0, scrollLockCount - 1);

  if (scrollLockCount === 0) {
    document.body.style.overflow = previousOverflow ?? '';
    document.body.style.paddingRight = previousPaddingRight ?? '';
    previousOverflow = null;
    previousPaddingRight = null;
    delete document.body.dataset.scrollLocked;
  }
}
