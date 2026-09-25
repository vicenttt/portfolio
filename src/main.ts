import { profile } from './data/profile.ts';
import { initGhostCursor } from './effects/ghost-cursor.ts';
import { initParticleHeading } from './effects/particle-heading.ts';
import { initScrollAnimations } from './effects/scroll-animations.ts';
import { initCardGlow } from './effects/card-glow.ts';
import { initFlowAnimations } from './effects/flow-animations.ts';
import { initSectionTransitions } from './effects/section-transitions.ts';
import { initNavSpy } from './effects/nav-spy.ts';
import { initCharacterFollow } from './effects/character-follow.ts';
import { initSkillCarousel } from './effects/skill-carousel.ts';
import { initCapabilityReveal } from './effects/capability-reveal.ts';
import { renderHighlights } from './sections/highlights.ts';
import { renderAbout } from './sections/about.ts';
import { renderCapabilities } from './sections/capabilities.ts';
import { renderExperience } from './sections/experience.ts';
import { initExperienceAccordion } from './effects/experience-accordion.ts';
import { initExperienceProjects } from './effects/experience-projects.ts';
import { renderProjects } from './sections/projects.ts';
import { initChat } from './chat/client.ts';

function boot(): void {
  renderHighlights(profile);
  renderAbout(profile);
  renderCapabilities(profile);
  renderExperience(profile);
  renderProjects(profile);

  initExperienceAccordion();
  initExperienceProjects();
  initGhostCursor();
  initParticleHeading();
  initCardGlow();
  initFlowAnimations();
  initScrollAnimations();
  initSectionTransitions();
  initNavSpy();
  initCharacterFollow();
  initSkillCarousel();
  initCapabilityReveal();
  initChat();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
