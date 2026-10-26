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

export function pickRoamTarget({ width, height, size, pathname = '/', random = Math.random }) {
  const maxX = Math.max(8, width - size.width - 8);
  const maxY = Math.max(70, height - size.height - 8);
  if (/^\/(blog|work)\//.test(pathname)) {
    return {
      x: clamp(width - size.width - 10, 8, maxX),
      y: clamp(height * (.45 + Math.max(0, Math.min(1, random())) * .4), 70, maxY),
    };
  }
  return {
    x: clamp(16 + Math.max(0, Math.min(1, random())) * Math.max(0, width - size.width - 32), 8, maxX),
    y: clamp(90 + Math.max(0, Math.min(1, random())) * Math.max(0, height - size.height - 190), 70, maxY),
  };
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
  const width = () => document.documentElement.clientWidth;
  const height = () => window.visualViewport?.height ?? window.innerHeight;
  const size = () => ({ width: launcher.offsetWidth, height: launcher.offsetHeight });
  let frame = 0;
  let roamTimer = 0;
  let idleTimer = 0;
  let disposed = false;
  let pinned = false;
  let sleeping = false;
  let dragging = false;
  let down = null;
  let x = clamp(width() - 110, 8, width() - launcher.offsetWidth - 8);
  let y = clamp(height() - 220, 70, height() - launcher.offsetHeight - 8);
  let tx = x, ty = y, vx = 0, vy = 0, last = 0;
  let longPress = 0;
  let suppressClick = false;

  const write = () => {
    launcher.style.left = '0';
    launcher.style.top = '0';
    launcher.style.right = 'auto';
    launcher.style.bottom = 'auto';
    launcher.style.transform = `translate3d(${x}px,${y}px,0)`;
    launcher.style.setProperty('--robot-tilt', `${clamp(vx * .03, -18, 18)}deg`);
    launcher.dataset.edge = x > width() / 2 ? 'right' : 'left';
  };
  const save = () => {
    try { sessionStorage.setItem('shivam-robot-position', JSON.stringify({ x, y, pinned })); } catch { /* Session storage is optional. */ }
  };
  const sleep = () => {
    if (isOpen() || dragging) { idleTimer = window.setTimeout(sleep, 3000); return; }
    sleeping = true;
    launcher.dataset.sleeping = 'true';
    launcher.dataset.state = 'idle';
  };
  const wake = () => {
    sleeping = false;
    launcher.dataset.sleeping = 'false';
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(sleep, 30000);
  };
  const setPinned = (value) => {
    pinned = Boolean(value);
    launcher.dataset.pinned = String(pinned);
    if (pinned) {
      tx = x; ty = y; vx = vy = 0;
      launcher.dataset.state = 'pinned';
      launcher.dataset.tip = 'Pinned here. Tap me to let me roam again.';
    } else {
      delete launcher.dataset.tip;
      launcher.dataset.state = 'roaming';
      const next = pickRoamTarget({ width: width(), height: height(), size: size(), pathname: window.location.pathname });
      tx = next.x; ty = next.y;
    }
    save();
    window.dispatchEvent(new CustomEvent('site:robot-pin-state', { detail: pinned }));
  };
  const pick = () => {
    if (pinned || dragging || isOpen() || document.hidden || preference.matches || document.documentElement.dataset.motion === 'paused' || sleeping) return;
    const next = pickRoamTarget({ width: width(), height: height(), size: size(), pathname: window.location.pathname });
    tx = next.x; ty = next.y;
    launcher.dataset.state = 'roaming';
    if (Math.random() < .3) window.dispatchEvent(new CustomEvent('site:bot-say', { detail: ['Hi, I am the site bot.', 'Long-press me to chat.', 'Drag me to pin me anywhere.', 'Want to hire Shivam?'][Math.random() * 4 | 0] }));
  };
  const placePanel = () => {
    const panel = document.querySelector('.assistant-dialog');
    if (!panel) return;
    const panelWidth = Math.min(420, width() - 32);
    const panelHeight = panel.offsetHeight || 360;
    const left = clamp(x + launcher.offsetWidth / 2 - panelWidth / 2, 12, width() - panelWidth - 12);
    const top = y > panelHeight + 90 ? y - panelHeight - 10 : Math.min(height() - panelHeight - 12, y + launcher.offsetHeight + 10);
    panel.style.left = `${left}px`;
    panel.style.top = `${Math.max(70, top)}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  };
  const onPointerDown = (event) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    wake();
    down = { id: event.pointerId, px: event.clientX, py: event.clientY, ox: event.clientX - x, oy: event.clientY - y, moved: false, long: false };
    try { launcher.setPointerCapture(event.pointerId); } catch { /* Pointer capture may be unavailable. */ }
    clearTimeout(longPress);
    longPress = window.setTimeout(() => { if (down && !down.moved) { down.long = true; suppressClick = true; window.dispatchEvent(new Event('site:assistant')); } }, 480);
  };
  const onPointerMove = (event) => {
    if (!down || down.id !== event.pointerId) return;
    if (!down.moved && Math.hypot(event.clientX - down.px, event.clientY - down.py) > 8) { down.moved = true; dragging = true; clearTimeout(longPress); }
    if (!down.moved) return;
    x = tx = clamp(event.clientX - down.ox, 8, width() - launcher.offsetWidth - 8);
    y = ty = clamp(event.clientY - down.oy, 70, height() - launcher.offsetHeight - 8);
    vx = vy = 0;
    write();
    if (isOpen()) placePanel();
  };
  const onPointerUp = (event) => {
    if (!down || down.id !== event.pointerId) return;
    clearTimeout(longPress);
    if (down.moved) {
      suppressClick = true;
      setPinned(true);
    }
    down = null;
    dragging = false;
  };
  const onClickCapture = (event) => {
    if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopPropagation(); return; }
    if (pinned) { event.preventDefault(); event.stopPropagation(); setPinned(false); }
  };
  const onPinEvent = (event) => setPinned(typeof event.detail === 'boolean' ? event.detail : !pinned);
  const onActivity = () => { wake(); };
  const onRoute = () => { wake(); if (!pinned) pick(); };
  try {
    const saved = JSON.parse(sessionStorage.getItem('shivam-robot-position') || 'null');
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
      x = clamp(saved.x, 8, width() - launcher.offsetWidth - 8);
      y = clamp(saved.y, 70, height() - launcher.offsetHeight - 8);
      tx = x; ty = y;
      pinned = Boolean(saved.pinned);
    }
  } catch { /* Use the default safe position. */ }
  write();
  launcher.dataset.pinned = String(pinned);
  launcher.style.visibility = 'visible';
  launcher.tabIndex = 0;
  launcher.dataset.state = pinned ? 'pinned' : 'roaming';
  launcher.dataset.sleeping = 'false';
  idleTimer = window.setTimeout(sleep, 30000);
  roamTimer = window.setInterval(pick, 3800);
  const loop = (time) => {
    if (disposed) return;
    frame = requestAnimationFrame(loop);
    if (document.hidden || preference.matches || document.documentElement.dataset.motion === 'paused' || isOpen() || document.querySelector('dialog[open]') || pinned || sleeping) return;
    const dt = Math.min(.04, (time - last) / 1000 || .016);
    last = time;
    if (!dragging) {
      vx += ((tx - x) * 14 - vx * 5.2) * dt;
      vy += ((ty - y) * 14 - vy * 5.2) * dt;
      x += vx * dt;
      y += vy * dt;
    }
    write();
    if (Math.hypot(tx - x, ty - y) < 1.5) launcher.dataset.state = 'idle';
  };
  frame = requestAnimationFrame(loop);
  const resize = () => {
    x = clamp(x, 8, width() - launcher.offsetWidth - 8);
    y = clamp(y, 70, height() - launcher.offsetHeight - 8);
    tx = clamp(tx, 8, width() - launcher.offsetWidth - 8);
    ty = clamp(ty, 70, height() - launcher.offsetHeight - 8);
    write();
    if (isOpen()) placePanel();
    save();
  };
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('site:motion', onActivity);
  window.addEventListener('site:robot-pin', onPinEvent);
  window.addEventListener('site:route', onRoute);
  window.addEventListener('site:assistant-open', placePanel);
  launcher.addEventListener('pointerdown', onPointerDown);
  launcher.addEventListener('pointermove', onPointerMove);
  launcher.addEventListener('pointerup', onPointerUp);
  launcher.addEventListener('pointercancel', onPointerUp);
  launcher.addEventListener('click', onClickCapture, true);
  window.addEventListener('pointermove', onActivity, { passive: true });
  window.addEventListener('keydown', onActivity);
  window.addEventListener('scroll', onActivity, { passive: true });
  document.addEventListener('visibilitychange', onActivity);
  preference.addEventListener('change', onActivity);
  // The demo's spring loop moves in both axes and keeps the robot inside the viewport.
  return () => {
    disposed = true;
    clearInterval(roamTimer);
    clearTimeout(idleTimer);
    clearTimeout(longPress);
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    window.visualViewport?.removeEventListener('resize', resize);
    window.removeEventListener('site:motion', onActivity);
    window.removeEventListener('site:robot-pin', onPinEvent);
    window.removeEventListener('site:route', onRoute);
    window.removeEventListener('site:assistant-open', placePanel);
    launcher.removeEventListener('pointerdown', onPointerDown);
    launcher.removeEventListener('pointermove', onPointerMove);
    launcher.removeEventListener('pointerup', onPointerUp);
    launcher.removeEventListener('pointercancel', onPointerUp);
    launcher.removeEventListener('click', onClickCapture, true);
    window.removeEventListener('pointermove', onActivity);
    window.removeEventListener('keydown', onActivity);
    window.removeEventListener('scroll', onActivity);
    document.removeEventListener('visibilitychange', onActivity);
    preference.removeEventListener('change', onActivity);
  };
}
