import type { Profile } from '../data/schema.ts';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPositioning(text: string): string {
  const cleaned = text.replace(/\s*---+\s*$/g, '').trim();
  const paragraphs = cleaned.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return paragraphs
    .map((p) => {
      const bold = /^\*\*([\s\S]+?)\*\*$/.exec(p);
      if (bold) {
        const inner = bold[1]!.replace(/\n/g, ' ').trim();
        return `<div class="flow">${escapeHtml(inner)}</div>`;
      }
      return `<p>${escapeHtml(p)}</p>`;
    })
    .join('');
}

export function renderAbout(profile: Profile): void {
  const copy = document.getElementById('positioning-copy');
  if (copy) copy.innerHTML = renderPositioning(profile.positioning);

  const grid = document.getElementById('skill-grid');
  if (!grid) return;

  grid.innerHTML = profile.skills
    .map(
      (s) => `
    <article class="skill-card" data-profile-id="${s.id}">
      <h3>${escapeHtml(s.category)}</h3>
      <ul>${s.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
    </article>`,
    )
    .join('');
}
