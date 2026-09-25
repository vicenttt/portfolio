/**
 * Capability cards — reveal list items from top to bottom.
 *
 * When a .cap-card enters the viewport, add .is-revealed.
 * CSS handles the per-item stagger via nth-child delays.
 */

export function initCapabilityReveal(): void {
  const cards = document.querySelectorAll<HTMLElement>('.cap-card');
  if (cards.length === 0) return;

  // Reduced motion: reveal everything instantly
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach((c) => c.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.25, rootMargin: '0px 0px -10% 0px' },
  );

  cards.forEach((card) => observer.observe(card));
}

