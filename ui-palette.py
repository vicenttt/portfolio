#!/usr/bin/env python3
"""Apply Deep Navy palette. Run from repo root."""

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
        print(old[:400])
        print("───────────────────")
        sys.exit(1)
    p.write_text(text.replace(old, new, 1), encoding="utf-8")
    print(f"✓ {path}")


# ============================================================================
# 1. Replace :root block with Deep Navy palette
# ============================================================================

OLD_ROOT = """:root {
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
}"""

NEW_ROOT = """:root {
  /* Deep Navy palette */
  --bg: #0d1626;
  --bg-alt: #111d33;
  --fg: #dce4f0;
  --fg-muted: rgba(220, 228, 240, 0.72);

  /* Single accent */
  --accent: #f18b3a;
  --accent-2: #f18b3a;
  --accent-3: #f18b3a;
  --accent-4: #f18b3a;

  --card-bg: rgba(220, 228, 240, 0.06);
  --card-border: rgba(220, 228, 240, 0.18);

  /* Warm cream for light sections */
  --light-bg: #ede4d3;
  --light-fg: #1a1612;

  --font-display: "Kanit", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;

  color: var(--fg);
  background: var(--bg);
  font-family: var(--font-display);
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
}"""

sub("styles.css", OLD_ROOT, NEW_ROOT)


# ============================================================================
# 2. Append section background overrides at end of styles.css
# ============================================================================

OVERRIDES = """

/* ============================================================================
   PALETTE — Deep Navy section backgrounds
   ============================================================================ */

/* Alt dark for stacked-section boundaries */
#capabilities,
#contact {
  background: var(--bg-alt);
}

/* Light sections — explicit, in case class-based rules change */
#about,
#experience,
#qa-lab {
  background: var(--light-bg);
  color: var(--light-fg);
}

/* Light-section heading + copy colour follows the new --light-fg */
.section-light .section-heading {
  color: var(--light-fg);
}

/* Ensure dark sections use the new --bg */
#hero,
#highlights,
#projects {
  background: var(--bg);
}
"""

p = ROOT / "styles.css"
p.write_text(p.read_text(encoding="utf-8") + OVERRIDES, encoding="utf-8")
print("✓ styles.css (overrides appended)")


# ============================================================================
# Done
# ============================================================================

print()
print("================================================================")
print("  ✓ Deep Navy palette applied")
print("================================================================")
print()
print("  Dark:    #0d1626")
print("  Alt:     #111d33  (Capabilities, Contact)")
print("  Light:   #ede4d3  (About, Experience, QA Lab)")
print("  Accent:  #f18b3a  (unchanged)")
print()
print("  Hard-refresh the browser to see it.")
print()
