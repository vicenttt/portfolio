/**
 * Skill carousel — horizontal scroll-snap + focus + edge fade + dots.
 * Wraps .skill-grid in a .carousel-wrap container at runtime.
 */

export function initSkillCarousel(): void {
  const grid = document.querySelector<HTMLElement>('.skill-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.skill-card'));
  if (cards.length === 0) return;

  // ---------------------------------------------------------------------------
  // Wrap grid in .carousel-wrap + insert dots
  // ---------------------------------------------------------------------------
  const parent = grid.parentElement;
  if (!parent) return;

  const wrap = document.createElement('div');
  wrap.className = 'carousel-wrap';

  const dots = document.createElement('div');
  dots.className = 'carousel-dots';

  parent.insertBefore(wrap, grid);
  wrap.appendChild(grid);
  wrap.appendChild(dots);

  // ---------------------------------------------------------------------------
  // Edge state (at-start / at-end)
  // ---------------------------------------------------------------------------
  function updateEdges(): void {
    const max = grid!.scrollWidth - grid!.clientWidth;
    const x = grid!.scrollLeft;
    wrap.classList.toggle('at-start', x < 8);
    wrap.classList.toggle('at-end', x > max - 8);
  }

  // ---------------------------------------------------------------------------
  // Focus — nearest card to the viewport center of the grid
  // ---------------------------------------------------------------------------
  let raf: number | null = null;
  let focusedIndex = 0;

  function updateFocus(): void {
    const gridRect = grid!.getBoundingClientRect();
    const center = gridRect.left + gridRect.width / 2;

    let closestIndex = 0;
    let minDist = Infinity;

    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - center);
      if (d < minDist) {
        minDist = d;
        closestIndex = i;
      }
    });

    cards.forEach((card, i) => {
      card.classList.toggle('is-focused', i === closestIndex);
    });

    if (closestIndex !== focusedIndex) {
      focusedIndex = closestIndex;
      dots.querySelectorAll('button').forEach((btn, i) => {
        btn.classList.toggle('is-active', i === closestIndex);
      });
    }
  }

  function schedule(): void {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      updateEdges();
      updateFocus();
    });
  }

  grid.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  // ---------------------------------------------------------------------------
  // Dots
  // ---------------------------------------------------------------------------
  cards.forEach((card, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Go to skill card ' + (i + 1));
    if (i === 0) btn.classList.add('is-active');
    btn.addEventListener('click', () => {
      card.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    });
    dots.appendChild(btn);
  });

  // ---------------------------------------------------------------------------
  // Card click snaps to center
  // ---------------------------------------------------------------------------
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      card.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Initial
  // ---------------------------------------------------------------------------
  updateEdges();
  updateFocus();
}
