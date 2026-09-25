/**
 * Experience — company accordion.
 * Click a company header to toggle it. Only one company stays open at a time.
 */

export function initExperienceAccordion(): void {
  const acc = document.querySelector('.acc');
  if (!acc) return;

  const items = Array.from(acc.querySelectorAll<HTMLElement>('.exp'));

  items.forEach((item) => {
    const head = item.querySelector<HTMLElement>('.exp-head');
    const toggle = item.querySelector<HTMLElement>('.exp-toggle');
    if (!head || !toggle) return;

    const activate = (): void => {
      const wasOpen = item.classList.contains('is-open');

      items.forEach((other) => {
        other.classList.remove('is-open');
        const t = other.querySelector<HTMLElement>('.exp-toggle');
        const h = other.querySelector<HTMLElement>('.exp-head');
        if (t) t.textContent = 'Expand +';
        if (h) h.setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('is-open');
        toggle.textContent = 'Collapse −';
        head.setAttribute('aria-expanded', 'true');
      }
    };

    head.addEventListener('click', activate);
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}
