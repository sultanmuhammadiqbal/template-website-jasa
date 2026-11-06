import assert from 'node:assert/strict';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = new URL('../artifacts/arunika-dist/', import.meta.url);
await stat(new URL('index.html', root));
await mkdir(new URL('../artifacts/screenshots/',import.meta.url),{recursive:true});
const contentTypes={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp'};
const browser=await chromium.launch({headless:true});
try {
  for(const width of [375,1024]) {
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    await page.route('http://127.0.0.1:4173/**',async route=>{
      const raw=new URL(route.request().url()).pathname;
      const path=raw==='/'?'index.html':decodeURIComponent(raw).replace(/^\/+/,'');
      if(path.split('/').some(part=>part==='..'||part==='.')){
        await route.fulfill({status:403,body:'Forbidden'});return;
      }
      try {
        const buf=await readFile(new URL(path,root));
        await route.fulfill({status:200,body:buf,contentType:contentTypes[extname(path)]||'application/octet-stream'});
      } catch {
        await route.fulfill({status:404,body:'Not found'});
      }
    });
    const response=await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});
    assert.equal(response.status(),200);
    const actual=await page.evaluate(()=>({
      title:document.querySelector('#hero-title')?.textContent,
      projects:[...document.querySelectorAll('.project-card h3')].map(x=>x.textContent.trim()),
      services:document.querySelectorAll('.service-card').length,
      faqs:document.querySelectorAll('.faq-item').length,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      imageLoaded:document.querySelector('.hero-image')?.naturalWidth>0,
      meta:document.querySelector('meta[name="robots"]')?.content,
      linkedProject:document.querySelector('.project-featured h3')?.textContent.trim()
    }));
    assert.equal(actual.title,'Studio Arunika');
    assert.deepEqual(actual.projects,['Rumah Arunika','Kedai Pagi']);
    assert.equal(actual.services,2);
    assert.equal(actual.faqs,2);
    assert.equal(actual.linkedProject,'Rumah Arunika');
    assert.ok(actual.overflow<=2,'Horizontal overflow at '+width);
    assert.ok(actual.imageLoaded,'Hero failed to load from the actual buyer ZIP build');
    assert.equal(actual.meta,'noindex, nofollow');
    assert.deepEqual(errors,[]);
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    assert.deepEqual(audit.violations.map(v=>({id:v.id,target:v.nodes.map(n=>n.target)})),[],'Arunika WCAG violations at '+width);
    await page.screenshot({path:new URL('../artifacts/screenshots/arunika-'+width+'.png',import.meta.url).pathname,fullPage:true,animations:'disabled'});
    console.log('PASS Studio Arunika buyer ZIP build '+width+'px: hero, responsive, exact content, noindex, axe/WCAG 0 violations');
    await context.close();
  }
} finally {
  await browser.close();
}
