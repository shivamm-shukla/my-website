/* Export the actual Home components into a self-contained design review file. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {fileName: filename, compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}});
    module._compile(result.outputText, filename);
  };
}

async function run() {
  const React = require('react');
  const {renderToStaticMarkup} = require('react-dom/server');
  const {ThemeProvider} = require('../components/theme-provider.tsx');
  const {SiteHeader} = require('../components/layout/site-header.tsx');
  const {SiteFooter} = require('../components/layout/site-footer.tsx');
  const Home = require('../app/page.tsx').default;
  const {getSiteContent} = require('../lib/content/repository.ts');
  const {themeInitialiser} = require('../lib/theme.ts');
  const {quickAnswers} = require('../content/assistant.ts');
  const content = await getSiteContent();
  const tree = React.createElement(ThemeProvider, null,
    React.createElement('a', {href:'#main-content', className:'skip-link'}, 'Skip to content'),
    React.createElement(SiteHeader, {name:content.profile.name, navigation:content.navigation, allPages:content.footerNavigation}),
    await Home(),
    React.createElement(SiteFooter, {content, preview:true})
  );
  const markup = renderToStaticMarkup(tree).replace(/href="\/#/g, 'href="#');
  const postcss = require('postcss');
  const tailwind = require('tailwindcss');
  const sourceCss = fs.readFileSync(path.join(root,'app/globals.css'),'utf8') + '\n' + fs.readFileSync(path.join(root,'app/design.css'),'utf8');
  const embeddedCss = sourceCss.replace(/url\("\/fonts\/([^"\)]+)"\)/g, (_,name) => 'url("data:font/woff2;base64,'+fs.readFileSync(path.join(root,'public/fonts',name)).toString('base64')+'")');
  const result = await postcss([tailwind({content:[{raw:markup, extension:'html'}], darkMode:'class', theme:{extend:{}}, plugins:[]})]).process(embeddedCss, {from:path.join(root,'app/globals.css')});
  const interaction = `
  const guideAnswers=${JSON.stringify(quickAnswers).replace(/</g,'\\u003c')};
  const themeButton=document.querySelector('.theme-toggle');
  function syncThemeLabel(){themeButton?.setAttribute('aria-label',document.documentElement.classList.contains('dark')?'Switch to light theme':'Switch to dark theme')}
  syncThemeLabel();
  themeButton?.addEventListener('click',()=>{const dark=document.documentElement.classList.toggle('dark');document.documentElement.style.colorScheme=dark?'dark':'light';try{localStorage.setItem('shivam-theme',dark?'dark':'light')}catch{}syncThemeLabel()});
  const menu=document.querySelector('.mobile-nav-dialog');
  const command=document.querySelector('.command-dialog');
  const launchers=new WeakMap();
  function openDialog(dialog,launcher){if(!dialog||dialog.open)return;launchers.set(dialog,launcher||document.activeElement);dialog.showModal();document.body.style.overflow='hidden';dialog.querySelector('input')?.focus()}
  function closeDialog(dialog){dialog.close();document.body.style.overflow='';launchers.get(dialog)?.focus()}
  document.querySelector('.mobile-menu-trigger')?.addEventListener('click',e=>openDialog(menu,e.currentTarget));
  document.querySelector('.command-trigger')?.addEventListener('click',e=>openDialog(command,e.currentTarget));
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-heading button')?.addEventListener('click',()=>closeDialog(dialog));dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog(dialog)});dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog(dialog)});dialog.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeDialog(dialog)))});
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();command.open?closeDialog(command):openDialog(command)}});
  document.querySelector('.command-search input')?.addEventListener('input',e=>{document.querySelectorAll('.command-results li').forEach(li=>li.hidden=!li.textContent.toLowerCase().includes(e.target.value.toLowerCase()))});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="/"]');if(!a)return;e.preventDefault();const href=a.getAttribute('href');if(href.startsWith('/#')){document.querySelector(href.slice(1))?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});return}if(href==='/'){window.scrollTo({top:0,behavior:'smooth'});return}document.querySelector('#route-preview-title').textContent=a.getAttribute('aria-label')||a.textContent.trim()||'Coming next';openDialog(document.querySelector('#route-preview'),a)});
  document.querySelectorAll('[data-open-assistant]').forEach(button=>button.addEventListener('click',()=>openDialog(document.querySelector('#guide-preview'),button)));
  document.querySelectorAll('[data-guide-answer]').forEach(button=>button.addEventListener('click',()=>{const answer=guideAnswers[Number(button.dataset.guideAnswer)];const region=document.querySelector('#guide-preview-answer');region.hidden=false;region.querySelector('p').textContent=answer.answer;const link=region.querySelector('a');link.textContent=answer.link;link.setAttribute('href',answer.href);link.onclick=()=>closeDialog(document.querySelector('#guide-preview'))}));
  document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('tab-hidden',document.hidden));
  `;
  const extra = '<dialog id="route-preview" class="dialog" aria-labelledby="route-preview-title"><div class="dialog-surface"><div class="dialog-heading"><h2 id="route-preview-title">Coming next</h2><button type="button" class="icon-button" aria-label="Close preview">×</button></div><p style="font-size:14px;color:var(--muted);line-height:1.8">This file previews the Home design. Full pages, admin editing, and live AI are later build phases. Sample writing is labelled.</p></div></dialog>';
  const guide = '<dialog id="guide-preview" class="dialog assistant-dialog" aria-labelledby="guide-preview-title"><div class="dialog-surface"><div class="dialog-heading"><h2 id="guide-preview-title">Shivam’s little sidekick</h2><button class="icon-button" type="button" aria-label="Close sidekick">×</button></div><p style="font-size:14px;color:var(--muted)">A quick guide to the person behind the pixels.</p><div class="assistant-choices">'+quickAnswers.map((answer,index)=>'<button type="button" data-guide-answer="'+index+'">'+answer.question+'</button>').join('')+'</div><div id="guide-preview-answer" class="assistant-answer" role="status" hidden><p></p><div class="assistant-links"><a href="#work"></a></div></div><p class="assistant-privacy">Quick answers from Shivam’s profile. Live AI chat comes in a later phase. This preview sends and saves no messages.</p></div></dialog>';
  const encodedCore = fs.readFileSync(path.join(root,'node_modules/three/build/three.core.min.js')).toString('base64');
  const encodedThree = fs.readFileSync(path.join(root,'node_modules/three/build/three.module.min.js')).toString('base64');
  const encodedScene = fs.readFileSync(path.join(root,'lib/robot/create-scene.mjs')).toString('base64');
  const sceneScript = `
    const blob=(source)=>URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    let factory;
    async function load(){if(!factory){factory=(async()=>{const core=blob(atob('${encodedCore}'));const three=blob(atob('${encodedThree}').replaceAll('./three.core.min.js',core));const scene=blob(atob('${encodedScene}').replace("from 'three'","from '"+three+"'"));return import(scene)})()}return factory}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);setTimeout(async()=>{try{const {createRobotScene}=await load();createRobotScene(entry.target,{pose:entry.target.dataset.pose,follow:entry.target.dataset.follow==='true'})}catch{}} ,500)}),{rootMargin:'80px'});
    document.querySelectorAll('[data-robot3d]').forEach(host=>observer.observe(host));
  `;
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Shivam Shukla — Home design preview</title><script>'+themeInitialiser+'</script><style>'+result.css+'</style></head><body id="top">'+markup+extra+guide+'<script>'+interaction+'</script><script type="module">'+sceneScript+'</script></body></html>';
  const output = path.join(root,'docs/preview/home.html');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,html);
  console.log('Created '+output+' ('+Math.round(Buffer.byteLength(html)/1024)+' KiB, self-contained).');
}
run().catch(error=>{console.error(error);process.exit(1)});
