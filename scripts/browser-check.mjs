import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base='http://127.0.0.1:4322';
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],failed=[];
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push({url:r.url(),status:r.status()});});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.screenshot({path:'artifacts/home-'+(mobile?'mobile':'desktop')+'.png'});
 const title=await page.locator('#slide-title').textContent();
 await page.getByRole('button',{name:'Foto successiva',exact:true}).click();
 await page.waitForFunction(t=>document.querySelector('#slide-title').textContent!==t,title);
 await page.getByRole('button',{name:'Apri menu',exact:true}).click();
 assert(await page.locator('#navigation').evaluate(e=>e.open));
 await page.screenshot({path:'artifacts/menu-'+(mobile?'mobile':'desktop')+'.png'});
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#navigation').evaluate(e=>e.open),false);
 await page.goto(base+'/collection/164-2/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.collection-card').count(),4);
 await page.screenshot({path:'artifacts/gallery-'+(mobile?'mobile':'desktop')+'.png',fullPage:true});
 for(const [slug,count] of [['world',65],['events',14],['work',30],['portraiture',52]]){
  await page.goto(base+'/album/'+slug+'/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-photo]').count(),count);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
  await page.locator('[data-photo]').first().click();
  assert(await page.locator('#lightbox').evaluate(e=>e.open));
  await page.waitForFunction(()=>{const i=document.querySelector('#lightbox-image');return i.complete&&i.naturalWidth>0;});
  await page.getByRole('button',{name:'Fotografia successiva',exact:true}).click();
  assert((await page.locator('#lightbox-count').textContent()).startsWith('02'));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#lightbox').evaluate(e=>e.open),false);
  if(slug==='world')await page.screenshot({path:'artifacts/world-'+(mobile?'mobile':'desktop')+'.png'});
 }
 await page.goto(base+'/about/',{waitUntil:'networkidle'});
 await page.screenshot({path:'artifacts/about-'+(mobile?'mobile':'desktop')+'.png',fullPage:true});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'About overflow');
 await context.close();
}
await browser.close();
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
fs.writeFileSync('artifacts/browser-check.json',JSON.stringify({desktop:true,mobile:true,errors,failed},null,2));
console.log('Desktop/mobile: navigation, slideshow, 4 galleries, lightbox and about passed.');
