import { readFile } from 'node:fs/promises';
const report = JSON.parse(await readFile(new URL('../artifacts/lighthouse.json', import.meta.url), 'utf8'));
for (const id of ['performance','accessibility','best-practices','seo']) {
  const score = report.categories?.[id]?.score;
  console.log('LIGHTHOUSE ' + id + ': ' + (score == null ? 'unavailable' : Math.round(score * 100)));
}
for (const id of ['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time']) {
  console.log('METRIC ' + id + ': ' + (report.audits?.[id]?.displayValue || 'unavailable'));
}
console.log('SEO score reflects the intentionally noindex demo.');
