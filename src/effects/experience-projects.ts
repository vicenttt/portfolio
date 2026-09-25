/**
 * Experience — project tab interactions.
 *
 * Three animations work together here:
 *   1. Tab pop        — the active tab briefly scales up on click.
 *   2. Sliding bar    — a single indicator moves under the active tab.
 *   3. Staggered fade — "Show more" reveals extra items one by one.
 */

const EXTRA_STAGGER_MS = 60;

/* ---------------------------------------------------------------------------
 * Sliding indicator
 * ------------------------------------------------------------------------- */

function moveIndicator(tabsEl: HTMLElement): void {
  const indicator = tabsEl.querySelector<HTMLElement>('.tab-indicator');
  const active = tabsEl.querySelector<HTMLElement>('.project-tab.is-active');
  const first = tabsEl.querySelector<HTMLElement>('.project-tab');
  if (!indicator || !active || !first) return;

  // If tabs wrapped to multiple rows, hide the indicator
  if (active.offsetTop !== first.offsetTop) {
    indicator.style.opacity = '0';
    return;
  }
  indicator.style.opacity = '1';

  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.transform = `translateX(${active.offsetLeft}px)`;
}

/* ---------------------------------------------------------------------------
 * Show-more: collapse reset + expand/collapse with stagger
 * ------------------------------------------------------------------------- */

function resetShowMore(panel: HTMLElement): void {
  const list = panel.querySelector<HTMLUListElement>('.resp-list');
  const btn = panel.querySelector<HTMLButtonElement>('.show-more');
  if (!list || !btn) return;

  const count = list.dataset.extraCount ?? '0';
  const label = btn.querySelector('.label');
  const arrow = btn.querySelector('.arrow');

  if (count !== '0') list.classList.add('is-collapsed');
  btn.classList.remove('is-expanded');
  if (label) label.textContent = `Show ${count} more`;
  if (arrow) arrow.textContent = '↓';

  list.querySelectorAll<HTMLElement>('.is-extra').forEach((li) => {
    li.style.animationDelay = '';
  });
}

function setupShowMore(panel: HTMLElement): void {
  const list = panel.querySelector<HTMLUListElement>('.resp-list');
  const btn = panel.querySelector<HTMLButtonElement>('.show-more');
  if (!list || !btn) return;

  const label = btn.querySelector('.label');
  const arrow = btn.querySelector('.arrow');

  btn.addEventListener('click', () => {
    const collapsed = list.classList.contains('is-collapsed');
    const count = list.dataset.extraCount ?? '0';
    const extras = list.querySelectorAll<HTMLElement>('.is-extra');

    if (collapsed) {
      // Expand — apply a stagger delay to each extra item
      extras.forEach((li, i) => {
        li.style.animationDelay = `${i * EXTRA_STAGGER_MS}ms`;
      });
      list.classList.remove('is-collapsed');
      btn.classList.add('is-expanded');
      if (label) label.textContent = 'Show less';
      if (arrow) arrow.textContent = '↑';
    } else {
      // Collapse — no stagger
      extras.forEach((li) => {
        li.style.animationDelay = '';
      });
      list.classList.add('is-collapsed');
      btn.classList.remove('is-expanded');
      if (label) label.textContent = `Show ${count} more`;
      if (arrow) arrow.textContent = '↓';
    }
  });
}

/* ---------------------------------------------------------------------------
 * Tab activation
 * ------------------------------------------------------------------------- */

function activateTab(
  tabsEl: HTMLElement,
  btn: HTMLElement,
  panelKey: string,
): void {
  const container = tabsEl.parentElement?.querySelector('.project-panels');
  if (!container) return;

  // 1. Toggle active class on tabs
  tabsEl.querySelectorAll<HTMLElement>('.project-tab').forEach((t) => {
    t.classList.toggle('is-active', t === btn);
  });
  tabsEl.dataset.activeIndex = btn.dataset.index ?? '0';

  // 2. Switch panels + reset their show-more state
  container
    .querySelectorAll<HTMLElement>('.project-panel')
    .forEach((p) => {
      const active = p.dataset.project === panelKey;
      p.classList.toggle('is-active', active);
      if (!active) resetShowMore(p);
    });

  // 3. Pop the clicked tab (remove → reflow → add)
  btn.classList.remove('is-popping');
  void btn.offsetWidth;
  btn.classList.add('is-popping');
  window.setTimeout(() => btn.classList.remove('is-popping'), 320);

  // 4. Move the indicator
  moveIndicator(tabsEl);
}

/* ---------------------------------------------------------------------------
 * Entry point
 * ------------------------------------------------------------------------- */

export function initExperienceProjects(): void {
  const acc = document.querySelector('.acc');
  if (!acc) return;

  const tabsContainers = acc.querySelectorAll<HTMLElement>('.project-tabs');

  // Wire up tab clicks
  tabsContainers.forEach((tabsEl) => {
    tabsEl.querySelectorAll<HTMLButtonElement>('.project-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.project;
        if (key) activateTab(tabsEl, btn, key);
      });
    });

    // Position indicator after initial layout
    requestAnimationFrame(() => moveIndicator(tabsEl));
    window.addEventListener('resize', () => moveIndicator(tabsEl));
  });

  // Wire up show-more buttons
  acc.querySelectorAll<HTMLElement>('.project-panel').forEach((panel) => {
    setupShowMore(panel);
  });

  // Reposition once webfonts finish loading
  if ('fonts' in document) {
    (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => {
      tabsContainers.forEach((tabsEl) => moveIndicator(tabsEl));
    });
  }
}
