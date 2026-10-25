/* Portable review of the actual Home components; no server or network required. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
const moduleLoad = Module._load;
Module._resolveFilename = function (request, parent, ...rest) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
Module._load = function (request, ...rest) {
  if (request === 'next/navigation') return { usePathname: () => '/' };
  if (request === 'next/image') return function PortableImage({ src, onError, sizes, ...props }) {
    const file = typeof src === 'string' && src.startsWith('/images/') ? path.join(root, 'public', src) : null;
    if (!file || !fs.existsSync(file)) return null;
    const extension = path.extname(file).slice(1);
    const mime = extension === 'jpg' ? 'jpeg' : extension;
    return require('react').createElement('img', { ...props, src: 'data:image/' + mime + ';base64,' + fs.readFileSync(file).toString('base64') });
  };
  return moduleLoad.call(this, request, ...rest);
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    module._compile(result.outputText, filename);
  };
}
const safeJSON = value => JSON.stringify(value).replace(/</g, '\\u003c');
async function run() {
  process.env.NEXT_PUBLIC_SITE_MODE = 'preview';
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { ThemeProvider } = require('../components/theme-provider.tsx');
  const { SiteHeader } = require('../components/layout/site-header.tsx');
  const { SiteFooter } = require('../components/layout/site-footer.tsx');
  const AssistantWidget = require('../components/robot/assistant-widget.tsx').default;
  const Home = require('../app/page.tsx').default;
  const { getSiteContent } = require('../lib/content/repository.ts');
  const { themeInitialiser } = require('../lib/theme.ts');
  const { quickAnswers } = require('../content/assistant.ts');
  const content = await getSiteContent();
  const markup = renderToStaticMarkup(React.createElement(ThemeProvider, null,
    React.createElement('a', { href: '#main-content', className: 'skip-link' }, 'Skip to content'),
    React.createElement(SiteHeader, { name: content.profile.name, navigation: content.navigation, allPages: content.footerNavigation }),
    await Home(),
    React.createElement(SiteFooter, { content, preview: true }),
    React.createElement(AssistantWidget)
  )).replace(/href="\/#/g, 'href="#');
  const stylesheets = ['tokens.css', 'globals.css', 'design.css', 'project-art.css', 'interactions.css'];
  const css = stylesheets.map(name => fs.readFileSync(path.join(root, 'app', name), 'utf8')).join('\n')
    .replace(/url\("\/fonts\/([^")]+)"\)/g, (_, name) => 'url("data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'public/fonts', name)).toString('base64') + '")');
  const result = await require('postcss')([require('tailwindcss')({
    content: [{ raw: markup, extension: 'html' }], darkMode: 'class', theme: { extend: {} }, plugins: [],
  })]).process(css, { from: path.join(root, 'app/globals.css') });
  const motionModule = fs.readFileSync(path.join(root, 'lib/robot/motion.mjs'), 'utf8');
  const interactions = fs.readFileSync(path.join(root, 'scripts/preview-runtime.js'), 'utf8');
  const extra = '<dialog id="route-preview" class="dialog" aria-labelledby="route-preview-title"><div class="dialog-surface"><div class="dialog-heading"><h2 id="route-preview-title">Coming next</h2><button type="button" class="icon-button" aria-label="Close page preview">×</button></div><p>This is the Home design preview. The full About, Work, Contact, Resume, and writing pages come in the next phases. Your place on Home is saved when you close this panel.</p></div></dialog>';
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>Shivam Shukla — Home design preview</title><script>' + themeInitialiser + '</script><style>' + result.css + '</style></head><body id="top">' + markup + extra + '<script type="application/json" id="preview-data">' + safeJSON({ guideAnswers: quickAnswers }) + '</script><script type="module">' + motionModule + '\n' + interactions + '</script></body></html>';
  const output = path.join(root, 'docs/preview/home.html');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html);
  console.log('Created ' + output + ' (' + Math.round(Buffer.byteLength(html) / 1024) + ' KiB, self-contained).');
}
run().catch(error => { console.error(error); process.exit(1); });
