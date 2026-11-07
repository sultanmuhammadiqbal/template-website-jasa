import { readFile } from 'node:fs/promises';
const reportPath = process.argv[2] || 'artifacts/lighthouse.json';
const label = process.argv[3] || 'LIGHTHOUSE';
if (!/^artifacts\/[a-z0-9-]+\.json$/.test(reportPath)) throw new Error('Report path must be a JSON file inside artifacts/');
const report = JSON.parse(await readFile(new URL('../' + reportPath, import.meta.url), 'utf8'));
if (process.argv[2] && !new URL(report.finalUrl || report.requestedUrl).pathname.startsWith('/case-study/')) {
  throw new Error('Expected a dedicated /case-study/ Lighthouse report');
}
for (const id of ['performance','accessibility','best-practices','seo']) {
  const score = report.categories?.[id]?.score;
  console.log(label + ' ' + id + ': ' + (score == null ? 'unavailable' : Math.round(score * 100)));
}
for (const id of ['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time']) {
  console.log(label + ' METRIC ' + id + ': ' + (report.audits?.[id]?.displayValue || 'unavailable'));
}
console.log(label + ' SEO score reflects the intentionally noindex demo.');
