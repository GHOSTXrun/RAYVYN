(() => {
  const svg = document.querySelector('.sensing .web-map');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const nodes = [...svg.querySelectorAll('.web-nodes circle')];
  const origin = nodes.map(n => ({x: +n.getAttribute('cx'), y: +n.getAttribute('cy')}));
  const edges = [[2,1],[2,7],[2,3],[1,0],[7,8],[3,4],[7,6],[4,5],[0,8],[6,5],[1,8],[3,6],[0,2],[7,4],[2,6],[7,5]];
  const lines = svg.querySelector('.web-lines');
  lines.replaceChildren();
  const signals = document.createElementNS(ns, 'g');
  signals.setAttribute('aria-hidden', 'true');
  svg.insertBefore(signals, svg.querySelector('.web-nodes'));
  function element(tag, attributes, parent) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([k,v]) => el.setAttribute(k,v));
    parent.appendChild(el); return el;
  }
  const links = edges.map(([a,b],i) => ({a,b,
    line: element('line', {stroke:'#218ddb', 'stroke-width':'.8'}, lines),
    glow: element('line', {stroke:'#65f5ff', 'stroke-width':'1.2'}, signals),
    dot: element('circle', {r: i % 3 ? '1.6':'2.2', fill:'#97fbff', style:'filter:drop-shadow(0 0 4px #00ddec)'}, signals)
  }));
  const rings = [0,1,2].map(() => element('circle', {fill:'none',stroke:'#53eaff','stroke-width':'.8',opacity:'0'}, signals));
  nodes[2].style.display = 'none';
  svg.querySelector('.pulse-ring')?.setAttribute('display','none');
  const mascot = element('image', {href:'/rayvyn-logo.png',x:'-48',y:'-48',width:'96',height:'96',style:'mix-blend-mode:screen;pointer-events:none'},svg);
  const label = svg.querySelector('text');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let time = 0, last = 0, frame = 0, visible = false, burst = -100;
  const clamp = n => Math.max(0,Math.min(1,n));
  function paint(staticView = false) {
    const positions = origin.map((p,i) => ({x:p.x + (i === 2 ? 0 : Math.sin(time * .24 + i*1.7)*5),y:p.y + (i === 2 ? 0 : Math.cos(time*.2+i)*4)}));
    positions[2] = {x:origin[2].x + (staticView ? 0 : Math.sin(time*.22)*72),y:origin[2].y + (staticView ? 0 : Math.sin(time*.36)*32)};
    const center = positions[2];
    mascot.setAttribute('transform',`translate(${center.x} ${center.y}) rotate(${staticView ? 0 : Math.cos(time*.36)*9})`);
    if(label){label.setAttribute('x',center.x+43);label.setAttribute('y',center.y-24);}
    const cycle = time % 42;
    const fade = cycle > 37 ? 1 - (cycle-37)/5 : 1;
    nodes.forEach((node,i) => {
      node.setAttribute('cx',positions[i].x); node.setAttribute('cy',positions[i].y);
      node.style.opacity = staticView ? '.8' : String(.48 + .32*(.5+.5*Math.sin(time*1.2-i)));
    });
    links.forEach((link,i) => {
      const a = positions[link.a], b = positions[link.b];
      const growth = staticView ? 1 : clamp((cycle-i*1.35)/4.8);
      const distance = Math.hypot(b.x-a.x,b.y-a.y);
      const progress = (time/(5.5+i%4)+i*.23)%1;
      const strength = Math.sin(progress*Math.PI) * growth * fade;
      const activeBurst = clamp(1-(time-burst)/4);
      link.line.setAttribute('x1',a.x); link.line.setAttribute('y1',a.y);
      link.line.setAttribute('x2',a.x+(b.x-a.x)*growth); link.line.setAttribute('y2',a.y+(b.y-a.y)*growth);
      link.line.setAttribute('opacity',staticView ? '.45' : .12+growth*fade*.38);
      const end = Math.min(progress,growth), start = Math.max(0,end-12/distance);
      link.glow.setAttribute('x1',a.x+(b.x-a.x)*start); link.glow.setAttribute('y1',a.y+(b.y-a.y)*start);
      link.glow.setAttribute('x2',a.x+(b.x-a.x)*end); link.glow.setAttribute('y2',a.y+(b.y-a.y)*end);
      link.glow.setAttribute('opacity',staticView ? 0 : strength*(.4+activeBurst*.5));
      link.dot.setAttribute('cx',a.x+(b.x-a.x)*end); link.dot.setAttribute('cy',a.y+(b.y-a.y)*end);
      link.dot.setAttribute('opacity',staticView || progress>growth ? 0 : strength*(.6+activeBurst*.4));
    });
    rings.forEach((ring,i) => {
      const elapsed = time-burst-i*.55;
      ring.setAttribute('cx',center.x); ring.setAttribute('cy',center.y);
      ring.setAttribute('r',18+Math.max(0,elapsed)*47);
      ring.setAttribute('opacity',!staticView && elapsed>0 && elapsed<3.5 ? (1-elapsed/3.5)*.6 : 0);
    });
  }
  function paused() { return reduced.matches || document.body.classList.contains('motion-paused'); }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || paused()) { last=0; return; }
    if (last) time += Math.min((now-last)/1000,.06);
    last=now; paint(); frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame=0; last=0;
    paint(reduced.matches);
    if (visible && !document.hidden && !paused()) frame=requestAnimationFrame(tick);
  }
  document.querySelector('#send-signal')?.addEventListener('click',()=>{burst=time;});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(svg);
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  svg.setAttribute('aria-label','A slowly growing network with faint signals flowing between gently drifting nodes');
  paint(reduced.matches);
})();
