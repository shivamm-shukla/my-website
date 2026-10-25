/* Embedded by export-preview.cjs after the shared robot module. */
const { guideAnswers } = JSON.parse(document.querySelector('#preview-data').textContent);
const themeButton = document.querySelector('.theme-toggle');
const guide = document.querySelector('.assistant-dialog');
const menu = document.querySelector('.mobile-nav-dialog');
const command = document.querySelector('.command-dialog');
const launcher = document.querySelector('.assistant-launcher');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const appearancePreference = matchMedia('(prefers-color-scheme: dark)');
const openers = new WeakMap();
const eyeDisposers = new Map();
let bubbleTimer;

function wireEyes(root = document) {
  root.querySelectorAll('.robot-art').forEach(svg => {
    if (!eyeDisposers.has(svg)) eyeDisposers.set(svg, attachEyes(svg));
  });
}
function showBubble(text) {
  document.querySelector('.assistant-bubble')?.remove();
  launcher.removeAttribute('aria-describedby');
  if (!text || guide.open) return;
  const bubble = document.createElement('span');
  bubble.id = 'portable-robot-bubble';
  bubble.className = 'assistant-bubble';
  bubble.setAttribute('role', 'tooltip');
  bubble.textContent = text;
  launcher.append(bubble);
  launcher.setAttribute('aria-describedby', bubble.id);
}
function syncThemeLabel() {
  themeButton?.setAttribute('aria-label', document.documentElement.classList.contains('dark') ? 'Switch to light theme' : 'Switch to dark theme');
}
function setTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  syncThemeLabel();
}
syncThemeLabel();
themeButton?.addEventListener('click', () => {
  const dark = !document.documentElement.classList.contains('dark');
  if (motionAllowed() && document.startViewTransition) document.startViewTransition(() => setTheme(dark));
  else setTheme(dark);
  try { localStorage.setItem('shivam-theme', dark ? 'dark' : 'light'); } catch {}
  clearTimeout(bubbleTimer);
  showBubble(dark ? 'Raat ho gayi. ✨' : 'Subah ho gayi. Hello, sunshine!');
  bubbleTimer = setTimeout(() => showBubble(null), 3200);
});
appearancePreference.addEventListener('change', event => {
  let saved;
  try { saved = localStorage.getItem('shivam-theme'); } catch {}
  if (saved !== 'dark' && saved !== 'light') setTheme(event.matches);
});
function syncMotion() {
  const system = motionPreference.matches;
  const paused = document.documentElement.dataset.motion === 'paused';
  document.querySelectorAll('[data-motion-toggle]').forEach(button => {
    button.disabled = system;
    button.setAttribute('aria-pressed', String(system || paused));
    button.setAttribute('aria-label', system ? 'Animations paused by your system setting' : paused ? 'Resume animations' : 'Pause animations');
    button.querySelector('span').textContent = system || paused ? 'Motion off' : 'Pause motion';
  });
}
document.querySelectorAll('[data-motion-toggle]').forEach(button => button.addEventListener('click', () => {
  const next = document.documentElement.dataset.motion === 'paused' ? 'auto' : 'paused';
  document.documentElement.dataset.motion = next;
  try { localStorage.setItem('shivam-motion', next); } catch {}
  window.dispatchEvent(new Event('site:motion'));
}));
window.addEventListener('site:motion', syncMotion);
motionPreference.addEventListener('change', syncMotion);
window.addEventListener('storage', event => {
  if (event.key === 'shivam-theme') setTheme(event.newValue === 'dark' || (event.newValue !== 'light' && appearancePreference.matches));
  if (event.key === 'shivam-motion') {
    document.documentElement.dataset.motion = event.newValue === 'paused' ? 'paused' : 'auto';
    window.dispatchEvent(new Event('site:motion'));
  }
});
syncMotion();

function openDialog(dialog, opener) {
  if (!dialog || dialog.open) return;
  document.querySelectorAll('dialog[open]').forEach(closeDialog);
  openers.set(dialog, opener || document.activeElement);
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  dialog.querySelector('[data-dialog-autofocus]')?.focus({ preventScroll: true });
  if (dialog === guide) { showBubble(null); launcher.setAttribute('aria-expanded', 'true'); }
  if (dialog === menu) document.querySelector('.mobile-menu-trigger').setAttribute('aria-expanded', 'true');
}
function closeDialog(dialog) {
  dialog.close();
  document.body.style.overflow = '';
  if (dialog === guide) launcher.setAttribute('aria-expanded', 'false');
  if (dialog === menu) document.querySelector('.mobile-menu-trigger').setAttribute('aria-expanded', 'false');
  requestAnimationFrame(() => {
    const opener = openers.get(dialog);
    if (opener && getComputedStyle(opener).visibility !== 'hidden') opener.focus({ preventScroll: true });
    else launcher.focus({ preventScroll: true });
  });
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-heading button')?.addEventListener('click', () => closeDialog(dialog));
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(dialog); });
  dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeDialog(dialog)));
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
});
document.querySelector('.mobile-menu-trigger')?.addEventListener('click', event => openDialog(menu, event.currentTarget));
document.querySelector('.command-trigger')?.addEventListener('click', event => openDialog(command, event.currentTarget));
document.querySelectorAll('[data-open-assistant]').forEach(button => button.addEventListener('click', () => openDialog(guide, button)));
launcher.addEventListener('click', () => openDialog(guide, launcher));
launcher.addEventListener('pointerenter', () => showBubble('Psst. I can show you around.'));
launcher.addEventListener('focus', () => showBubble('Psst. I can show you around.'));
launcher.addEventListener('pointerleave', () => showBubble(null));
launcher.addEventListener('blur', () => showBubble(null));

document.querySelectorAll('.assistant-choices button').forEach((button, index) => button.addEventListener('click', () => {
  document.querySelectorAll('.assistant-choices button').forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
  const record = guideAnswers[index];
  const region = document.querySelector('.assistant-answer-region');
  const answer = document.createElement('div');
  answer.className = 'assistant-answer';
  const text = document.createElement('p');
  text.textContent = record.answer;
  const link = document.createElement('a');
  link.className = 'assistant-answer-link';
  link.textContent = record.link;
  link.href = record.href.startsWith('/#') ? record.href.slice(1) : record.href;
  link.addEventListener('click', () => closeDialog(guide));
  answer.append(text, link);
  region.replaceChildren(answer);
  answer.scrollIntoView({ block: 'nearest', behavior: 'instant' });
}));
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    if (document.querySelector('dialog[open]:not(.command-dialog)')) return;
    event.preventDefault();
    command.open ? closeDialog(command) : openDialog(command);
  }
});
const search = document.querySelector('.command-search input');
search?.addEventListener('input', event => {
  let matches = 0;
  document.querySelectorAll('.command-results li').forEach(item => {
    item.hidden = !item.textContent.toLowerCase().includes(event.target.value.trim().toLowerCase());
    if (!item.hidden) matches++;
  });
  let empty = document.querySelector('.command-empty');
  if (!empty) {
    empty = document.createElement('p');
    empty.className = 'command-empty';
    empty.textContent = 'No page by that name. Try “work” or “blog”.';
    document.querySelector('.command-results').after(empty);
  }
  empty.hidden = matches > 0;
});
search?.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') { event.preventDefault(); document.querySelector('.command-results li:not([hidden]) a')?.focus(); }
});
document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href^="/"]');
  if (!link) return;
  event.preventDefault();
  const href = link.getAttribute('href');
  if (href === '/') { window.scrollTo({ top: 0, behavior: motionAllowed() ? 'smooth' : 'instant' }); return; }
  document.querySelector('#route-preview-title').textContent = link.getAttribute('aria-label') || link.textContent.trim() || 'Coming next';
  openDialog(document.querySelector('#route-preview'), link);
});
document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('tab-hidden', document.hidden));
wireEyes();
attachRoaming(launcher, { isOpen: () => guide.open });
