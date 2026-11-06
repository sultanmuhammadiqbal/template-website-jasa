import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const tests = [];
const check = (name, fn) => tests.push([name, fn]);

check('all primary navigation anchors exist', () => {
  for (const href of html.matchAll(/href="#([^"]+)"/g)) {
    assert.match(html, new RegExp('id="' + href[1] + '"'), 'missing section: ' + href[1]);
  }
});
check('services section has a descriptive heading', () => {
  assert.match(html, /<section[^>]+id="layanan"[^>]+aria-labelledby="layanan-title"/);
  assert.match(html, /<h2 id="layanan-title">/);
});
check('exactly three sample services', () => {
  assert.equal((html.match(/class="service-card"/g) ?? []).length, 3);
});
check('three portfolio projects have headings and descriptions', () => {
  assert.equal((html.match(/class="project-card(?: project-featured)?"/g) ?? []).length, 3);
  assert.equal((html.match(/class="project-type"/g) ?? []).length, 3);
  assert.equal((html.match(/class="project-info"/g) ?? []).length, 3);
});
check('case study has all narrative stages', () => {
  assert.match(html, /id="studi-kasus"/);
  for (const heading of ['Tantangan', 'Pendekatan', 'Hasil konsep']) assert.ok(html.includes('<h3>' + heading + '</h3>'));
});
check('demo projects clearly labeled as fictional', () => {
  assert.ok((html.match(/Konsep demo/g) ?? []).length >= 3);
  assert.match(html, /Fiktif · untuk demonstrasi/);
  assert.match(html, /Bukan proyek klien sungguhan/);
});
check('portfolio illustrations include accessible text', () => {
  assert.equal((html.match(/class="project-art[^"]*" role="img" aria-label="/g) ?? []).length, 3);
});
check('responsive columns collapse on mobile', () => {
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /\.services-grid, \.portfolio-grid \{ grid-template-columns:1fr; \}/);
});
check('reduced motion remains supported', () => assert.match(css, /prefers-reduced-motion: reduce/));

check('unfinished projects are explicitly non-interactive', () => {
  assert.equal((html.match(/class="project-note"/g) ?? []).length, 2);
  assert.equal((html.match(/class="project-link"/g) ?? []).length, 1);
  assert.match(html, /Studi kasus lengkap menyusul/);
});
check('future stage navigation does not mislabel FAQ', () => {
  assert.match(html, /href="#tahap-berikutnya">Berikutnya<\/a>/);
  assert.doesNotMatch(html, /href="#tahap-berikutnya">FAQ<\/a>/);
});
check('case study hover uses accessible accent color', () => {
  assert.match(css, /\.case-back:hover \{ color:var\(--accent\); \}/);
});

let failures = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log('PASS ' + name); }
  catch (error) { failures++; console.error('FAIL ' + name + ': ' + error.message); }
}
console.log(tests.length - failures + '/' + tests.length + ' stage 2 checks passed');
if (failures) process.exitCode = 1;
