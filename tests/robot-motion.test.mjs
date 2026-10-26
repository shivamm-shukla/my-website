import test from 'node:test';
import assert from 'node:assert/strict';
import { companionHome, nextRoamPosition, attachRoaming } from '../lib/robot/motion.mjs';

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

test('idle travel stays in the same spare margin across 1,600 layouts', () => {
  let state = 7;
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const width of [1100, 1152, 1280, 1366, 1440, 1800, 1920, 2560]) {
    for (let index = 0; index < 200; index++) {
      const height = 240 + random() * 1200;
      const home = companionHome({ width, height, size: { width: 76, height: 92 } });
      const point = nextRoamPosition({ home, current: home, random });
      const contentWidth = Math.min(width >= 1800 ? 1280 : 1200, width - 192);
      assert.ok(point.x > (width + contentWidth) / 2);
      assert.equal(point.x, home.x);
      assert.ok(point.y >= 0 && point.y + 92 <= height);
      assert.ok(home.y - point.y <= 180);
    }
  }
});

test('roaming selects a visibly different safe vertical position on narrow screens', () => {
  const home = companionHome({ width: 390, height: 844, size: { width: 46, height: 56 } });
  const next = nextRoamPosition({ home, current: home, random: () => 0 });
  assert.equal(next.x, home.x);
  assert.equal(next.y, home.y - 180);
});

function fixture() {
  const names = ['window', 'document', 'matchMedia', 'MutationObserver', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', 'clearTimeout'];
  const saved = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const env = { modal: false, timers: new Map(), nextTimer: 0, mutations: () => {} };
  const win = new EventTarget();
  const doc = new EventTarget();
  const pref = new EventTarget();
  pref.matches = false;
  win.innerHeight = 900;
  win.innerWidth = 1440;
  win.visualViewport = Object.assign(new EventTarget(), { height: 900 });
  win.setTimeout = callback => { const id = ++env.nextTimer; env.timers.set(id, callback); return id; };
  doc.hidden = false;
  doc.documentElement = { clientWidth: 1440, dataset: { motion: 'auto' } };
  doc.body = {};
  doc.querySelector = selector => selector === 'dialog[open]' && env.modal ? {} : null;
  const launcher = Object.assign(new EventTarget(), {
    style: {}, dataset: {}, offsetWidth: 76, offsetHeight: 92, tabIndex: 0,
    matches: () => false,
    setPointerCapture() {},
    getBoundingClientRect() {
      const match = this.style.transform?.match(/translate3d\(([-\d.]+)px,([-\d.]+)px/);
      return { left: Number(match?.[1] || 0), top: Number(match?.[2] || 0) };
    },
    animate() {
      const animation = {
        playState: 'running', onfinish: null,
        pause() { this.playState = 'paused'; },
        play() { this.playState = 'running'; },
        cancel() { this.playState = 'idle'; },
      };
      env.animation = animation;
      return animation;
    },
  });
  const globals = {
    window: win, document: doc, matchMedia: () => pref,
    MutationObserver: class { constructor(callback) { env.mutations = callback; } observe() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: callback => { callback(); return 1; },
    cancelAnimationFrame: () => {},
    getComputedStyle: () => ({ getPropertyValue: () => '0' }),
    clearTimeout: id => env.timers.delete(id),
  };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const dispose = attachRoaming(launcher, { isOpen: () => env.modal });
  return {
    env, win, doc, launcher,
    startFlight() {
      const [id, callback] = env.timers.entries().next().value;
      env.timers.delete(id);
      callback();
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

test('scrolling never hides, relocates, or interrupts the companion', () => {
  const f = fixture();
  try {
    f.startFlight();
    const transform = f.launcher.style.transform;
    const animation = f.env.animation;
    for (let i = 0; i < 30; i++) {
      f.win.dispatchEvent(new Event('scroll'));
      f.doc.dispatchEvent(new Event('scroll'));
    }
    assert.equal(f.launcher.style.transform, transform);
    assert.equal(f.launcher.style.visibility, 'visible');
    assert.equal(f.launcher.tabIndex, 0);
    assert.equal(f.env.animation, animation);
    assert.equal(animation.playState, 'running');
  } finally { f.restore(); }
});

test('opening chat pauses the same flight and closing it resumes without hiding', () => {
  const f = fixture();
  try {
    f.startFlight();
    const animation = f.env.animation;
    const transform = f.launcher.style.transform;
    f.env.modal = true;
    f.env.mutations();
    assert.equal(animation.playState, 'paused');
    assert.equal(f.launcher.style.visibility, 'visible');
    assert.equal(f.launcher.style.transform, transform);
    f.env.modal = false;
    f.env.mutations();
    assert.equal(f.env.animation, animation);
    assert.equal(animation.playState, 'running');
  } finally { f.restore(); }
});

test('pausing motion preserves the visible position and the existing animation', () => {
  const f = fixture();
  try {
    f.startFlight();
    const animation = f.env.animation;
    f.doc.documentElement.dataset.motion = 'paused';
    f.win.dispatchEvent(new Event('site:motion'));
    assert.equal(animation.playState, 'paused');
    assert.equal(f.launcher.style.visibility, 'visible');
    f.doc.documentElement.dataset.motion = 'auto';
    f.win.dispatchEvent(new Event('site:motion'));
    assert.equal(f.env.animation, animation);
    assert.equal(animation.playState, 'running');
  } finally { f.restore(); }
});

test('hidden tabs pause movement and restore the same flight on return', () => {
  const f = fixture();
  try {
    f.startFlight();
    const animation = f.env.animation;
    f.doc.hidden = true;
    f.doc.dispatchEvent(new Event('visibilitychange'));
    assert.equal(animation.playState, 'paused');
    f.doc.hidden = false;
    f.doc.dispatchEvent(new Event('visibilitychange'));
    assert.equal(f.env.animation, animation);
    assert.equal(animation.playState, 'running');
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
    assert.equal(f.launcher.style.transform, 'translate3d(962px,454px,0)');
  } finally { f.restore(); }
});
