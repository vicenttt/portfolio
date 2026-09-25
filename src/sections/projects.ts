import type { Profile, AcademicProject } from '../data/schema.ts';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Extract a short label from an institution name.
 *  "Auckland University of Technology (AUT)" → "AUT"
 *  "Some University" → "Some University" */
function shortInstitution(institution: string): string {
  const match = /\(([^)]+)\)/.exec(institution);
  return match ? match[1]!.trim() : institution;
}

function renderCard(project: AcademicProject, index: number): string {
  const number = String(index + 1).padStart(2, '0');
  const year = project.year;
  const shortInst = shortInstitution(project.institution);

  const tech = project.technology
    .map((t) => `<span>${escapeHtml(t)}</span>`)
    .join('');

  return `
    <a class="project-card is-academic"
       href="#"
       data-profile-id="${project.id}"
       aria-label="${escapeHtml(project.name)}">
      <div class="project-head">
        <span class="project-number">${number}</span>
        <span class="project-year">${year} · ${escapeHtml(shortInst)}</span>
      </div>
      <h3 class="project-title">${escapeHtml(project.name)}</h3>
      <p class="project-desc">${escapeHtml(project.overview)}</p>
      <div class="project-tech">${tech}</div>
    </a>`;
}

export function renderProjects(profile: Profile): void {
  const container = document.getElementById('project-stack');
  if (!container) return;

  container.className = 'project-grid';
  container.innerHTML = profile.academicProjects
    .map((p, i) => renderCard(p, i))
    .join('');
}
