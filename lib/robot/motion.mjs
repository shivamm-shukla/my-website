/** The companion has one continuous position. Scrolling never changes it. */
export const COMPANION_DOCK_BREAKPOINT = 0;
const clamp = (value, min, max) => Math.max(min, Math.min(Math.max(min, max), value));

export function companionHome({ width, height, size, slot, safeBottom = 0 }) {
  return {
    x: width - size.width - 12,
    y: Math.max(0, height - size.height - Math.max(24, safeBottom + 12)),
  };
}

export function nextRoamPosition({ home, current, random = Math.random }) {
  const top = Math.max(0, Math.min(home.y, home.y - 180));
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
  let pinned = false;
  let sleeping = false;
  let pointer = null;
  let longPress = 0;
  let suppressClick = false;
  let sleepTimer = 0;
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
    launcher.dataset.mode = 'roaming';
    return companionHome({
      width,
      height: window.visualViewport?.height ?? window.innerHeight,
      size: { width: launcher.offsetWidth, height: launcher.offsetHeight },
      slot: slot?.getBoundingClientRect(),
      safeBottom: Number.parseFloat(getComputedStyle(launcher).getPropertyValue('--safe-bottom')) || 0,
    });
  };
  const isPaused = () => !motionAllowed() || isOpen() || pinned || sleeping || !!document.querySelector('dialog[open]');
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
      travel(nextRoamPosition({ home, current: position }), 1800 + Math.random() * 1200);
    }, 1800 + Math.random() * 1800);
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
      if (pinned) {
        position = { x: clamp(position.x, 8, window.innerWidth - launcher.offsetWidth - 8), y: clamp(position.y, 72, window.innerHeight - launcher.offsetHeight - 8) };
        write(position);
        savePosition();
        return;
      }
      settle();
      travel(home, Math.min(900, 280 + Math.hypot(home.x - position.x, home.y - position.y)));
    });
  };
  const savePosition = () => {
    try { sessionStorage.setItem('shivam-robot-position', JSON.stringify({ x: position.x, y: position.y, pinned })); } catch { /* Session storage is optional. */ }
  };
  const setPinned = (value) => {
    pinned = Boolean(value);
    launcher.dataset.pinned = String(pinned);
    if (pinned) {
      clearTimeout(timer);
      launcher.dataset.state = 'pinned';
      launcher.dataset.tip = 'Pinned here. Tap me to let me roam again.';
      savePosition();
    } else {
      delete launcher.dataset.tip;
      sync();
    }
    window.dispatchEvent(new CustomEvent('site:robot-pin-state', { detail: pinned }));
  };
  const wake = () => {
    if (!sleeping) { clearTimeout(sleepTimer); sleepTimer = window.setTimeout(sleep, 30000); return; }
    sleeping = false;
    launcher.dataset.sleeping = 'false';
    clearTimeout(sleepTimer);
    sleepTimer = window.setTimeout(sleep, 30000);
    sync();
  };
  const sleep = () => {
    if (disposed || isOpen()) { sleepTimer = window.setTimeout(sleep, 5000); return; }
    sleeping = true;
    launcher.dataset.sleeping = 'true';
    pause();
  };
  const onPointerDown = (event) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    wake();
    settle();
    pause();
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: false };
    try { launcher.setPointerCapture(event.pointerId); } catch { /* Pointer capture may be unavailable. */ }
    longPress = window.setTimeout(() => {
      if (!pointer?.moved) { suppressClick = true; window.dispatchEvent(new Event('site:assistant')); }
    }, 480);
  };
  const onPointerMove = (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
    if (distance > 8) {
      pointer.moved = true;
      clearTimeout(longPress);
      wake();
    }
    if (!pointer.moved) return;
    pinned = true;
    launcher.dataset.pinned = 'true';
    launcher.dataset.state = 'pinned';
    const next = { x: clamp(event.clientX - launcher.offsetWidth / 2, 8, window.innerWidth - launcher.offsetWidth - 8), y: clamp(event.clientY - launcher.offsetHeight / 2, 72, window.innerHeight - launcher.offsetHeight - 8) };
    position = next;
    write(next);
  };
  const onPointerUp = (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    clearTimeout(longPress);
    if (pointer.moved) {
      suppressClick = true;
      setPinned(true);
      launcher.dataset.tip = 'Pinned here. Tap me to let me roam again.';
      savePosition();
    } else sync();
    pointer = null;
  };
  const onClickCapture = (event) => {
    if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopPropagation(); return; }
    if (pinned) { event.preventDefault(); event.stopPropagation(); setPinned(false); savePosition(); }
  };
  const onPinEvent = (event) => setPinned(typeof event.detail === 'boolean' ? event.detail : !pinned);
  const onActivity = () => wake();
  const onRoute = () => { wake(); sync(); };
  home = readHome();
  position = home;
  try {
    const saved = JSON.parse(sessionStorage.getItem('shivam-robot-position') || 'null');
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
      position = { x: clamp(saved.x, 8, window.innerWidth - launcher.offsetWidth - 8), y: clamp(saved.y, 72, window.innerHeight - launcher.offsetHeight - 8) };
      pinned = Boolean(saved.pinned);
    }
  } catch { /* Use the default safe position. */ }
  write(position);
  launcher.dataset.edge = 'right';
  launcher.dataset.pinned = String(pinned);
  launcher.style.visibility = 'visible';
  launcher.tabIndex = 0;
  if (pinned) launcher.dataset.state = 'pinned'; else schedule();
  sleepTimer = window.setTimeout(sleep, 30000);

  const dialogs = new MutationObserver(sync);
  dialogs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['open'] });
  const header = new ResizeObserver(resize);
  if (slot) header.observe(slot);
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('site:motion', sync);
  window.addEventListener('site:robot-pin', onPinEvent);
  window.addEventListener('site:route', onRoute);
  launcher.addEventListener('pointerdown', onPointerDown);
  launcher.addEventListener('pointermove', onPointerMove);
  launcher.addEventListener('pointerup', onPointerUp);
  launcher.addEventListener('pointercancel', onPointerUp);
  launcher.addEventListener('click', onClickCapture, true);
  window.addEventListener('pointermove', onActivity, { passive: true });
  window.addEventListener('keydown', onActivity);
  window.addEventListener('scroll', onActivity, { passive: true });
  document.addEventListener('visibilitychange', sync);
  preference.addEventListener('change', sync);
  // Deliberately no scroll listener: the character stays anchored to the viewport.
  return () => {
    disposed = true;
    settle();
    clearTimeout(timer);
    clearTimeout(longPress);
    clearTimeout(sleepTimer);
    cancelAnimationFrame(frame);
    dialogs.disconnect();
    header.disconnect();
    window.removeEventListener('resize', resize);
    window.visualViewport?.removeEventListener('resize', resize);
    window.removeEventListener('site:motion', sync);
    window.removeEventListener('site:robot-pin', onPinEvent);
    window.removeEventListener('site:route', onRoute);
    launcher.removeEventListener('pointerdown', onPointerDown);
    launcher.removeEventListener('pointermove', onPointerMove);
    launcher.removeEventListener('pointerup', onPointerUp);
    launcher.removeEventListener('pointercancel', onPointerUp);
    launcher.removeEventListener('click', onClickCapture, true);
    window.removeEventListener('pointermove', onActivity);
    window.removeEventListener('keydown', onActivity);
    window.removeEventListener('scroll', onActivity);
    document.removeEventListener('visibilitychange', sync);
    preference.removeEventListener('change', sync);
  };
}
