import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const browser=await chromium.launch({headless:true});
const root='http://127.0.0.1:4173/configurator/';
await mkdir(new URL('../artifacts/screenshots/',import.meta.url),{recursive:true});
try{
  for(const width of [375,1280]){
    const context=await browser.newContext({viewport:{width,height:880},acceptDownloads:true,reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(root,{waitUntil:'load'});
    assert.equal(response.status(),200);
    await page.getByText('Konfigurasi valid', {exact:false}).waitFor();
    assert.equal(await page.locator('#export-button').isEnabled(),true);
    assert.equal(await page.locator('#preview-frame').contentFrame().locator('#hero-title').textContent(),'Ruang Reka');
    const computed=await page.locator('#preview-frame').contentFrame().locator('#studi-kasus').evaluate(()=>({section:getComputedStyle(document.querySelector('#studi-kasus')).backgroundColor, dark:getComputedStyle(document.documentElement).getPropertyValue('--dark'),darkConfigured:getComputedStyle(document.documentElement).getPropertyValue('--dark-configured'),styles:document.querySelectorAll('style').length,body:getComputedStyle(document.body).backgroundColor}));
    assert.equal(computed.darkConfigured,'#262d26');
    assert.equal(computed.section,'rgb(38, 45, 38)','Preview must retain configured dark backgrounds');
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[],'Configurator WCAG errors at '+width);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert.ok(overflow<=2,'Configurator horizontal overflow '+width);
    await page.screenshot({path:new URL('../artifacts/screenshots/configurator-'+width+'.png',import.meta.url).pathname,fullPage:true,animations:'disabled'});
    if(width===1280){
      const brand=page.locator('#input-brand-name');
      await brand.fill('Studio Arunika $&');
      await page.locator('#preview-frame').contentFrame().locator('#hero-title').getByText('Studio Arunika $&').waitFor();
      const accent=page.locator('#input-theme-accent');
      await accent.fill('#d4ef7d');
      await page.getByText('Konfigurasi valid',{exact:false}).waitFor();
      const bad=page.locator('#input-theme-ink');
      await bad.fill('#f4f1eb');
      await page.getByText('WCAG contrast',{exact:false}).waitFor();
      assert.equal(await page.locator('#export-button').isDisabled(),true);
      await bad.fill('#171916');
      await page.getByText('Konfigurasi valid',{exact:false}).waitFor();
      const services=page.locator('details[data-section="services"]');
      await services.locator('summary').click();
      await services.getByRole('button',{name:'+ Tambah layanan'}).click();
      const cards=services.locator('.item-card');
      assert.equal(await cards.count(),4);
      const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export-button').click()]);
      assert.equal(download.suggestedFilename(),'site.json');
      const file=await download.path();
      const {readFile}=await import('node:fs/promises');
      const data=JSON.parse(await readFile(file,'utf8'));
      assert.equal(data.brand.name,'Studio Arunika $&');
      assert.equal(data.theme.accent,'#d4ef7d');
      assert.equal(data.services.items.length,4);
      assert.equal(data.portfolio.items.filter(x=>x.caseStudy).length,1);
      assert.equal(data.caseStudy.name,data.portfolio.items.find(x=>x.caseStudy).title);
    }
    assert.deepEqual(errors,[],'Runtime errors at '+width);
    console.log('PASS configurator '+width+'px: live preview, WCAG, responsive'+(width===1280?', editor changes, invalid contrast and JSON export':''));
    await context.close();
  }
}finally{await browser.close()}
