const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h,tag] of [[1280,900,'d'],[390,844,'m']]){
const pg=await b.newPage({viewport:{width:w,height:h}});pg.on('pageerror',e=>errs.push(tag+':'+e.message));
await pg.goto('file://'+process.cwd()+'/site/prompt-maker.html');
const scr=()=>pg.$eval('body',b=>b.dataset.screen);
for(const c of await pg.$$('[data-pledge]')) await c.check();
await pg.click('#wiz-next');await pg.click('#tab-character');await pg.click('#wiz-next');
await pg.click('.preset >> nth=0');await pg.click('#wiz-next');
const fields=await pg.$$('[data-screen="4"]:not([hidden]) .f input[type=text], [data-screen="4"]:not([hidden]) .f textarea, [data-screen="4"]:not([hidden]) .f input:not([type])');
for(const f of fields){ if(await f.isVisible()) await f.type('작은 별'); }
await pg.click('#wiz-next');const s5=await scr();await pg.click('#wiz-next');const s6=await scr();
await pg.click('#copy').catch(()=>{});
await pg.click('#wiz-next');const s7=await scr();const nx=await pg.$eval('#wiz-next',e=>e.textContent);
await pg.click('#fu-fix');await pg.type('#fu-fix-text','목도리를 더 길게');const slip=await pg.$eval('#fu-slip',e=>e.textContent);
await pg.click('#wiz-next');const s2=await scr();
console.log(tag,{s5,s6,s7,nx,slip,s2,msg:await pg.$eval('#wiz-msg',e=>!e.hidden&&e.textContent)});await pg.close();}
console.log(errs);await b.close();})();
