import * as THREE from 'three';

export function initGhostCursor(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const host = document.getElementById('ghost-cursor');
  if (!host) return;
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const TRAIL_LENGTH = 24;
  const positions = new Float32Array(TRAIL_LENGTH * 3);
  const alphas = new Float32Array(TRAIL_LENGTH);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float alpha;',
      'varying float vAlpha;',
      'void main() {',
      '  vAlpha = alpha;',
      '  gl_Position = vec4(position.xy, 0.0, 1.0);',
      '  gl_PointSize = 14.0 * alpha;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'varying float vAlpha;',
      'void main() {',
      '  vec2 d = gl_PointCoord - vec2(0.5);',
      '  float r = length(d);',
      '  float a = smoothstep(0.5, 0.0, r) * vAlpha;',
      '  gl_FragColor = vec4(0.72, 0.62, 0.95, a * 0.22);',
      '}',
    ].join('\n'),
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  const pointer = { x: 0, y: 0 };
  const history: Array<{ x: number; y: number }> = [];
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });
  function tick(): void {
    history.unshift({ x: pointer.x, y: pointer.y });
    if (history.length > TRAIL_LENGTH) history.pop();
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const p = history[i] ?? history[history.length - 1] ?? { x: 0, y: 0 };
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = 0;
      alphas[i] = Math.max(0, 1 - i / TRAIL_LENGTH);
    }
    geometry.attributes.position!.needsUpdate = true;
    geometry.attributes.alpha!.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
