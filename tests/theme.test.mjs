import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/theme.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports });

function initialise({ stored, dark = false, blocked = false, motion } = {}) {
  const root = { style: {}, dataset: {}, classList: { toggle(name, enabled) { root[name] = enabled; } } };
  vm.runInNewContext(exports.themeInitialiser, {
    document: { documentElement: root },
    matchMedia: () => ({ matches: dark }),
    localStorage: { getItem(key) { if (blocked) throw new Error('Storage denied'); return key === 'shivam-motion' ? motion : stored; } },
  });
  return root;
}

test('the first paint follows the system when there is no saved choice', () => {
  assert.equal(initialise({ dark: true }).style.colorScheme, 'dark');
  assert.equal(initialise({ dark: false }).style.colorScheme, 'light');
});
test('saved choices override the system', () => {
  assert.equal(initialise({ stored: 'light', dark: true }).dark, false);
  assert.equal(initialise({ stored: 'dark', dark: false }).dark, true);
});
test('blocked localStorage still permits the correct system theme', () => {
  assert.equal(initialise({ blocked: true, dark: true }).style.colorScheme, 'dark');
  assert.equal(initialise({ blocked: true, dark: false }).style.colorScheme, 'light');
});
test('invalid stored values fall back to system preferences', () => {
  assert.equal(initialise({ stored: 'unexpected', dark: true }).dark, true);
});
test('a paused-motion choice is applied before the first paint', () => {
  assert.equal(initialise({ motion: 'paused' }).dataset.motion, 'paused');
  assert.equal(initialise({ motion: 'auto' }).dataset.motion, 'auto');
});
