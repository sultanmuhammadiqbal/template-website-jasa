import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch({ headless:true });
const widths = [320, 375, 768, 1024, 1440];
await mkdir(new URL('../artifacts/screenshots/', import.meta.url), { recursive:true });
const issues = [];
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport:{ width, height:900 }, reducedMotion:'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto('http://127.0.0.1:4173/', { waitUntil:'load' });
    assert.equal(response.status(), 200, 'Homepage should serve HTTP 200');
    await page.locator('.hero-image').evaluate(img => img.decode());
    const layout = await page.evaluate(() => ({
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth,
      imageLoaded:document.querySelector('.hero-image').naturalWidth > 0,
      headings:document.querySelectorAll('h1').length,
      faq:document.querySelectorAll('.faq-item').length
    }));
    assert.ok(layout.scrollWidth <= layout.clientWidth + 2, 'Horizontal overflow at '+width);
    assert.ok(layout.imageLoaded, 'Hero image missing at '+width);
    assert.equal(layout.headings,1);
    assert.equal(layout.faq,4);
    assert.deepEqual(errors, [], 'Runtime errors on '+width+'px');
    const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    if (axe.violations.length) {
      issues.push(...axe.violations.map(v => width+'px '+v.id+' ('+v.impact+'): '+v.nodes.map(n=>n.target.join(',')).join('; ')));
    }
    await page.screenshot({ path:new URL('../artifacts/screenshots/home-'+width+'.png', import.meta.url).pathname, fullPage:true, animations:'disabled' });
    console.log('PASS viewport '+width+'px: image, headings, FAQ, runtime and screenshot; axe violations: '+axe.violations.length);
    await context.close();
  }
} finally {
  await browser.close();
}
assert.deepEqual(issues, [], 'WCAG automated violations:\n'+issues.join('\n'));
console.log('PASS WCAG automated axe checks at all viewports');
