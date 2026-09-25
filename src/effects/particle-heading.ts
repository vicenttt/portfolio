const SPRING_K = 0.07;
const DAMPING = 0.82;
const MOUSE_RADIUS = 65;
const MOUSE_FORCE = 4;
const R2 = MOUSE_RADIUS * MOUSE_RADIUS;
const ASSEMBLE_DURATION = 1400;
const FALLBACK_TEXT = 'VINCENT LIU';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  tx: number; ty: number; sx: number; sy: number;
}

export function initParticleHeading(): void {
  const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement | null;
  const label = document.querySelector('.particle-heading-text') as HTMLElement | null;
  if (!canvas || !label) return;
  const text = label.textContent?.trim() || FALLBACK_TEXT;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawStatic(canvas, text);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const particles: Particle[] = [];
  let assembleStart = 0;
  let lastW = -1, lastH = -1;

  function computeTargets(): Array<{ x: number; y: number }> {
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.floor(W));
    off.height = Math.max(1, Math.floor(H));
    const octx = off.getContext('2d');
    if (!octx) return [];
    const fontSize = Math.min(H * 0.78, W / (text.length * 0.58));
    octx.fillStyle = '#fff';
    octx.font = `900 ${fontSize}px Kanit, sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(text, off.width / 2, off.height / 2);
    const data = octx.getImageData(0, 0, off.width, off.height).data;
    const gap = Math.max(2, Math.round(Math.min(W, H) / 60));
    const targets: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < off.height; y += gap) {
      for (let x = 0; x < off.width; x += gap) {
        if (data[(y * off.width + x) * 4 + 3]! > 128) targets.push({ x, y });
      }
    }
    return targets;
  }

  function buildParticles(): void {
    const targets = computeTargets();
    particles.length = 0;
    for (const t of targets) {
      const a = Math.random() * Math.PI * 2;
      const r = 200 + Math.random() * 300;
      particles.push({
        x: 0, y: 0, vx: 0, vy: 0,
        tx: t.x, ty: t.y,
        sx: W / 2 + Math.cos(a) * r,
        sy: H / 2 + Math.sin(a) * r,
      });
    }
    assembleStart = performance.now();
  }

  function retargetParticles(): void {
    const targets = computeTargets();
    const n = Math.min(particles.length, targets.length);
    for (let i = 0; i < n; i++) {
      particles[i]!.tx = targets[i]!.x;
      particles[i]!.ty = targets[i]!.y;
    }
    if (Math.abs(particles.length - targets.length) > 100) {
      particles.length = 0;
      for (const t of targets) {
        particles.push({ x: t.x, y: t.y, vx: 0, vy: 0, tx: t.x, ty: t.y, sx: t.x, sy: t.y });
      }
    }
  }

  function resize(): void {
    const rect = canvas!.getBoundingClientRect();
    const newW = Math.round(rect.width * DPR);
    const newH = Math.round(rect.height * DPR);
    if (newW === lastW && newH === lastH) return;
    lastW = newW; lastH = newH;
    W = canvas!.width = newW;
    H = canvas!.height = newH;
    if (particles.length === 0) buildParticles();
    else retargetParticles();
  }

  const mouse = { x: -9999, y: -9999, active: false };
  function updateMouse(e: PointerEvent): void {
    const rect = canvas!.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (W / rect.width);
    mouse.y = (e.clientY - rect.top) * (H / rect.height);
    mouse.active = true;
  }
  canvas.addEventListener('pointermove', updateMouse);
  canvas.addEventListener('pointerenter', updateMouse);
  canvas.addEventListener('pointerleave', () => {
    mouse.active = false; mouse.x = -9999; mouse.y = -9999;
  });

  resize();
  new ResizeObserver(resize).observe(canvas);

  function tick(now: number): void {
    const progress = Math.min(1, (now - assembleStart) / ASSEMBLE_DURATION);
    const ease = 1 - Math.pow(1 - progress, 3);
    ctx!.clearRect(0, 0, W, H);
    ctx!.fillStyle = '#bbccd7';
    const dot = Math.max(1.4, DPR * 0.9);
    for (const p of particles) {
      p.vx += (p.tx - p.x) * SPRING_K;
      p.vy += (p.ty - p.y) * SPRING_K;
      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 0.0001;
          const s = 1 - d / MOUSE_RADIUS;
          const force = s * s * MOUSE_FORCE;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }
      p.vx *= DAMPING; p.vy *= DAMPING;
      p.x += p.vx; p.y += p.vy;
      const drawX = progress < 1 ? p.sx + (p.x - p.sx) * ease : p.x;
      const drawY = progress < 1 ? p.sy + (p.y - p.sy) * ease : p.y;
      ctx!.fillRect(drawX, drawY, dot, dot);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function drawStatic(canvas: HTMLCanvasElement, text: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.scale(dpr, dpr);
  const fontSize = Math.min(rect.height * 0.78, rect.width / (text.length * 0.58));
  ctx.fillStyle = '#bbccd7';
  ctx.font = `900 ${fontSize}px Kanit, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, rect.width / 2, rect.height / 2);
}
