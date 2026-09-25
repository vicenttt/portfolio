const TRIGGER_ROOT_MARGIN = '-25% 0px -65% 0px';

export function initNavSpy(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-link'));
  if (links.length === 0) return;
  const linkById = new Map<string, HTMLAnchorElement>();
  for (const link of links) {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) continue;
    linkById.set(href.slice(1), link);
  }
  const sections = Array.from(linkById.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (sections.length === 0) return;

  function setActive(id: string): void {
    for (const [sectionId, link] of linkById) {
      link.classList.toggle('is-active', sectionId === id);
    }
  }

  const observer = new IntersectionObserver((entries) => {
    const intersecting = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    const top = intersecting[0];
    if (top) setActive(top.target.id);
  }, { rootMargin: TRIGGER_ROOT_MARGIN, threshold: 0 });

  for (const section of sections) observer.observe(section);
}
