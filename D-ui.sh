#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# --- index.html ------------------------------------------------------------
cat > index.html <<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Vincent Liu — Quality Engineering, Software Engineering, and AI Engineering." />
  <title>Vincent Liu — QA Automation Engineer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <div class="ghost-cursor" id="ghost-cursor" aria-hidden="true"></div>

  <nav class="nav" aria-label="Primary">
    <ul class="nav-list">
      <li><a href="#hero" class="nav-link is-active">Home</a></li>
      <li><a href="#about" class="nav-link">About</a></li>
      <li><a href="#experience" class="nav-link">Experience</a></li>
      <li><a href="#projects" class="nav-link">Projects</a></li>
      <li><a href="#qa-lab" class="nav-link">Skills</a></li>
      <li><a href="#contact" class="nav-link">Contact</a></li>
    </ul>
  </nav>

  <header class="hero" id="hero">
    <div class="hero-title">
      <p class="hero-kicker">QA AUTOMATION ENGINEER · SOFTWARE ENGINEER</p>
      <h1 class="hero-heading particle-heading" id="particle-heading">
        <canvas id="particle-canvas"></canvas>
        <span class="particle-heading-text">VINCENT LIU</span>
      </h1>
      <p class="hero-sub">
        Quality Engineering · Software Engineering · AI Engineering
      </p>
    </div>

    <div class="avatar-stage">
      <div class="avatar-character" id="character">
        <div class="avatar-glow" aria-hidden="true"></div>
        <img
          src="./hero-character.png"
          alt="Vincent Liu — illustration"
          class="avatar-image"
          width="680"
          height="680"
        />
      </div>

      <div class="avatar-dialog">
        <div class="avatar-speech" id="avatar-speech" data-state="idle">
          <p id="answer-text">Ask me about my work.</p>
          <div class="source-list" id="source-list"></div>
        </div>

        <form class="avatar-chat-form" id="chat-form">
          <input
            type="text"
            id="chat-input"
            placeholder="Ask about my experience, tools, or projects..."
            autocomplete="off"
            maxlength="500"
          />
          <button type="submit" aria-label="Send">→</button>
        </form>
      </div>
    </div>

    <div class="suggested-questions" id="suggested-questions">
      <button class="question-chip" data-question="What experience do you have with Playwright?">
        <span class="question-chip-label">Playwright experience?</span>
      </button>
      <button class="question-chip" data-question="How do you approach API testing?">
        <span class="question-chip-label">API testing approach?</span>
      </button>
      <button class="question-chip" data-question="What AI feature testing have you done?">
        <span class="question-chip-label">AI feature testing?</span>
      </button>
      <button class="question-chip" data-question="Tell me about your debugging process.">
        <span class="question-chip-label">Debugging process?</span>
      </button>
      <button class="question-chip" data-question="What projects have you built?">
        <span class="question-chip-label">Projects built?</span>
      </button>
    </div>
  </header>

  <main>
    <section class="section" id="highlights">
      <div class="section-inner">
        <div class="highlight-grid" id="highlight-grid"></div>
      </div>
    </section>

    <section class="section section-light" id="about">
      <div class="section-inner">
        <h2 class="section-heading" data-highlight>About</h2>
        <p class="section-copy" id="positioning-copy" data-highlight-paragraph></p>
        <div class="skill-grid" id="skill-grid"></div>
      </div>
    </section>

    <section class="section" id="capabilities">
      <div class="section-inner">
        <h2 class="section-heading" data-highlight>Core Capability</h2>
        <div class="flow-grid" id="flow-grid"></div>
      </div>
    </section>

    <section class="section section-light" id="experience">
      <div class="section-inner">
        <h2 class="section-heading" data-highlight>Experience</h2>
        <div class="experience-list" id="experience-list"></div>
      </div>
    </section>

    <section class="section" id="projects">
      <div class="section-inner">
        <h2 class="section-heading" data-highlight>Projects</h2>
        <div class="scroll-stack" id="project-stack"></div>
      </div>
    </section>

    <section class="section section-light" id="qa-lab">
      <div class="section-inner">
        <h2 class="section-heading" data-highlight>QA Lab</h2>
        <p class="section-copy">
          This portfolio is its own system under test. The Playwright suite tests the UI,
          the RAG API, and the retrieval quality of this page. The test strategy is
          documented and published. The site does not deploy if its own tests fail.
        </p>
        <div class="qa-links">
          <a class="qa-link" href="./qa-lab/report/" target="_blank" rel="noopener">View Test Report →</a>
          <a class="qa-link" href="./qa-lab/test-design.md" target="_blank" rel="noopener">Read Test Design →</a>
        </div>
      </div>
    </section>

    <section class="section section-dark" id="contact">
      <div class="section-inner contact-layout">
        <h2 class="section-heading" data-highlight>Contact</h2>
        <div class="contact-panel">
          <a href="mailto:YOUR_EMAIL">✉ Email</a>
          <a href="https://github.com/YOUR_GITHUB" target="_blank" rel="noopener">◆ GitHub</a>
          <a href="https://linkedin.com/in/YOUR_LINKEDIN" target="_blank" rel="noopener">◈ LinkedIn</a>
        </div>
      </div>
    </section>
  </main>

  <script type="module" src="./src/main.ts"></script>
</body>
</html>
HTML

# --- styles.css ------------------------------------------------------------
cat > styles.css <<'CSS'
/* Vincent Liu — QA Portfolio */

:root {
  --bg: #0c0c0c;
  --fg: #d7e2ea;
  --fg-muted: rgba(215, 226, 234, 0.72);
  --accent: #b600a8;
  --accent-2: #00a9ff;
  --accent-3: #ffb737;
  --accent-4: #f18b3a;
  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: rgba(215, 226, 234, 0.18);
  --light-bg: #f2f2f2;
  --light-fg: #0c0c0c;
  color: var(--fg);
  background: var(--bg);
  font-family: "Kanit", ui-sans-serif, system-ui, sans-serif;
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html {
  background: var(--bg);
  scroll-behavior: smooth;
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

body {
  min-width: 320px;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--bg);
}

a { color: inherit; text-decoration: none; }

.ghost-cursor {
  position: fixed;
  inset: 0;
  z-index: 8;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.45;
}
.ghost-cursor > canvas { display: block; width: 100%; height: 100%; background: transparent; }

.nav {
  position: relative;
  z-index: 5;
  display: flex;
  padding: 20px clamp(16px, 4vw, 52px) 0;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0 0 0 auto;
  padding: 4px;
  list-style: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(215, 226, 234, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav-list::-webkit-scrollbar { display: none; }

.nav-link {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 8px;
  color: rgba(215, 226, 234, 0.6);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: color 200ms ease, background 200ms ease;
}
.nav-link:hover { color: var(--fg); background: rgba(255, 255, 255, 0.05); }
.nav-link.is-active {
  color: #ffffff;
  background: rgba(180, 195, 220, 0.16);
  font-weight: 600;
}

.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  isolation: isolate;
}

.hero::before {
  content: "";
  position: absolute;
  inset: -22% -8% auto;
  z-index: -1;
  height: 58vh;
  background:
    radial-gradient(circle at 20% 30%, rgba(0, 169, 255, 0.28), transparent 32%),
    radial-gradient(circle at 70% 12%, rgba(182, 0, 168, 0.24), transparent 34%),
    radial-gradient(circle at 52% 72%, rgba(255, 183, 55, 0.14), transparent 30%);
  filter: blur(48px);
  opacity: 0.95;
}

.hero-title {
  position: relative;
  z-index: 3;
  width: 100%;
  margin-top: clamp(28px, 5vh, 64px);
  overflow: hidden;
  text-align: center;
}

.hero-kicker {
  margin-bottom: 16px;
  color: var(--fg-muted);
  font-size: clamp(0.72rem, 1.05vw, 0.92rem);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.hero-heading {
  width: 100%;
  color: transparent;
  background: linear-gradient(180deg, #646973 0%, #bbccd7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  font-size: clamp(3.7rem, 11.5vw, 11rem);
  font-weight: 900;
  line-height: 0.82;
  text-transform: uppercase;
}

.particle-heading {
  position: relative;
  height: clamp(80px, 9vw, 130px);
  overflow: hidden;
  background: none;
  -webkit-text-fill-color: initial;
}
.particle-heading canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: crosshair;
}
.particle-heading-text {
  position: absolute;
  width: 1px; height: 1px;
  margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.hero-sub {
  margin-top: 16px;
  color: var(--fg-muted);
  font-size: clamp(0.82rem, 1.4vw, 1.05rem);
  font-weight: 300;
  letter-spacing: 0.04em;
}

.avatar-stage {
  position: relative;
  z-index: 4;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: clamp(24px, 4vw, 64px);
  width: min(1440px, 100%);
  margin: 20px auto 0;
  padding: 0 clamp(20px, 4vw, 52px) 40px;
}

.avatar-character {
  position: relative;
  width: clamp(340px, 46vw, 640px);
  transform: translate(var(--shift-x, 0px), var(--shift-y, 0px)) rotate(var(--tilt, 0deg));
  transition: transform 550ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

.avatar-image {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 32px 64px rgba(0, 0, 0, 0.65));
  opacity: 0;
  transform: translateY(20px) scale(0.96);
  animation: character-enter 900ms cubic-bezier(0.2, 0.8, 0.2, 1) 300ms forwards;
}

@keyframes character-enter {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.avatar-glow {
  position: absolute;
  inset: -15% -25% -25% -25%;
  z-index: 1;
  background: radial-gradient(
    ellipse at 50% 55%,
    rgba(241, 139, 58, 0.42) 0%,
    rgba(241, 139, 58, 0.14) 35%,
    transparent 70%
  );
  filter: blur(44px);
  pointer-events: none;
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.06); }
}

.avatar-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
  min-width: 0;
}

.avatar-speech {
  position: relative;
  padding: 18px 22px;
  border: 1px solid rgba(215, 226, 234, 0.25);
  border-radius: 18px;
  background: rgba(12, 12, 12, 0.94);
  backdrop-filter: blur(16px);
  min-height: 68px;
}

.avatar-speech::before {
  content: "";
  position: absolute;
  top: 28px;
  left: -10px;
  width: 16px;
  height: 16px;
  background: rgba(12, 12, 12, 0.94);
  border-left: 1px solid rgba(215, 226, 234, 0.25);
  border-bottom: 1px solid rgba(215, 226, 234, 0.25);
  transform: rotate(45deg);
}

.avatar-speech[data-state="answered"] { animation: answer-reveal 240ms ease-out; }

@keyframes answer-reveal {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.avatar-speech p { color: #fff; font-size: 1rem; font-weight: 300; line-height: 1.5; }
.avatar-speech[data-state="thinking"] p { opacity: 0.65; letter-spacing: 0.08em; }

.source-list { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 13px; }

.source-chip {
  padding: 6px 9px;
  border-radius: 999px;
  border: 1px solid rgba(215, 226, 234, 0.2);
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.06);
  font: inherit;
  font-size: 0.76rem;
  line-height: 1.2;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease;
}
.source-chip:hover {
  background: rgba(241, 139, 58, 0.18);
  border-color: var(--accent-4);
}

.avatar-chat-form {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 6px;
  border: 1px solid rgba(215, 226, 234, 0.2);
  border-radius: 999px;
  background: rgba(12, 12, 12, 0.8);
  backdrop-filter: blur(16px);
  transition: border-color 220ms ease;
}
.avatar-chat-form:focus-within { border-color: rgba(241, 139, 58, 0.6); }

.avatar-chat-form input {
  width: 100%;
  min-width: 0;
  padding: 8px 8px 8px 12px;
  border: 0;
  outline: 0;
  color: #fff;
  background: transparent;
  font: inherit;
  font-size: 0.92rem;
}
.avatar-chat-form input::placeholder { color: rgba(215, 226, 234, 0.55); }

.avatar-chat-form button {
  flex: 0 0 auto;
  width: 40px;
  border: 0;
  border-radius: 999px;
  color: var(--bg);
  background: var(--fg);
  font: inherit;
  font-size: 1.1rem;
  cursor: pointer;
  transition: opacity 200ms ease;
}
.avatar-chat-form button:hover { opacity: 0.8; }

.suggested-questions {
  position: relative;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: min(720px, 100%);
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 52px) 48px;
  transition: opacity 220ms ease;
}
.suggested-questions[data-state="thinking"] { opacity: 0.5; pointer-events: none; }

.question-chip {
  position: relative;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(241, 139, 58, 0.42);
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.03);
  font: inherit;
  font-size: 0.84rem;
  line-height: 1.3;
  cursor: pointer;
  box-shadow: inset 0 0 8px rgba(241, 139, 58, 0.08), 0 0 12px rgba(241, 139, 58, 0.10);
  transition: background 200ms ease, border-color 200ms ease;
}
.question-chip:hover {
  background: rgba(241, 139, 58, 0.14);
  border-color: var(--accent-4);
}

.question-chip-label {
  position: relative;
  z-index: 2;
  display: block;
  white-space: normal;
  text-align: center;
  text-wrap: balance;
}

.section {
  position: relative;
  padding: clamp(64px, 10vw, 140px) clamp(20px, 4vw, 52px);
  background: var(--bg);
}
.section-light { background: var(--light-bg); color: var(--light-fg); }
.section-inner { max-width: 1180px; margin: 0 auto; }

.section-heading {
  font-size: clamp(2.2rem, 5vw, 5rem);
  font-weight: 900;
  line-height: 0.92;
  text-transform: uppercase;
}

.section-copy {
  margin-top: 24px;
  max-width: 720px;
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  font-weight: 300;
  line-height: 1.62;
  color: rgba(12, 12, 12, 0.72);
}
.section-dark .section-copy,
.section:not(.section-light) .section-copy { color: var(--fg-muted); }

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.highlight-card {
  padding: 28px;
  border: 1px solid var(--card-border);
  border-radius: 24px;
  background: var(--card-bg);
  opacity: 0;
  transform: translateY(24px) scale(0.98);
  transition: opacity 500ms ease, transform 500ms ease;
}
.highlight-card.is-visible { opacity: 1; transform: translateY(0) scale(1); }
.highlight-card h3 {
  font-size: 1.1rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--accent);
}
.highlight-card p {
  margin-top: 12px; font-size: 0.96rem;
  font-weight: 300; line-height: 1.6; color: var(--fg-muted);
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-top: 40px;
}

.skill-card {
  position: relative;
  padding: 24px;
  border: 1px solid rgba(12, 12, 12, 0.12);
  border-radius: 20px;
  background: #fff;
  overflow: hidden;
  opacity: 0;
  transform: translateY(24px) scale(0.98);
  transition: opacity 500ms ease, transform 500ms ease;
}
.skill-card.is-visible { opacity: 1; transform: translateY(0) scale(1); }

.skill-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle at var(--glow-x, 50%) var(--glow-y, 50%),
    rgba(182, 0, 168, 0.12), transparent 60%
  );
  opacity: 0;
  transition: opacity 260ms ease;
  pointer-events: none;
}
.skill-card:hover::before { opacity: 1; }

.skill-card h3 {
  font-size: 0.88rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--accent);
}
.skill-card ul {
  margin-top: 14px; padding-left: 18px;
  font-size: 0.94rem; line-height: 1.7;
  color: rgba(12, 12, 12, 0.7);
}

.flow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
  margin-top: 40px;
}

.flow-card {
  padding: 28px;
  border: 1px solid var(--card-border);
  border-radius: 24px;
  background: var(--card-bg);
}
.flow-card h3 {
  font-size: 1.05rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--accent-2);
}

.flow-steps { margin-top: 20px; display: flex; flex-direction: column; }
.flow-step {
  position: relative;
  padding: 10px 0 10px 28px;
  font-size: 0.92rem; font-weight: 300;
  line-height: 1.5; color: var(--fg-muted); opacity: 0.35;
  transition: opacity 320ms ease, color 320ms ease;
}
.flow-step::before {
  content: ""; position: absolute;
  left: 8px; top: 50%; width: 6px; height: 6px;
  border-radius: 50%; background: var(--fg-muted);
  transform: translateY(-50%);
  transition: background 320ms ease, box-shadow 320ms ease;
}
.flow-step + .flow-step::after {
  content: ""; position: absolute;
  left: 10px; top: 0; width: 2px; height: 100%;
  background: rgba(215, 226, 234, 0.12);
}
.flow-step.is-active { opacity: 1; color: var(--fg); }
.flow-step.is-active::before {
  background: var(--accent-2); box-shadow: 0 0 10px var(--accent-2);
}

.experience-list { display: flex; flex-direction: column; gap: 40px; margin-top: 40px; }
.experience-item { padding-top: 6px; }
.experience-item .period {
  display: block; margin-bottom: 10px;
  color: var(--accent); font-size: 0.86rem;
  font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
}
.experience-item h3 {
  font-size: clamp(1.4rem, 2.4vw, 2.2rem);
  font-weight: 900; text-transform: uppercase; line-height: 1.05;
}
.experience-item .role {
  margin-top: 6px; font-size: 1.05rem;
  font-weight: 400; color: rgba(12, 12, 12, 0.6);
}
.experience-item ul {
  margin-top: 18px; padding-left: 22px;
  font-size: 1rem; font-weight: 300;
  line-height: 1.64; color: rgba(12, 12, 12, 0.72);
}
.experience-item li + li { margin-top: 10px; }
.subproject {
  margin-top: 28px; padding-top: 20px;
  border-top: 1px solid rgba(12, 12, 12, 0.1);
}
.subproject h4 {
  font-size: 0.92rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: rgba(12, 12, 12, 0.5);
}
.tech-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.tech-tag {
  padding: 4px 10px; border-radius: 999px;
  background: rgba(182, 0, 168, 0.08);
  color: var(--accent); font-size: 0.76rem; font-weight: 500;
}

.scroll-stack { margin-top: 40px; display: flex; flex-direction: column; gap: 24px; }
.project-card {
  position: sticky; top: 80px;
  padding: clamp(24px, 3vw, 40px);
  border: 1px solid var(--card-border);
  border-radius: 28px;
  background: rgba(12, 12, 12, 0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}
.project-card .year {
  color: var(--accent-3); font-size: 0.82rem;
  font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
}
.project-card h3 {
  margin-top: 8px; font-size: clamp(1.5rem, 2.6vw, 2.4rem);
  font-weight: 900; line-height: 1.05;
}
.project-card p {
  margin-top: 14px; max-width: 640px;
  font-size: 0.98rem; font-weight: 300;
  line-height: 1.6; color: var(--fg-muted);
}

.qa-links { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 32px; }
.qa-link {
  padding: 14px 24px;
  border: 1px solid var(--light-fg);
  border-radius: 999px;
  font-size: 0.92rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.06em;
  transition: background 200ms ease, color 200ms ease;
}
.qa-link:hover { background: var(--light-fg); color: var(--light-bg); }

.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}
.contact-panel {
  padding: clamp(24px, 4vw, 42px);
  border: 1px solid var(--card-border);
  border-radius: 30px;
  background:
    radial-gradient(circle at 18% 20%, rgba(0, 169, 255, 0.18), transparent 34%),
    radial-gradient(circle at 82% 84%, rgba(182, 0, 168, 0.16), transparent 34%),
    rgba(255, 255, 255, 0.05);
}
.contact-panel a {
  display: flex; align-items: center; gap: 12px;
  min-height: 50px; margin-top: 18px;
  color: #fff; font-size: 1.05rem;
  transition: opacity 200ms ease;
}
.contact-panel a:hover { opacity: 0.72; }

@keyframes highlight-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(182, 0, 168, 0.55); }
  50%  { box-shadow: 0 0 0 12px rgba(182, 0, 168, 0); }
  100% { box-shadow: 0 0 0 0 rgba(182, 0, 168, 0); }
}
.is-highlighted {
  animation: highlight-pulse 1200ms ease-out;
  outline: 2px solid var(--accent);
  outline-offset: 6px;
  border-radius: inherit;
}

@media (max-width: 720px) {
  .nav { padding: 16px 16px 0; }
  .nav-list { margin: 0 0 0 auto; max-width: calc(100% - 32px); }
  .nav-link { padding: 7px 12px; font-size: 0.82rem; }
  .hero-kicker { letter-spacing: 0.16em; font-size: 0.68rem; }

  .avatar-stage {
    grid-template-columns: 1fr;
    gap: 28px;
    margin-top: 24px;
  }
  .avatar-character {
    width: clamp(240px, 76vw, 420px);
    margin: 0 auto;
  }
  .avatar-speech::before {
    top: -10px;
    left: 50%;
    transform: translateX(-50%) rotate(-135deg);
  }

  .contact-layout { grid-template-columns: 1fr; }
  .project-card { position: static; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .highlight-card, .skill-card { opacity: 1; transform: none; }
  .flow-step { opacity: 1; }
  .avatar-character { transition: none; }
}
CSS

echo "✓ D-ui done"
ls -la index.html styles.css