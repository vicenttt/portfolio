/**
 * Section entrance animation.
 * Adds .is-visible when a section scrolls into view (downward).
 * Removes it when scrolled past upward, so it replays on the next pass down.
 * The visual treatment (translateY + opacity) lives in styles.css.
 */

export function initSectionTransitions(): void {
  const sections = document.querySelectorAll<HTMLElement>('main > .section');
  if (sections.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach((s) => s.classList.add('is-visible'));
    return;
  }

  let lastScrollY = window.scrollY;
  let direction: 'down' | 'up' = 'down';
  window.addEventListener(
    'scroll',
    () => {
      direction = window.scrollY > lastScrollY ? 'down' : 'up';
      lastScrollY = window.scrollY;
    },
    { passive: true },
  );

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting && direction === 'down') {
          el.classList.add('is-visible');
        } else if (!entry.isIntersecting && direction === 'up') {
          el.classList.remove('is-visible');
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -10% 0px' },
  );

  sections.forEach((s) => observer.observe(s));
}
