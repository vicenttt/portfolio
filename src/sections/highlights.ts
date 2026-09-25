import type { Profile } from '../data/schema.ts';

export function renderHighlights(_profile: Profile): void {
  const container = document.getElementById('highlight-grid');
  if (!container) return;
  const cards = [
    { title: 'Automation Engineering',
      body: 'Reusable JavaScript and Playwright automation for web, API, and end-to-end workflows. Page Objects, business components, shared utilities.' },
    { title: 'API & Integration',
      body: 'REST API validation with Postman and Swagger. Connected-system testing, authentication validation, downstream-service investigation.' },
    { title: 'Debugging & Root Cause',
      body: 'Tracing failures across logs, API responses, SQL data, and application behaviour to identify root causes and verify fixes.' },
  ];
  container.innerHTML = cards.map((c) => `
    <article class="highlight-card">
      <h3>${c.title}</h3>
      <p>${c.body}</p>
    </article>`).join('');
}
