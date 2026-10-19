(() => {
  const button = document.querySelector('#send-signal');
  if (!button) return;
  let count = 0;
  let timer;
  button.addEventListener('click', () => {
    count += 1;
    document.querySelector('#pulse-count').textContent = `${String(count).padStart(2, '0')} ${count === 1 ? 'PULSE' : 'PULSES'}`;
    document.querySelector('#signal-status').textContent = `Signal ${String(count).padStart(2, '0')} sent. The current carries it forward.`;
    const panel = document.querySelector('.signal-panel');
    panel.classList.remove('is-pulsing');
    void panel.offsetWidth;
    panel.classList.add('is-pulsing');
    clearTimeout(timer);
    timer = setTimeout(() => panel.classList.remove('is-pulsing'), 1100);
  });
})();

(() => {
  const canvas = document.querySelector('#current-field');
  const toggle = document.querySelector('#motion-toggle');
  if (!canvas || !toggle) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) { toggle.hidden = true; return; }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  let visible = true;
  let frame = 0;
  let width = 0;
  let height = 0;
  let time = 0;
  let last = 0;
  const points = Array.from({length: 64}, (_, i) => ({
    x: ((i * 73 + 17) % 997) / 997,
    y: ((i * 137 + 41) % 991) / 991,
    size: i % 5 === 0 ? 1.6 : .7,
    phase: i * 2.39
  }));
  function paint() {
    ctx.clearRect(0, 0, width, height);
    const positions = points.map(p => ({
      x: p.x * width + Math.sin(time * .16 + p.phase) * 13,
      y: p.y * height + Math.cos(time * .12 + p.phase) * 18,
      p
    }));
    positions.forEach((p, i) => {
      ctx.fillStyle = i % 9 === 0 ? 'rgba(255,221,112,.75)' : 'rgba(99,176,255,.6)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.p.size, 0, Math.PI * 2); ctx.fill();
      for (let j = i + 1; j < positions.length; j++) {
        const q = positions[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(55,144,235,${(1 - d / 140) * .2})`;
          ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    });
    for (let i = 0; i < 5; i++) {
      const y = height * (.25 + i * .105);
      const x = ((time * (26 + i * 8) + i * width * .24) % (width + 130)) - 100;
      const gradient = ctx.createLinearGradient(x, y, x + 95, y - 24);
      gradient.addColorStop(0, 'rgba(30,130,255,0)');
      gradient.addColorStop(1, 'rgba(83,175,255,.5)');
      ctx.strokeStyle = gradient; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 95, y - 24); ctx.stroke();
    }
  }
  function tick(now) {
    frame = 0;
    if (paused || !visible || document.hidden) { last = 0; return; }
    if (last) time += Math.min((now - last) / 1000, .05);
    last = now;
    paint();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    document.body.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
    cancelAnimationFrame(frame); frame = 0; last = 0;
    paint();
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); paint();
  }
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', event => { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(canvas);
  resize(); sync();
})();
