import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const listeners = new Map();
const makeElement = () => ({
  inert: false, attributes: {}, handlers: {},
  classList: { values: new Set(), add(k) { this.values.add(k); }, remove(k) { this.values.delete(k); }, toggle(k, on) { if (on) this.add(k); else this.remove(k); }, contains(k) { return this.values.has(k); } },
  addEventListener(k, fn) { this.handlers[k] = fn; },
  getAttribute(k) { return this.attributes[k]; },
  setAttribute(k, v) { this.attributes[k] = v; },
  focus() { document.activeElement = this; },
});
const header = makeElement(), main = makeElement(), menu = makeElement(), toggle = makeElement(), skip = makeElement();
const links = Array.from({length:4}, makeElement);
menu.querySelector = () => links[0];
menu.querySelectorAll = () => links;
toggle.setAttribute('aria-expanded','false');
const lookup = {'[data-header]':header, main, '[data-menu]':menu, '[data-menu-toggle]':toggle, '.skip-link':skip};
const document = { body: makeElement(), activeElement:null, querySelector:k=>lookup[k], addEventListener:(k,fn)=>listeners.set(k,fn) };
const media = {matches:true, addEventListener(k,fn){this.onchange=fn;}};
const window = { matchMedia:()=>media, scrollY:0, addEventListener(){} };
vm.runInNewContext(readFileSync(new URL('../script.js',import.meta.url),'utf8'),{document,window});
const test=(name,fn)=>{fn(); console.log('PASS '+name);};
test('closed mobile menu is inert',()=>assert.equal(menu.inert,true));
toggle.handlers.click();
test('open menu exposes links and blocks background',()=>{assert.equal(menu.inert,false);assert.equal(main.inert,true);assert.equal(skip.inert,true);assert.equal(document.activeElement,links[0]);});
const key=(key,shiftKey=false)=>{const e={key,shiftKey,prevented:false,preventDefault(){this.prevented=true;}};listeners.get('keydown')(e);return e;};
links[3].focus();
test('Tab wraps from last link to toggle',()=>{assert.equal(key('Tab').prevented,true);assert.equal(document.activeElement,toggle);});
test('Shift Tab wraps from toggle to last link',()=>{assert.equal(key('Tab',true).prevented,true);assert.equal(document.activeElement,links[3]);});
test('Escape closes menu and restores focus',()=>{key('Escape');assert.equal(menu.inert,true);assert.equal(main.inert,false);assert.equal(skip.inert,false);assert.equal(document.activeElement,toggle);});
toggle.handlers.click();media.matches=false;media.onchange();
test('desktop transition closes menu and enables navigation',()=>{assert.equal(menu.inert,false);assert.equal(toggle.getAttribute('aria-expanded'),'false');});
media.matches=true;media.onchange();
test('returning to mobile disables hidden navigation',()=>assert.equal(menu.inert,true));
console.log('7 interaction checks passed');
