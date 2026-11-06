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
custom.portfolio.items=[{title:'Studio Bunga',category:'Hunian · Konsep demo',description:'Ruang fleksibel.',art:'residence',artAlt:'Ilustrasi kamar sederhana',featured:true,caseStudy:true}];
custom.faq.items=[{question:'Apa kabar?',answer:'Baik.'}];
custom.theme.accent='#aabbcc';
custom.theme.dark='#112233';
custom.contact.heading='Mari mengobrol.';
const rendered=renderSite(sourceHTML,sourceCSS,custom);
assert.match(rendered.html,/<h1[^>]*>Studio Arunika<\/h1>/);
assert.match(rendered.html,/Ruang baru untuk cerita baru\./);
assert.match(rendered.html,/Mari mengobrol\./);
assert.equal((rendered.html.match(/class="service-card"/g)||[]).length,1);
assert.equal((rendered.html.match(/class="project-card(?: project-featured)?"/g)||[]).length,1);
assert.equal((rendered.html.match(/<details class="faq-item">/g)||[]).length,1);
assert.match(rendered.css,/--accent-configured:#aabbcc/);
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
assert.throws(()=>renderSite(sourceHTML,sourceCSS,invalidArt),/Unknown art style/);
console.log('PASS A1: default render, brand/content/theme overrides, variable card counts and HTML escaping');
