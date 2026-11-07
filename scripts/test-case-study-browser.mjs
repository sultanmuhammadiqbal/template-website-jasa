import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const html = await readFile(new URL('../dist/case-study/index.html', import.meta.url),'utf8');
const css = await readFile(new URL('../dist/case-study/case-study.css', import.meta.url),'utf8');
assert.match(html,/name="robots" content="noindex,nofollow"/);
assert.match(html,/AI sebagai/);\nassert.match(html, /<link rel="icon" href="\.\.\/assets\/favicon\.svg" type="image\/svg\+xml">/);
assert.match(html,/hak aset/);
assert.match(html,/belum disetujui untuk dijual/i);
assert.match(html,/bukan screenshot aktual/);
assert.match(html, /class="hero-art" role="img" aria-label="Ilustrasi konseptual/);
assert.match(html, /Lighthouse Performance<br>homepage demo · CI/);
assert.match(html, /Lighthouse Accessibility<br>homepage demo · CI/);
assert.match(html, /bukan skor halaman studi kasus ini/);
const externalBlankLinks = [...html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)].map(match=>match[0]);
assert.ok(externalBlankLinks.length > 0);
for(const tag of externalBlankLinks) assert.match(tag,/rel="noopener noreferrer"/);

assert.match(html,/42302718353/);
assert.match(html,/manifest SHA-256/);
assert.ok(css.includes('@media'));
for(let n=1;n<=7;n++){
  const link='https://github.com/sultanmuhammadiqbal/template-website-jasa/pull/'+n;
  assert.ok(html.includes(link),'Missing historical evidence link for PR #'+n);
}
assert.equal((html.match(/class="milestone"/g)||[]).length,7);
assert.equal((html.match(/<h1\b/g)||[]).length,1);
const browser=await chromium.launch({headless:true});
await mkdir(new URL('../artifacts/screenshots/',import.meta.url),{recursive:true});
try{
  for(const width of [320,375,768,1280]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto('http://127.0.0.1:4173/case-study/',{waitUntil:'load'});
    assert.equal(response.status(),200);
    assert.equal(await page.title(),'Ruang Reka — Product Engineering Case Study');
    assert.equal(await page.locator('.milestone').count(),7);
    assert.equal(await page.locator('h1').count(),1);
    const heroArt=page.getByRole('img',{name:/Ilustrasi konseptual antarmuka website Ruang Reka/});
    assert.equal(await heroArt.count(),1,'Hero artwork must be a single accessible image');
    assert.equal(await page.getByRole('img',{name:/bukan screenshot aktual/}).count(),1);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,nofollow');
    const metrics=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      width:document.documentElement.clientWidth,
      brokenLinks:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.getAttribute('href')),
      loadedStyle:getComputedStyle(document.querySelector('.hero')).display,
      visibleHeading:document.querySelector('#hero-title').getBoundingClientRect().width>0
    }));
    assert.ok(metrics.overflow<=2,'Horizontal overflow at '+width+': '+JSON.stringify(metrics));
    assert.deepEqual(metrics.brokenLinks,[],'Broken in-page anchors');
    assert.equal(metrics.loadedStyle,'grid');
    assert.equal(metrics.visibleHeading,true);
    assert.deepEqual(errors,[]);
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'Case study axe violations at '+width);
    if(width===375 || width===1280){
      await page.screenshot({path:new URL('../artifacts/screenshots/case-study-'+width+'.png',import.meta.url).pathname,fullPage:true,animations:'disabled'});
    }
    await page.getByRole('link',{name:'Proses',exact:true}).click();
    assert.equal(new URL(page.url()).hash,'#approach');
    console.log('PASS case study '+width+'px: anchors, evidence, layout, script-free, axe WCAG 0');
    await context.close();
  }
}finally{await browser.close();}
