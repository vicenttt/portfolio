const MAX_TILT = 6;
const MAX_SHIFT_X = 18;
const MAX_SHIFT_Y = 8;
const EASE = 0.12;

export function initCharacterFollow(): void {
  const char = document.getElementById('character');
  if (!char) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf: number | null = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  const clamp = (v: number, min: number, max: number) => v < min ? min : v > max ? max : v;

  function onMove(e: PointerEvent): void {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetX = clamp((e.clientX - cx) / cx, -1, 1);
    targetY = clamp((e.clientY - cy) / cy, -1, 1);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick(): void {
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;
    char!.style.setProperty('--tilt', (currentX * MAX_TILT).toFixed(2) + 'deg');
    char!.style.setProperty('--shift-x', (currentX * MAX_SHIFT_X).toFixed(2) + 'px');
    char!.style.setProperty('--shift-y', (currentY * MAX_SHIFT_Y).toFixed(2) + 'px');
    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
      raf = requestAnimationFrame(tick);
    } else raf = null;
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', () => {
    targetX = 0; targetY = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  });
}
