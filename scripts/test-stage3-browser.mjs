import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const base = 'http://127.0.0.1:4173';

try {
  for (const width of [320, 375, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport:{width,height:900}, reducedMotion:'reduce' });
    await page.goto(base);
    const metrics = await page.evaluate(() => ({
      width:document.documentElement.scrollWidth,
      client:document.documentElement.clientWidth,
      faq:document.querySelector('#faq').getBoundingClientRect().width,
      contact:document.querySelector('#kontak').getBoundingClientRect().width
    }));
    assert.ok(metrics.width <= metrics.client + 2, 'Horizontal overflow at ' + width + ': ' + JSON.stringify(metrics));
    assert.ok(metrics.faq > 0 && metrics.contact > 0, 'FAQ/contact missing at ' + width);
    const first = page.locator('.faq-item').first();
    assert.equal(await first.getAttribute('open'), null);
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert.ok(await first.evaluate(el => el.open), 'Enter should open FAQ at ' + width);
    await page.keyboard.press('Enter');
    assert.equal(await first.evaluate(el => el.open), false, 'Enter should close FAQ at ' + width);
    assert.equal(await page.locator('.faq-item').count(),4);
    assert.equal(await page.locator('[data-contact-link="whatsapp"]').isVisible(),false);
    assert.equal(await page.locator('[data-contact-link="email"]').isVisible(),false);
    assert.ok(await page.locator('[data-contact-unavailable]').isVisible());
    if (width <= 760) {
      await page.locator('[data-menu-toggle]').click();
      await page.locator('[data-menu] a[href="#faq"]').click();
      assert.equal(new URL(page.url()).hash,'#faq');
      assert.equal(await page.locator('[data-menu-toggle]').getAttribute('aria-expanded'),'false');
    }
    console.log('PASS stage 3 viewport '+width+'px: FAQ, contact and mobile navigation');
    await page.close();
  }

  const configured = await browser.newPage();
  await configured.route('**/config/contact.js', route => route.fulfill({
    status:200, contentType:'application/javascript',
    body:'window.RUANG_REKA_CONTACT={whatsapp:{enabled:true,number:"6281234567890",message:"Halo & selamat datang"},email:{enabled:true,address:"kontak@contoh.test",subject:"Diskusi Proyek"}};'
  }));
  await configured.goto(base);
  const wa = configured.locator('[data-contact-link="whatsapp"]');
  const email = configured.locator('[data-contact-link="email"]');
  assert.ok(await wa.isVisible(),'Valid WhatsApp configuration should enable CTA');
  assert.ok(await email.isVisible(),'Valid email configuration should enable CTA');
  assert.equal(await wa.getAttribute('href'),'https://wa.me/6281234567890?text=Halo%20%26%20selamat%20datang');
  assert.equal(await email.getAttribute('href'),'mailto:kontak@contoh.test?subject=Diskusi%20Proyek');
  assert.equal(await wa.getAttribute('rel'),'noopener noreferrer');
  await configured.close();
  console.log('PASS enabled contacts: validated encoded URLs');

  const invalid = await browser.newPage();
  await invalid.route('**/config/contact.js', route => route.fulfill({
    status:200, contentType:'application/javascript',
    body:'window.RUANG_REKA_CONTACT={whatsapp:{enabled:true,number:"invalid"},email:{enabled:true,address:"invalid"}};'
  }));
  await invalid.goto(base);
  assert.equal(await invalid.locator('[data-contact-link="whatsapp"]').isVisible(),false);
  assert.equal(await invalid.locator('[data-contact-link="email"]').isVisible(),false);
  await invalid.close();
  console.log('PASS invalid contacts: no active CTA');
} finally {
  await browser.close();
}
