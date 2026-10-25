/** The companion has one continuous position. Scrolling never changes it. */
export const COMPANION_DOCK_BREAKPOINT = 1100;

export function companionHome({ width, height, size, slot, safeBottom = 0 }) {
  const clamp = (value, min, max) => Math.max(min, Math.min(Math.max(min, max), value));
  if (width < COMPANION_DOCK_BREAKPOINT) {
    return {
      x: clamp(slot ? slot.left + (slot.width - size.width) / 2 : width - size.width - 64, 8, width - size.width - 8),
      y: clamp(slot ? slot.top + (slot.height - size.height) / 2 : 4, 0, height - size.height),
    };
  }
  return {
    x: width - size.width - 12,
    y: Math.max(0, height - size.height - Math.max(24, safeBottom + 12)),
  };
}

export function nextRoamPosition({ home, current, random = Math.random }) {
  const top = Math.min(home.y, Math.max(96, home.y - 180));
  let y = top + Math.max(0, Math.min(1, random())) * (home.y - top);
  if (current && Math.abs(current.y - y) < 40) y = current.y > (top + home.y) / 2 ? top : home.y;
  return { x: home.x, y };
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
    if (svg.dataset.follow !== 'true' || !visible || !motionAllowed()) return;
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
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const slot = document.querySelector('[data-companion-slot]');
  let animation = null;
  let timer = 0;
  let frame = 0;
  let disposed = false;
  let home;
  let position;

  const write = (point) => {
    launcher.style.left = '0';
    launcher.style.top = '0';
    launcher.style.right = 'auto';
    launcher.style.bottom = 'auto';
    launcher.style.transform = 'translate3d(' + point.x + 'px,' + point.y + 'px,0)';
  };
  const readHome = () => {
    const width = document.documentElement.clientWidth;
    launcher.dataset.mode = width < COMPANION_DOCK_BREAKPOINT ? 'docked' : 'roaming';
    return companionHome({
      width,
      height: window.visualViewport?.height ?? window.innerHeight,
      size: { width: launcher.offsetWidth, height: launcher.offsetHeight },
      slot: slot?.getBoundingClientRect(),
      safeBottom: Number.parseFloat(getComputedStyle(launcher).getPropertyValue('--safe-bottom')) || 0,
    });
  };
  const isPaused = () => !motionAllowed() || isOpen() || !!document.querySelector('dialog[open]') ||
    launcher.matches(':hover, :focus-within') || launcher.dataset.mode === 'docked';
  const pause = () => {
    clearTimeout(timer);
    animation?.pause();
    launcher.dataset.state = 'idle';
  };
  const schedule = () => {
    clearTimeout(timer);
    if (disposed || isPaused() || animation) return;
    timer = window.setTimeout(() => {
      if (disposed || isPaused()) return;
      travel(nextRoamPosition({ home, current: position }), 6800 + Math.random() * 2400);
    }, 5000 + Math.random() * 4000);
  };
  const settle = () => {
    if (!animation) return;
    const box = launcher.getBoundingClientRect();
    animation.onfinish = null;
    animation.cancel();
    animation = null;
    position = { x: box.left, y: box.top };
    write(position);
  };
  const travel = (next, duration) => {
    clearTimeout(timer);
    settle();
    const start = position;
    write(next);
    if (!motionAllowed() || Math.hypot(start.x - next.x, start.y - next.y) < 1) {
      position = next;
      schedule();
      return;
    }
    launcher.dataset.state = 'roaming';
    animation = launcher.animate([
      { transform: 'translate3d(' + start.x + 'px,' + start.y + 'px,0)' },
      { transform: 'translate3d(' + next.x + 'px,' + next.y + 'px,0)' },
    ], { duration, easing: 'cubic-bezier(.45,0,.55,1)' });
    animation.onfinish = () => {
      animation = null;
      position = next;
      launcher.dataset.state = 'idle';
      schedule();
    };
  };
  const sync = () => {
    if (isPaused()) { pause(); return; }
    if (animation?.playState === 'paused') {
      launcher.dataset.state = 'roaming';
      animation.play();
    } else schedule();
  };
  const resize = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const next = readHome();
      if (home && Math.abs(next.x - home.x) < 1 && Math.abs(next.y - home.y) < 1) return;
      home = next;
      settle();
      travel(home, Math.min(900, 280 + Math.hypot(home.x - position.x, home.y - position.y)));
    });
  };
  home = readHome();
  position = home;
  write(position);
  launcher.dataset.edge = 'right';
  launcher.style.visibility = 'visible';
  launcher.tabIndex = 0;
  schedule();

  const dialogs = new MutationObserver(sync);
  dialogs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['open'] });
  const header = new ResizeObserver(resize);
  if (slot) header.observe(slot);
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('site:motion', sync);
  document.addEventListener('visibilitychange', sync);
  preference.addEventListener('change', sync);
  launcher.addEventListener('pointerenter', pause);
  launcher.addEventListener('focus', pause);
  launcher.addEventListener('pointerleave', sync);
  launcher.addEventListener('blur', sync);
  // Deliberately no scroll listener: the character stays anchored to the viewport.
  return () => {
    disposed = true;
    settle();
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    dialogs.disconnect();
    header.disconnect();
    window.removeEventListener('resize', resize);
    window.visualViewport?.removeEventListener('resize', resize);
    window.removeEventListener('site:motion', sync);
    document.removeEventListener('visibilitychange', sync);
    preference.removeEventListener('change', sync);
    launcher.removeEventListener('pointerenter', pause);
    launcher.removeEventListener('focus', pause);
    launcher.removeEventListener('pointerleave', sync);
    launcher.removeEventListener('blur', sync);
  };
}
