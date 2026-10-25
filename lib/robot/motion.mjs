/** Shared by the React site and the portable preview. No animation library. */
export function overlaps(a, b, gap = 10) {
  return a.left < b.right + gap && a.right > b.left - gap &&
    a.top < b.bottom + gap && a.bottom > b.top - gap;
}

export function sweptBounds(from, to, size) {
  return {
    left: Math.min(from.x, to.x), top: Math.min(from.y, to.y),
    right: Math.max(from.x, to.x) + size.width,
    bottom: Math.max(from.y, to.y) + size.height,
  };
}

export function findSafePosition({ width, height, size, obstacles, current, roam = false, mobile = false, random = Math.random, inset = 16 }) {
  const top = 110;
  const bottom = height - size.height - inset;
  if (bottom < top || width < size.width + inset * 2) return null;
  const right = width - size.width - inset;
  const candidates = [];
  for (const x of [right, inset]) {
    for (let y = bottom; y >= top; y -= size.height + 24) candidates.push({ x, y });
  }
  if (roam && !mobile) {
    // Fisher–Yates: stable tests can supply their own random source.
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
  }
  if (current && !roam) candidates.unshift(current);
  return candidates.find((candidate) => {
    if (candidate.x < inset || candidate.y < top || candidate.x + size.width > width - inset || candidate.y > bottom) return false;
    if (roam && current && Math.hypot(candidate.x - current.x, candidate.y - current.y) < 60) return false;
    const box = roam && current ? sweptBounds(current, candidate, size) : sweptBounds(candidate, candidate, size);
    return !obstacles.some((obstacle) => overlaps(box, obstacle));
  }) ?? null;
}

export function motionAllowed() {
  return !document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches &&
    document.documentElement.dataset.motion !== 'paused';
}

export function attachEyes(svg) {
  const eyes = svg.querySelector('.robot-eyes');
  if (!eyes) return () => {};
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let frame = 0;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    svg.classList.toggle('robot-offscreen', !visible);
  });
  observer.observe(svg);
  const move = (event) => {
    if (!visible || !motionAllowed()) return;
    cancelAnimationFrame(frame);
    const { clientX, clientY } = event;
    frame = requestAnimationFrame(() => {
      const box = svg.getBoundingClientRect();
      const x = Math.max(-4, Math.min(4, (clientX - box.left - box.width / 2) / 100));
      const y = Math.max(-3, Math.min(3, (clientY - box.top - box.height / 2) / 140));
      eyes.style.transform = `translate(${x}px, ${y}px)`;
    });
  };
  const reset = () => {
    cancelAnimationFrame(frame);
    eyes.style.transform = '';
  };
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', move, { passive: true });
  window.addEventListener('blur', reset);
  window.addEventListener('site:motion', reset);
  preference.addEventListener('change', reset);
  return () => {
    observer.disconnect();
    reset();
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerdown', move);
    window.removeEventListener('blur', reset);
    window.removeEventListener('site:motion', reset);
    preference.removeEventListener('change', reset);
  };
}

export function attachRoaming(launcher, { isOpen = () => false } = {}) {
  let position = null;
  let flight = null;
  let frame = 0;
  let timer = 0;
  let disposed = false;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const selector = 'a, button, input, textarea, select, label, h1, h2, h3, p, pre, [data-robot-obstacle]';
  const hide = () => {
    launcher.style.visibility = 'hidden';
    launcher.tabIndex = -1;
  };
  const stop = () => {
    if (!flight) return;
    const box = launcher.getBoundingClientRect();
    position = { x: box.left, y: box.top };
    launcher.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    flight.cancel();
    flight = null;
    launcher.dataset.state = 'idle';
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!disposed && motionAllowed()) timer = window.setTimeout(() => { place(true); schedule(); }, 9000 + Math.random() * 5000);
  };
  const place = (roam = false) => {
    if (disposed) return;
    if (document.hidden || isOpen() || document.querySelector('dialog[open]')) {
      stop();
      if (document.querySelector('dialog[open]')) hide();
      return;
    }
    if (launcher.matches(':hover, :focus-within')) { stop(); return; }
    stop();
    const width = document.documentElement.clientWidth;
    const viewport = window.visualViewport;
    const height = Math.min(window.innerHeight, viewport?.height ?? window.innerHeight);
    const mobile = width <= 700;
    const size = { width: launcher.offsetWidth, height: launcher.offsetHeight };
    const obstacles = [...document.querySelectorAll(selector)]
      .filter((element) => element !== launcher && !launcher.contains(element) && !element.closest('dialog') && element.getClientRects().length)
      .map((element) => element.getBoundingClientRect())
      .filter((box) => box.bottom > 0 && box.top < height);
    const safeBottom = Number.parseFloat(getComputedStyle(launcher).getPropertyValue('--safe-bottom')) || 0;
    const next = findSafePosition({ width, height, size, obstacles, current: position,
      roam: roam && motionAllowed() && !mobile, mobile, inset: Math.max(16, safeBottom + 8) });
    if (!next) {
      // No safe flight path? Stay put if the current spot is still clear.
      if (roam && position && !obstacles.some((box) => overlaps(sweptBounds(position, position, size), box))) return;
      position = null;
      hide();
      return;
    }
    const start = position;
    position = next;
    launcher.style.visibility = 'visible';
    launcher.tabIndex = 0;
    launcher.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`;
    if (roam && start && motionAllowed() && !mobile && (start.x !== next.x || start.y !== next.y)) {
      launcher.dataset.state = 'roaming';
      flight = launcher.animate([
        { transform: `translate3d(${start.x}px, ${start.y}px, 0)` },
        { transform: `translate3d(${next.x}px, ${next.y}px, 0)` },
      ], { duration: Math.min(4800, 1600 + Math.hypot(next.x - start.x, next.y - start.y) * 5), easing: 'cubic-bezier(.45, 0, .2, 1)' });
      flight.onfinish = () => { flight = null; launcher.dataset.state = 'idle'; };
    }
    launcher.dataset.edge = next.x < width / 2 ? 'left' : 'right';
  };
  const refresh = () => {
    stop();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => place());
  };
  const visibility = () => { stop(); refresh(); schedule(); };
  const freeze = () => stop();
  const observer = new MutationObserver(refresh);
  document.querySelectorAll('dialog').forEach((dialog) => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  window.addEventListener('scroll', refresh, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.visualViewport?.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('site:motion', visibility);
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('focusin', refresh);
  preference.addEventListener('change', visibility);
  launcher.addEventListener('pointerenter', freeze);
  launcher.addEventListener('focus', freeze);
  place();
  schedule();
  return () => {
    disposed = true;
    stop();
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener('scroll', refresh);
    window.removeEventListener('resize', refresh);
    window.visualViewport?.removeEventListener('resize', refresh);
    window.removeEventListener('site:motion', visibility);
    document.removeEventListener('visibilitychange', visibility);
    document.removeEventListener('focusin', refresh);
    preference.removeEventListener('change', visibility);
    launcher.removeEventListener('pointerenter', freeze);
    launcher.removeEventListener('focus', freeze);
  };
}
