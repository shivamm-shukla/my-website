import test from 'node:test';
import assert from 'node:assert/strict';
import { companionHome, nextRoamPosition, pickRoamTarget, attachRoaming } from '../lib/robot/motion.mjs';

test('wide screens give the companion a permanent position outside the content', () => {
  assert.deepEqual(companionHome({ width: 1440, height: 900, size: { width: 76, height: 92 } }), { x: 1352, y: 784 });
});

test('phones place the small companion at the safe lower edge, away from the top navigation', () => {
  const point = companionHome({ width: 390, height: 844, size: { width: 46, height: 56 }, safeBottom: 0 });
  assert.deepEqual(point, { x: 332, y: 764 });
  assert.ok(point.y > 70);
});

test('short windows keep the complete robot on screen', () => {
  const point = companionHome({ width: 1440, height: 140, size: { width: 76, height: 92 } });
  assert.ok(point.y >= 0 && point.y + 92 <= 140);
  const next = nextRoamPosition({ home: point, current: point, random: () => 0 });
  assert.ok(next.y >= 0 && next.y + 92 <= 140);
});

test('roaming targets stay inside the viewport across 1,600 layouts', () => {
  let state = 7;
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const width of [1100, 1152, 1280, 1366, 1440, 1800, 1920, 2560]) {
    for (let index = 0; index < 200; index++) {
      const height = 240 + random() * 1200;
      const home = companionHome({ width, height, size: { width: 76, height: 92 } });
      const point = pickRoamTarget({ width, height, size: { width: 76, height: 92 }, random });
      assert.ok(point.x >= 8 && point.x + 76 <= width - 8);
      assert.ok(point.y >= 70 && point.y + 92 <= Math.max(70, height - 8));
    }
  }
});

test('roaming selects new horizontal and vertical targets; reading routes stay near the right edge', () => {
  const size = { width: 46, height: 56 };
  const first = pickRoamTarget({ width: 390, height: 844, size, random: () => .2 });
  const second = pickRoamTarget({ width: 390, height: 844, size, random: () => .8 });
  assert.notEqual(first.x, second.x);
  assert.notEqual(first.y, second.y);
  const article = pickRoamTarget({ width: 390, height: 844, size, pathname: '/blog/notes', random: () => .5 });
  assert.equal(article.x, 334);
});

function fixture() {
  const names = ['window', 'document', 'matchMedia', 'requestAnimationFrame', 'cancelAnimationFrame', 'clearTimeout', 'clearInterval'];
  const saved = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const env = { modal: false, timers: new Map(), nextTimer: 0, interval: null, raf: null };
  const win = new EventTarget();
  const doc = new EventTarget();
  const pref = new EventTarget();
  pref.matches = false;
  win.innerHeight = 900;
  win.innerWidth = 1440;
  win.visualViewport = Object.assign(new EventTarget(), { height: 900 });
  win.setTimeout = callback => { const id = ++env.nextTimer; env.timers.set(id, callback); return id; };
  win.setInterval = callback => { env.interval = callback; return ++env.nextTimer; };
  win.location = { pathname: '/' };
  doc.hidden = false;
  doc.documentElement = { clientWidth: 1440, dataset: { motion: 'auto' } };
  doc.body = {};
  doc.querySelector = selector => selector === 'dialog[open]' && env.modal ? {} : null;
  const launcher = Object.assign(new EventTarget(), {
    style: { setProperty(key, value) { this[key] = value; } }, dataset: {}, offsetWidth: 76, offsetHeight: 92, tabIndex: 0,
    matches: () => false,
    setPointerCapture() {},
  });
  const globals = {
    window: win, document: doc, matchMedia: () => pref,
    requestAnimationFrame: callback => { env.raf = callback; return ++env.nextTimer; },
    cancelAnimationFrame: () => {},
    clearTimeout: id => env.timers.delete(id),
    clearInterval: () => { env.interval = null; },
  };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const dispose = attachRoaming(launcher, { isOpen: () => env.modal });
  return {
    env, win, doc, pref, launcher,
    roam() { env.interval?.(); },
    tick(time) {
      const callback = env.raf;
      env.raf = null;
      callback?.(time);
    },
    restore() {
      dispose();
      for (const name of names) {
        const descriptor = saved.get(name);
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
    },
  };
}

test('the spring loop moves the robot across both axes', () => {
  const f = fixture();
  try {
    const initial = f.launcher.style.transform;
    const random = Math.random;
    Math.random = () => .5;
    f.roam();
    for (let i = 1; i <= 60; i++) f.tick(i * 16);
    Math.random = random;
    const moved = f.launcher.style.transform.match(/translate3d\(([-\d.]+)px,([-\d.]+)px/);
    const start = initial.match(/translate3d\(([-\d.]+)px,([-\d.]+)px/);
    assert.notEqual(moved[1], start[1]);
    assert.notEqual(moved[2], start[2]);
    assert.equal(f.launcher.style.visibility, 'visible');
    assert.equal(f.launcher.tabIndex, 0);
  } finally { f.restore(); }
});

test('opening chat pauses travel without moving the launcher', () => {
  const f = fixture();
  try {
    f.roam();
    f.tick(16);
    const transform = f.launcher.style.transform;
    f.env.modal = true;
    f.tick(32);
    assert.equal(f.launcher.style.visibility, 'visible');
    assert.equal(f.launcher.style.transform, transform);
  } finally { f.restore(); }
});

test('reduced motion and hidden tabs keep the robot still', () => {
  const f = fixture();
  try {
    f.roam();
    f.pref.matches = true;
    const transform = f.launcher.style.transform;
    f.tick(16);
    assert.equal(f.launcher.style.transform, transform);
    f.pref.matches = false;
    f.doc.hidden = true;
    f.tick(32);
    assert.equal(f.launcher.style.transform, transform);
  } finally { f.restore(); }
});

test('dragging pins the robot at the pointer and prevents the button click from opening chat', () => {
  const f = fixture();
  const pointer = (type, values) => Object.assign(new Event(type), values);
  try {
    f.launcher.dispatchEvent(pointer('pointerdown', { button: 0, pointerId: 3, pointerType: 'mouse', clientX: 1380, clientY: 800 }));
    f.launcher.dispatchEvent(pointer('pointermove', { pointerId: 3, pointerType: 'mouse', clientX: 1000, clientY: 500 }));
    f.launcher.dispatchEvent(pointer('pointerup', { pointerId: 3, pointerType: 'mouse', clientX: 1000, clientY: 500 }));
    assert.equal(f.launcher.dataset.pinned, 'true');
    assert.equal(f.launcher.dataset.state, 'pinned');
    assert.equal(f.launcher.style.transform, 'translate3d(950px,380px,0)');
  } finally { f.restore(); }
});
