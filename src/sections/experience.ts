import type { Profile, Experience, SubProject } from '../data/schema.ts';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** How many responsibilities to show before "Show more" */
const PRIMARY_COUNT = 4;

function renderProjectPanel(sub: SubProject, isActive: boolean): string {
  const all = sub.responsibilities;
  const primary = all.slice(0, PRIMARY_COUNT);
  const extra = all.slice(PRIMARY_COUNT);
  const hasExtra = extra.length > 0;

  const primaryHtml = primary
    .map((r) => `<li class="is-primary">${escapeHtml(r)}</li>`)
    .join('');

  const extraHtml = extra
    .map(
      (r, i) =>
        `<li class="is-extra" data-extra-index="${i}">${escapeHtml(r)}</li>`,
    )
    .join('');

  const showMore = hasExtra
    ? `<button class="show-more" type="button" data-extra-count="${extra.length}">
         <span class="label">Show ${extra.length} more</span>
         <span class="arrow">↓</span>
       </button>`
    : '';

  return `
    <div class="project-panel ${isActive ? 'is-active' : ''}" data-project="${sub.id}">
      <ul class="resp-list ${hasExtra ? 'is-collapsed' : ''}" data-extra-count="${extra.length}">
        ${primaryHtml}
        ${extraHtml}
      </ul>
      ${showMore}
    </div>`;
}

function renderProjectTabs(subs: SubProject[]): string {
  const tabs = subs
    .map(
      (sub, i) => `
      <button class="project-tab ${i === 0 ? 'is-active' : ''}"
              type="button"
              data-project="${sub.id}"
              data-index="${i}">
        <span class="project-tab-name">${escapeHtml(sub.name)}</span>
        <span class="project-tab-count">${sub.responsibilities.length} responsibilities</span>
      </button>`,
    )
    .join('');

  return `
    <div class="project-tabs" data-active-index="0">
      ${tabs}
      <span class="tab-indicator" aria-hidden="true"></span>
    </div>`;
}

function renderProjectSection(exp: Experience): string {
  const subs = exp.subProjects;
  const hasMultiple = subs.length > 1;
  const tabs = hasMultiple ? renderProjectTabs(subs) : '';
  const panels = subs
    .map((sub, i) => renderProjectPanel(sub, i === 0))
    .join('');
  return `
    ${tabs}
    <div class="project-panels">${panels}</div>`;
}

function renderCompany(exp: Experience, isFirst: boolean): string {
  const tags = Array.from(
    new Set(exp.subProjects.flatMap((s) => s.technology)),
  ).slice(0, 12);

  const tagsHtml = tags.length
    ? `<div class="exp-tech">${tags
        .map((t) => `<span>${escapeHtml(t)}</span>`)
        .join('')}</div>`
    : '';

  return `
    <div class="exp ${isFirst ? 'is-open' : ''}" data-company="${exp.id}">
      <div class="exp-head" role="button" tabindex="0" aria-expanded="${isFirst}">
        <div class="exp-left">
          <div class="exp-period">${escapeHtml(exp.period)}</div>
          <div class="exp-company">${escapeHtml(exp.company)}</div>
          <div class="exp-role">${escapeHtml(exp.role)}</div>
          ${tagsHtml}
        </div>
        <div class="exp-toggle">${isFirst ? 'Collapse −' : 'Expand +'}</div>
      </div>
      <div class="exp-body">
        <div class="exp-body-inner">${renderProjectSection(exp)}</div>
      </div>
    </div>`;
}

export function renderExperience(profile: Profile): void {
  const list = document.getElementById('experience-list');
  if (!list) return;
  list.className = 'acc';
  list.innerHTML = profile.experience
    .map((exp, i) => renderCompany(exp, i === 0))
    .join('');
}
