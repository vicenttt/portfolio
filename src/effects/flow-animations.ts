export function initFlowAnimations(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const container = entry.target as HTMLElement;
      const steps = container.querySelectorAll<HTMLElement>('.flow-step');
      if (reduced) { steps.forEach((s) => s.classList.add('is-active')); continue; }
      steps.forEach((step, i) => setTimeout(() => step.classList.add('is-active'), i * 180));
      observer.unobserve(container);
    }
  }, { threshold: 0.3 });
  document.querySelectorAll<HTMLElement>('.flow-steps').forEach((el) => observer.observe(el));
}
