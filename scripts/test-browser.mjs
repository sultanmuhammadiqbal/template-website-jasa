import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseURL = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const widths = [320, 375, 768, 1024, 1440];

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(baseURL, { waitUntil: 'load' });

    const metrics = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      sections: ['layanan', 'portofolio', 'studi-kasus'].every(id => {
        const node = document.getElementById(id);
        return node && node.getBoundingClientRect().width > 0;
      }),
      cards: [...document.querySelectorAll('.service-card,.project-card')]
        .every(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right <= innerWidth + 2 && r.left >= -2; }),
      portfolioColumns: getComputedStyle(document.querySelector('.portfolio-grid')).gridTemplateColumns.split(' ').length,
    }));
    assert.ok(metrics.documentWidth <= metrics.viewportWidth + 2, 'Horizontal overflow at ' + width + 'px: ' + JSON.stringify(metrics));
    assert.ok(metrics.sections, 'Missing visible section at ' + width + 'px');
    assert.ok(metrics.cards, 'Card outside viewport at ' + width + 'px');
    if (width <= 600) assert.equal(metrics.portfolioColumns, 1, 'Expected single column at ' + width + 'px');

    await page.locator('a[href="#portofolio"]').first().click();
    assert.equal(new URL(page.url()).hash, '#portofolio', 'Portfolio anchor failed at ' + width + 'px');

    if (width <= 760) {
      const toggle = page.locator('[data-menu-toggle]');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Mobile menu should open');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Escape should close menu');
    }
    console.log('PASS browser viewport ' + width + 'px: no overflow, navigation and cards');
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  await page.goto(baseURL);
  const contrast = await page.locator('.case-back').evaluate(el => {
    const css = getComputedStyle(el);
    const bg = getComputedStyle(document.querySelector('.case-study-section')).backgroundColor;
    function relative(rgb) {
      const parts = rgb.match(/[\\d.]+/g).slice(0, 3).map(v => Number(v)/255);
      return parts.map(v => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4)
        .reduce((s,v,i) => s + v*[0.2126,0.7152,0.0722][i],0);
    }
    const before = css.color;
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles:true }));
    return { before, bg };
  });
  await page.locator('.case-back').hover();
  const hoverColor = await page.locator('.case-back').evaluate(el => getComputedStyle(el).color);
  function luminance(rgb) {
    const parts = rgb.match(/[\\d.]+/g).slice(0, 3).map(v => Number(v)/255);
    return parts.map(v => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4)
      .reduce((s,v,i) => s + v*[0.2126,0.7152,0.0722][i],0);
  }
  const a = luminance(hoverColor), b = luminance(contrast.bg);
  const ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  assert.ok(ratio >= 4.5, 'Case-study link hover contrast below WCAG AA: ' + ratio.toFixed(2));
  console.log('PASS hover contrast ' + ratio.toFixed(2) + ':1');
  await page.close();
} finally {
  await browser.close();
}
