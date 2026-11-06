import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderSite } from './render-site.mjs';

const root = new URL('../', import.meta.url);
const sourceHTML = await readFile(new URL('index.html',root),'utf8');
const sourceCSS = await readFile(new URL('styles.css',root),'utf8');
const config = JSON.parse(await readFile(new URL('config/site.json',root),'utf8'));
const result = renderSite(sourceHTML,sourceCSS,config);

assert.match(result.html, /<h1[^>]*>Ruang Reka<\/h1>/);
assert.match(result.html, /Ruang yang dirancang untuk hidup\./);
assert.equal((result.html.match(/class="service-card"/g)||[]).length,3);
assert.equal((result.html.match(/class="project-card(?: project-featured)?"/g)||[]).length,3);
assert.equal((result.html.match(/<details class="faq-item">/g)||[]).length,4);
assert.match(result.html,/id="kontak"/);
assert.match(result.html,/aria-labelledby="faq-title"/);
assert.match(result.css,/--accent-configured:#d8f15f/);
assert.match(result.css,/--dark-configured:#262d26/);
assert.match(result.css,/background:\s*var\(--services-bg\)/);

const custom = structuredClone(config);
custom.brand.name='Studio Arunika';
custom.brand.mark='SA';
custom.brand.title='Studio Arunika — Interior';
custom.brand.tagline='Ruang baru untuk cerita baru.';
custom.services.items=[{title:'Konsultasi',description:'Untuk semua ruang.',tag:'Konsep'}];
custom.caseStudy.name='Studio Bunga';
custom.portfolio.items=[{title:'Studio Bunga',category:'Hunian · Konsep demo',description:'Ruang fleksibel.',art:'residence',artAlt:'Ilustrasi kamar sederhana',featured:true,caseStudy:true}];
custom.faq.items=[{question:'Apa kabar?',answer:'Baik.'}];
custom.theme.accent='#d4ee66';
custom.theme.dark='#112233';
custom.contact.heading='Mari mengobrol.';
const rendered=renderSite(sourceHTML,sourceCSS,custom);
assert.match(rendered.html,/<h1[^>]*>Studio Arunika<\/h1>/);
assert.match(rendered.html,/Ruang baru untuk cerita baru\./);
assert.match(rendered.html,/Mari mengobrol\./);
assert.equal((rendered.html.match(/class="service-card"/g)||[]).length,1);
assert.equal((rendered.html.match(/class="project-card(?: project-featured)?"/g)||[]).length,1);
assert.equal((rendered.html.match(/<details class="faq-item">/g)||[]).length,1);
assert.match(rendered.css,/--accent-configured:#d4ee66/);
assert.match(rendered.css,/--dark-configured:#112233/);
assert.doesNotMatch(rendered.html,/<h1[^>]*>Ruang Reka<\/h1>/);

const unsafe=structuredClone(custom);
unsafe.brand.name='<img src=x onerror=alert(1)>';
unsafe.faq.items[0].question='<script>alert(1)</script>';
const escaped=renderSite(sourceHTML,sourceCSS,unsafe);
assert.ok(escaped.html.includes('&lt;img src=x onerror=alert(1)&gt;'));
assert.ok(escaped.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
assert.ok(!escaped.html.includes('<script>alert(1)</script>'));
for(const [field,value] of [['accent','#bad'],['dark','red'],['white','url(https://bad.test)']]){
  const invalid=structuredClone(config);invalid.theme[field]=value;
  assert.throws(()=>renderSite(sourceHTML,sourceCSS,invalid),/Invalid color/);
}
const invalidArt=structuredClone(config);
invalidArt.portfolio.items[0].art='evil-string';
assert.throws(()=>renderSite(sourceHTML,sourceCSS,invalidArt),/portfolio.items\[0\].art/);

for(const special of ['Studio $& Baru',"Studio $' Baru",'Studio $'+'\x60'+' Baru']) {
  const changed=structuredClone(config);
  changed.brand.name=special;
  changed.brand.title=special;
  changed.brand.description=special;
  changed.brand.mark='ST';
  const output=renderSite(sourceHTML,sourceCSS,changed).html;
  const encoded=special.replaceAll('&','&amp;').replaceAll(String.fromCharCode(39),'&#39;');
  assert.ok(output.includes('<h1 class="hero-reveal" id="hero-title">'+encoded+'</h1>'));
  assert.ok(output.includes('content="'+encoded+'"'));
  assert.ok(output.includes('aria-label="'+encoded+', kembali ke beranda"'));
}
const badContrast=structuredClone(config);
badContrast.theme.ink=badContrast.theme.paper;
assert.throws(()=>renderSite(sourceHTML,sourceCSS,badContrast),/WCAG contrast/);
for(const [mutate,expected] of [
  [d=>{delete d.services.items[0].title},/services.items\[0\].title/],
  [d=>{d.faq.items[0].answer=14},/faq.items\[0\].answer/],
  [d=>{d.portfolio.items[0].featured='yes'},/portfolio.items\[0\].featured/],
  [d=>{d.caseStudy.name='Unrelated'},/caseStudy.name/],
  [d=>{d.labels.heroPrimary=null},/labels.heroPrimary/]
]) {
  const d=structuredClone(config);mutate(d);assert.throws(()=>renderSite(sourceHTML,sourceCSS,d),expected);
}
const labels=structuredClone(config);
labels.labels.heroPrimary='Jadwalkan diskusi';
labels.labels.portfolioPending='Segera hadir';
labels.labels.contactPanelTitle='Hubungi tim';
const labeled=renderSite(sourceHTML,sourceCSS,labels).html;
for(const value of ['Jadwalkan diskusi','Segera hadir','Hubungi tim'])assert.ok(labeled.includes(value));
console.log('PASS A1: default render, brand/content/theme overrides, variable card counts and HTML escaping');
