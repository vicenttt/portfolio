#!/usr/bin/env python3
"""Tighten spacing + add Contact icons. Run from repo root."""

from pathlib import Path
import sys

ROOT = Path.cwd()
if not (ROOT / "styles.css").exists():
    sys.exit("✗ Run from repo root")


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


# 1. styles.css — .hero stops forcing 100vh
sub(
    "styles.css",
    """.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  isolation: isolate;
}""",
    """.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: auto;
  overflow: hidden;
  isolation: isolate;
}""",
)

# 2. styles.css — .section padding reduced
sub(
    "styles.css",
    """.section {
  position: relative;
  padding: clamp(64px, 10vw, 140px) clamp(20px, 4vw, 52px);
  background: var(--bg);
}""",
    """.section {
  position: relative;
  padding: clamp(56px, 7vw, 112px) clamp(20px, 4vw, 52px);
  background: var(--bg);
}""",
)

# 3. styles.css — suggested questions bottom padding
sub(
    "styles.css",
    """  padding: 0 clamp(20px, 4vw, 52px) 48px;
  transition: opacity 220ms ease;
}""",
    """  padding: 0 clamp(20px, 4vw, 52px) 32px;
  transition: opacity 220ms ease;
}""",
)

# 4. styles.css — contact layout vertical align
sub(
    "styles.css",
    """.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}""",
    """.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}""",
)

# 5. styles.css — #contact tighter padding
sub(
    "styles.css",
    """@keyframes highlight-pulse {""",
    """#contact {
  padding-top: clamp(40px, 5vw, 72px);
  padding-bottom: clamp(40px, 5vw, 72px);
}

@keyframes highlight-pulse {""",
)

# 6. styles.css — contact-panel a with icon support
sub(
    "styles.css",
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
    """.contact-panel a {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 56px;
  padding: 6px 0;
  border-bottom: 1px solid var(--card-border);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 500;
  transition: color 200ms ease, opacity 200ms ease;
}

.contact-panel a:last-child {
  border-bottom: none;
}

.contact-panel a:hover {
  color: var(--accent);
  opacity: 1;
}

.contact-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--fg-muted);
  transition: color 200ms ease;
}

.contact-panel a:hover .contact-icon {
  color: var(--accent);
}""",
)

# 7. index.html — contact panel with SVG icons
sub(
    "index.html",
    """        <div class="contact-panel">
          <a href="mailto:YOUR_EMAIL">✉ Email</a>
          <a href="https://github.com/YOUR_GITHUB" target="_blank" rel="noopener">◆ GitHub</a>
          <a href="https://linkedin.com/in/YOUR_LINKEDIN" target="_blank" rel="noopener">◈ LinkedIn</a>
        </div>""",
    """        <div class="contact-panel">
          <a href="mailto:YOUR_EMAIL">
            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path d="m3 7 9 6 9-6"/>
            </svg>
            <span>Email</span>
          </a>
          <a href="https://github.com/YOUR_GITHUB" target="_blank" rel="noopener">
            <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39s1.97.13 2.89.39c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.68 5.4-5.24 5.69.41.35.78 1.05.78 2.11v3.13c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
            </svg>
            <span>GitHub</span>
          </a>
          <a href="https://linkedin.com/in/YOUR_LINKEDIN" target="_blank" rel="noopener">
            <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
            </svg>
            <span>LinkedIn</span>
          </a>
        </div>""",
)

print("\n================================================================")
print("  ✓ Spacing + Contact icons applied")
print("================================================================")
print()