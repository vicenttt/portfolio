export function initScrollAnimations(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll<HTMLElement>('.highlight-card, .skill-card').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }
  let lastScrollY = window.scrollY;
  let direction: 'down' | 'up' = 'down';
  window.addEventListener('scroll', () => {
    direction = window.scrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = window.scrollY;
  }, { passive: true });
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting && direction === 'down') el.classList.add('is-visible');
      else if (!entry.isIntersecting && direction === 'up') el.classList.remove('is-visible');
    }
  }, { threshold: 0.18 });
  document.querySelectorAll<HTMLElement>('.highlight-card, .skill-card')
    .forEach((el) => observer.observe(el));
}
