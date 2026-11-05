const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
for(const [rm,kill,tab] of [['reduce',true,'character'],['no-preference',false,'background']]){const pg=await b.newPage({reducedMotion:rm});pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/site/prompt-maker.html');
if(kill) await pg.addStyleTag({content:'*, *::after, *::before {animation:none !important; transition:none !important}'});
for(const c of await pg.$$('[data-pledge]')) await c.check();
await pg.click('#wiz-next');await pg.click('#tab-'+tab);await pg.click('#wiz-next');
await pg.click('.preset >> nth=0');await pg.click('#wiz-next');
for(const f of await pg.$$('[data-screen="4"]:not([hidden]) .f input[type=text], [data-screen="4"]:not([hidden]) .f textarea, [data-screen="4"]:not([hidden]) .f input:not([type])')){ if(await f.isVisible()) await f.type('작은 별'); }
await pg.click('#wiz-next');await pg.click('#wiz-next');
const samp=[];for(let i=0;i<5;i++){samp.push(await pg.$eval('#copy',e=>[e.className,e.style.boxShadow.slice(0,40),getComputedStyle(e,'::after').left]));await pg.waitForTimeout(330);if(i==2)await pg.locator('#copy').screenshot({path:'cp-'+tab+'.png'})}
console.log(rm,kill,tab);samp.forEach(x=>console.log('  ',x.join(' | ')));
await pg.click('#copy');await pg.waitForTimeout(200);console.log('  after copy',await pg.$eval('#copy',e=>[e.className,e.style.boxShadow]));
await pg.close()}
console.log(errs);await b.close()})();
