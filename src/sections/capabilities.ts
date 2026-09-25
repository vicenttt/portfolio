import type { Profile, Flow } from '../data/schema.ts';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderCard(cap: Flow, index: number): string {
  const number = String(index + 1).padStart(2, '0');
  return `
    <article class="cap-card">
      <div class="cap-head">
        <h3 class="cap-title">${escapeHtml(cap.name)}</h3>
        <span class="cap-number">${number}</span>
      </div>
      <ul class="cap-list">
        ${cap.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
      </ul>
    </article>`;
}

export function renderCapabilities(profile: Profile): void {
  const grid = document.getElementById('flow-grid');
  if (!grid) return;
  grid.className = 'cap-grid';
  grid.innerHTML = profile.capabilities
    .map((cap, i) => renderCard(cap, i))
    .join('');
}
