const HIGHLIGHT_CLASS = 'is-highlighted';
const HIGHLIGHT_DURATION_MS = 2000;

export function scrollToProfileId(id: string): boolean {
  const target = document.querySelector<HTMLElement>(`[data-profile-id="${id}"]`);
  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => target.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_DURATION_MS);
  return true;
}
