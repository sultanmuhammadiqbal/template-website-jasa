import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { renderSite } from './render-site.mjs';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const css = await readFile(new URL('styles.css', root), 'utf8');
const config = JSON.parse(await readFile(new URL('config/site.json', root), 'utf8'));
const variant = structuredClone(config);
variant.brand.name = 'Studio Arunika';
variant.brand.mark = 'SA';
variant.brand.title = 'Studio Arunika — Desain';
variant.brand.tagline = 'Ruang nyaman, pengalaman baru.';
variant.services.heading = 'Solusi yang sesuai kebutuhan.';
variant.services.items = [{ title:'Konsultasi', description:'Diskusi awal kebutuhan desain.', tag:'Tahap pertama' }];
variant.portfolio.items = [{ title:'Rumah Arunika', category:'Rumah · Demo', description:'Ide hunian hangat.', art:'residence', artAlt:'Ilustrasi abstrak rumah', featured:true, caseStudy:true }];
variant.caseStudy.name = 'Rumah Arunika';
variant.faq.items = [{ question:'Apakah bisa konsultasi?', answer:'Silakan menghubungi kami.' }];
variant.theme.dark = '#1d3040';
variant.theme.accent = '#e0f085';
variant.theme.servicesBackground = '#edf0e9';
variant.theme.faqBackground = '#e4ece7';
variant.labels.heroPrimary = 'Hubungi studio';
variant.labels.portfolioPending = 'Segera hadir';
const render = renderSite(html, css, variant);
const browser = await chromium.launch({ headless:true });
await mkdir(new URL('../artifacts/screenshots/', import.meta.url),{recursive:true});
try {
  for(const width of [375,1024]) {
    const ctx = await browser.newContext({ viewport:{width,height:900}, reducedMotion:'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', error=>errors.push(error.message));
    await page.route('http://127.0.0.1:4173/', route=>route.fulfill({ status:200, contentType:'text/html; charset=utf-8', body:render.html }));
    await page.route('**/styles.css', route=>route.fulfill({ status:200, contentType:'text/css; charset=utf-8', body:render.css }));
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});
    const actual = await page.evaluate(()=>({
      title:document.querySelector('#hero-title')?.textContent,
      cards:document.querySelectorAll('.service-card').length,
      projects:document.querySelectorAll('.project-card').length,
      faq:document.querySelectorAll('.faq-item').length,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      imageLoaded:document.querySelector('.hero-image')?.naturalWidth>0
    }));
    assert.equal(actual.title,'Studio Arunika');
    assert.equal(actual.cards,1);
    assert.equal(actual.projects,1);
    assert.equal(actual.faq,1);
    assert.ok(actual.overflow<=2,'Horizontal overflow: '+width);
    assert.ok(actual.imageLoaded,'Hero image missing');
    assert.deepEqual(errors,[]);
    assert.ok(await page.getByText('Hubungi studio').isVisible());
    const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    const violations=report.violations.map(v=>v.id+': '+v.nodes.map(n=>n.target.join(',')).join('; '));
    assert.deepEqual(violations,[],'Alternative palette WCAG issues at '+width);
    await page.screenshot({path:new URL('../artifacts/screenshots/custom-'+width+'.png',import.meta.url).pathname,fullPage:true,animations:'disabled'});
    console.log('PASS alternative configuration '+width+'px: responsive, content, runtime and axe WCAG');
    await ctx.close();
  }
} finally {await browser.close();}
