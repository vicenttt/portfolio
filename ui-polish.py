#!/usr/bin/env python3
"""Apply UI polish changes. Run from repo root."""

from pathlib import Path
import sys

ROOT = Path.cwd()
if not (ROOT / "styles.css").exists():
    sys.exit("✗ Run from repo root (styles.css not found)")


def sub(path: str, old: str, new: str) -> None:
    p = ROOT / path
    text = p.read_text(encoding="utf-8")
    n = text.count(old)
    if n != 1:
        print(f"\n✗ {path}: expected 1 match, found {n}")
        print("─── looking for ───")
        print(old[:300])
        print("───────────────────")
        sys.exit(1)
    p.write_text(text.replace(old, new, 1), encoding="utf-8")
    print(f"✓ {path}")


# ============================================================================
# styles.css
# ============================================================================

# 1. :root variables — single accent + fonts
sub(
    "styles.css",
    """:root {
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
}""",
    """:root {
  --bg: #0c0c0c;
  --fg: #d7e2ea;
  --fg-muted: rgba(215, 226, 234, 0.72);

  /* Single accent */
  --accent: #f18b3a;
  /* Aliases kept for compatibility with existing rules */
  --accent-2: #f18b3a;
  --accent-3: #f18b3a;
  --accent-4: #f18b3a;

  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: rgba(215, 226, 234, 0.18);
  --light-bg: #f2f2f2;
  --light-fg: #0c0c0c;

  --font-display: "Kanit", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;

  color: var(--fg);
  background: var(--bg);
  font-family: var(--font-display);
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
}""",
)

# 2. hero glow — single orange ellipse
sub(
    "styles.css",
    """.hero::before {
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
}""",
    """.hero::before {
  content: "";
  position: absolute;
  inset: -22% -8% auto;
  z-index: -1;
  height: 58vh;
  background: radial-gradient(
    ellipse at 50% 60%,
    rgba(241, 139, 58, 0.22),
    transparent 55%
  );
  filter: blur(56px);
  opacity: 0.9;
}""",
)

# 3. hero-kicker
sub(
    "styles.css",
    """.hero-kicker {
  margin-bottom: 16px;
  color: var(--fg-muted);
  font-size: clamp(0.72rem, 1.05vw, 0.92rem);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}""",
    """.hero-kicker {
  margin-bottom: 16px;
  color: var(--fg-muted);
  font-family: var(--font-body);
  font-size: clamp(0.72rem, 1.05vw, 0.88rem);
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}""",
)

# 4. hero-sub — left aligned
sub(
    "styles.css",
    """.hero-sub {
  margin-top: 16px;
  color: var(--fg-muted);
  font-size: clamp(0.82rem, 1.4vw, 1.05rem);
  font-weight: 300;
  letter-spacing: 0.04em;
}""",
    """.hero-sub {
  margin-top: 16px;
  padding-left: clamp(20px, 4vw, 52px);
  color: var(--fg-muted);
  font-family: var(--font-body);
  font-size: clamp(0.85rem, 1.3vw, 1rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  text-align: left;
}""",
)

# 5. section-heading — downgrade
sub(
    "styles.css",
    """.section-heading {
  font-size: clamp(2.2rem, 5vw, 5rem);
  font-weight: 900;
  line-height: 0.92;
  text-transform: uppercase;
}""",
    """.section-heading {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.5vw, 3rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: none;
}""",
)

# 6. section-copy
sub(
    "styles.css",
    """.section-copy {
  margin-top: 24px;
  max-width: 720px;
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  font-weight: 300;
  line-height: 1.62;
  color: rgba(12, 12, 12, 0.72);
}""",
    """.section-copy {
  margin-top: 24px;
  max-width: 720px;
  font-family: var(--font-body);
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  font-weight: 400;
  line-height: 1.7;
  color: rgba(12, 12, 12, 0.72);
}""",
)

# 7. highlight-card p
sub(
    "styles.css",
    """.highlight-card p {
  margin-top: 12px; font-size: 0.96rem;
  font-weight: 300; line-height: 1.6; color: var(--fg-muted);
}""",
    """.highlight-card p {
  margin-top: 12px;
  font-family: var(--font-body);
  font-size: 0.96rem;
  font-weight: 400;
  line-height: 1.7;
  color: var(--fg-muted);
}""",
)

# 8. skill-grid + skill-card — uncard
sub(
    "styles.css",
    """.skill-grid {
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
}""",
    """.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px 48px;
  margin-top: 48px;
}

.skill-card {
  position: relative;
  padding: 24px 0 0;
  border: none;
  border-top: 1px solid rgba(12, 12, 12, 0.15);
  border-radius: 0;
  background: transparent;
  overflow: visible;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 500ms ease, transform 500ms ease;
}
.skill-card.is-visible { opacity: 1; transform: translateY(0); }

.skill-card h3 {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
  color: var(--light-fg);
  margin-bottom: 14px;
}

.skill-card ul {
  list-style: none;
  margin-top: 0;
  padding-left: 0;
  font-family: var(--font-body);
  font-size: 0.94rem;
  line-height: 1.9;
  color: rgba(12, 12, 12, 0.65);
}

.skill-card ul li {
  display: inline;
}
.skill-card ul li::after {
  content: " · ";
  color: rgba(12, 12, 12, 0.3);
}
.skill-card ul li:last-child::after { content: ""; }""",
)

# 9. experience-item ul
sub(
    "styles.css",
    """.experience-item ul {
  margin-top: 18px; padding-left: 22px;
  font-size: 1rem; font-weight: 300;
  line-height: 1.64; color: rgba(12, 12, 12, 0.72);
}
.experience-item li + li { margin-top: 10px; }""",
    """.experience-item ul {
  margin-top: 18px; padding-left: 22px;
  font-family: var(--font-body);
  font-size: 0.98rem; font-weight: 400;
  line-height: 1.75; color: rgba(12, 12, 12, 0.72);
}
.experience-item li + li { margin-top: 12px; }
.experience-item li:first-child { color: rgba(12, 12, 12, 0.9); }""",
)

# 10. tech-tag
sub(
    "styles.css",
    """.tech-tag {
  padding: 4px 10px; border-radius: 999px;
  background: rgba(182, 0, 168, 0.08);
  color: var(--accent); font-size: 0.76rem; font-weight: 500;
}""",
    """.tech-tag {
  padding: 3px 9px;
  border-radius: 4px;
  background: transparent;
  border: 1px solid rgba(12, 12, 12, 0.15);
  color: rgba(12, 12, 12, 0.6);
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 500;
}""",
)

# 11. project-card .year
sub(
    "styles.css",
    """.project-card .year {
  color: var(--accent-3); font-size: 0.82rem;
  font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
}""",
    """.project-card .year {
  color: var(--fg-muted);
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}""",
)

# 12. project-card p
sub(
    "styles.css",
    """.project-card p {
  margin-top: 14px; max-width: 640px;
  font-size: 0.98rem; font-weight: 300;
  line-height: 1.6; color: var(--fg-muted);
}""",
    """.project-card p {
  margin-top: 14px; max-width: 640px;
  font-family: var(--font-body);
  font-size: 0.98rem; font-weight: 400;
  line-height: 1.7; color: var(--fg-muted);
}""",
)

# 13. avatar-speech p
sub(
    "styles.css",
    ".avatar-speech p { color: #fff; font-size: 1rem; font-weight: 300; line-height: 1.5; }",
    """.avatar-speech p {
  color: #fff;
  font-family: var(--font-body);
  font-size: 0.98rem;
  font-weight: 400;
  line-height: 1.55;
}""",
)

# 14. contact-panel
sub(
    "styles.css",
    """.contact-panel {
  padding: clamp(24px, 4vw, 42px);
  border: 1px solid var(--card-border);
  border-radius: 30px;
  background:
    radial-gradient(circle at 18% 20%, rgba(0, 169, 255, 0.18), transparent 34%),
    radial-gradient(circle at 82% 84%, rgba(182, 0, 168, 0.16), transparent 34%),
    rgba(255, 255, 255, 0.05);
}""",
    """.contact-panel {
  padding: 0;
  border: none;
  border-radius: 0;
  background: none;
}""",
)

# 15. contact-panel a
sub(
    "styles.css",
    """.contact-panel a {
  display: flex; align-items: center; gap: 12px;
  min-height: 50px; margin-top: 18px;
  color: #fff; font-size: 1.05rem;
  transition: opacity 200ms ease;
}""",
    """.contact-panel a {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 4px 0;
  border-bottom: 1px solid var(--card-border);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  transition: opacity 200ms ease;
}""",
)

# 16. ghost-cursor opacity
sub(
    "styles.css",
    """  mix-blend-mode: screen;
  opacity: 0.45;
}""",
    """  mix-blend-mode: screen;
  opacity: 0.28;
}""",
)

# 17. index.html — font links
sub(
    "index.html",
    '<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Kanit:wght@400;700;900&display=swap" rel="stylesheet" />',
)

print("\n================================================================")
print("  ✓ All 17 replacements applied")
print("================================================================")
print("\n  Next:")
print("    pnpm dev        # check the browser")
print()
